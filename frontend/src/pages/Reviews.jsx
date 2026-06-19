import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AiFillStar } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import Container from "../components/Container";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import ListingCard from "../components/ListingCard";
import MuiModal from "../components/Modal";

const FALLBACK_IMAGE =
  "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp";

const Reviews = () => {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editStarCount, setEditStarCount] = useState(5);
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const userId = auth?.user?._id || auth?.user?.id;

  const {
    data: reviews = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userReviews", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axiosPrivate.get("/review/reviews");
      if (!Array.isArray(res.data?.data)) return [];

      return res.data.data.map((review) => {
        const company = review?.company || {};
        return {
          ...review,
          company: {
            ...company,
            companyTitle:
              company.companyTitle || company.companyName || "Title",
          },
        };
      });
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });

  const {
    data: eventReviews = [],
    isLoading: isEventReviewsLoading,
    isError: isEventReviewsError,
    error: eventReviewsError,
  } = useQuery({
    queryKey: ["userEventReviews", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axiosPrivate.get("/event-reviews/my");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });

  const reviewedListings = reviews.reduce((acc, review) => {
    const company = review?.company;

    if (!company?._id || acc.some((item) => item._id === company._id)) {
      return acc;
    }

    acc.push({
      ...company,
      review,
    });
    return acc;
  }, []);

  const eventReviewCards = eventReviews.map((review) => {
    const event = review?.event || {};
    const eventName = event.eventName || review.eventName || "Event";

    return {
      ...review,
      event,
      eventName,
      cardTitle: eventName,
      cardImage: event.mainImage || FALLBACK_IMAGE,
      cardLocation: event.destination || review.state || "Unknown",
      cardType: event.category || "Event",
    };
  });

  const formattedReviewDate = useMemo(() => {
    if (!selectedReview?.createdAt) return "";

    const parsedDate = new Date(selectedReview.createdAt);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedReview]);

  const updateEventReviewMutation = useMutation({
    mutationFn: async ({ reviewId, starCount, description }) => {
      const res = await axiosPrivate.patch(`/event-reviews/${reviewId}`, {
        starCount,
        description,
      });
      return res.data?.review;
    },
    onSuccess: (updatedReview) => {
      const mergedReview = {
        ...selectedReview,
        ...updatedReview,
        event: selectedReview?.event,
        status: "pending",
      };

      setSelectedReview(mergedReview);
      setIsEditingReview(false);
      setEditError("");
      queryClient.invalidateQueries({ queryKey: ["userEventReviews", userId] });
    },
    onError: (mutationError) => {
      setEditError(
        mutationError?.response?.data?.message ||
          "Failed to update this review.",
      );
    },
  });

  const openReviewModal = (review) => {
    setSelectedReview(review || null);
    setEditStarCount(review?.starCount || 5);
    setEditDescription(review?.description || "");
    setIsEditingReview(false);
    setEditError("");
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
    setIsEditingReview(false);
    setEditError("");
  };
  const reviewStatus = (selectedReview?.status || "pending").toLowerCase();
  const isSelectedEventReview = Boolean(
    selectedReview?._id &&
    (selectedReview?.event ||
      selectedReview?.eventId ||
      selectedReview?.eventName),
  );
  const modalTitle =
    selectedReview?.eventName ||
    selectedReview?.company?.companyName ||
    selectedReview?.company?.companyTitle ||
    "Review";

  const statusBadgeStyles = {
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const handleStartEdit = () => {
    setEditStarCount(selectedReview?.starCount || 5);
    setEditDescription(selectedReview?.description || "");
    setIsEditingReview(true);
    setEditError("");
  };

  const handleCancelEdit = () => {
    setEditStarCount(selectedReview?.starCount || 5);
    setEditDescription(selectedReview?.description || "");
    setIsEditingReview(false);
    setEditError("");
  };

  const handleSubmitEdit = (event) => {
    event.preventDefault();

    if (!selectedReview?._id) return;

    if (!editDescription.trim()) {
      setEditError("Review details are required.");
      return;
    }

    updateEventReviewMutation.mutate({
      reviewId: selectedReview._id,
      starCount: editStarCount,
      description: editDescription,
    });
  };

  if (isError || isEventReviewsError) {
    return (
      <Container padding={false}>
        <div className="py-8 min-h-screen text-center text-red-500">
          {error?.response?.data?.message ||
            eventReviewsError?.response?.data?.message ||
            "Failed to load your reviews."}
        </div>
      </Container>
    );
  }

  return (
    <Container padding={false}>
      <div className="p-6 min-h-screen bg-white rounded-xl ">
        <h1 className="text-xl font-semibold mb-6 text-secondary-dark">
          My Reviews - Nomad Listings
        </h1>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : reviewedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {reviewedListings.map((item) => (
              <ListingCard
                key={item._id}
                item={item}
                showVertical={true}
                imageOverlayLabel="View Review"
                handleNavigation={() => openReviewModal(item.review)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 border border-dotted rounded-lg p-6">
            You haven’t reviewed any listings yet.
          </div>
        )}

        <hr className="my-10 border-gray-200" />

        <div>
          <h2 className="text-xl font-semibold mb-6 text-secondary-dark">
            My Reviews - Events
          </h2>

          {isEventReviewsLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : eventReviewCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {eventReviewCards.map((review) => (
                <button
                  key={review._id}
                  type="button"
                  className="flex w-full flex-col gap-2 rounded-lg bg-white text-left transition-all"
                  onClick={() => openReviewModal(review)}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
                    <img
                      src={review.cardImage}
                      alt={review.cardTitle}
                      className="h-full w-full object-cover transition-all hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="rounded-full bg-black/55 px-3 py-1 text-sm font-medium text-white">
                        View Review
                      </span>
                    </div>
                    <div className="pointer-events-none absolute inset-x-2 bottom-2 flex justify-end">
                      <div className="rounded-lg bg-white px-2">
                        <span className="text-xs font-normal leading-normal">
                          {review.cardType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex h-[25%] flex-col gap-1 px-4 pr-1">
                    <p
                      className="truncate text-xs font-semibold md:text-sm"
                      title={review.cardTitle}
                    >
                      {review.cardTitle}
                    </p>
                    <div className="flex w-full items-center justify-between">
                      <p
                        className="truncate text-xs font-medium text-gray-600 md:text-sm"
                        title={review.cardLocation}
                      >
                        {review.cardLocation}
                      </p>
                      <div className="flex items-center gap-1 text-gray-600">
                        <AiFillStar size={14} className="md:h-4 md:w-4" />
                        <p className="text-xs font-medium text-gray-600 md:text-sm">
                          ({review.starCount || 0})
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 border border-dotted rounded-lg p-6">
              You haven't reviewed any events yet.
            </div>
          )}
        </div>
      </div>

      <MuiModal
        open={isModalOpen}
        onClose={closeReviewModal}
        title={modalTitle}
      >
        <form className="flex flex-col gap-6" onSubmit={handleSubmitEdit}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 shrink-0 rounded-full bg-[#ff5757] flex items-center justify-center text-white text-3xl font-medium uppercase">
                {(selectedReview?.name || "A").charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold text-secondary-dark truncate">
                  {selectedReview?.name || "Anonymous"}
                </p>
                {formattedReviewDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formattedReviewDate}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isSelectedEventReview && (
                <button
                  type="button"
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isEditingReview
                      ? "border-sky-200 bg-sky-100 text-sky-700"
                      : "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={handleStartEdit}
                  disabled={updateEventReviewMutation.isPending}
                >
                  <FiEdit2 size={13} />
                  Edit
                </button>
              )}
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize ${
                  statusBadgeStyles[reviewStatus] || statusBadgeStyles.pending
                }`}
              >
                {reviewStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-4xl">
            {Array.from({ length: 5 }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={`leading-none ${
                  isEditingReview ? "cursor-pointer" : "cursor-default"
                }`}
                onClick={() => {
                  if (isEditingReview) setEditStarCount(index + 1);
                }}
                disabled={
                  !isEditingReview || updateEventReviewMutation.isPending
                }
                aria-label={`Set ${index + 1} star rating`}
              >
                <AiFillStar
                  className={
                    index <
                    (isEditingReview
                      ? editStarCount
                      : selectedReview?.starCount || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>

          <div className="pt-5 border-t border-borderGray">
            {isEditingReview ? (
              <textarea
                className="min-h-28 w-full rounded-lg border border-borderGray px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                disabled={updateEventReviewMutation.isPending}
              />
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                {selectedReview?.description || "No review details available."}
              </p>
            )}
          </div>

          {editError && <p className="text-sm text-red-500">{editError}</p>}

          {isEditingReview && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                onClick={handleCancelEdit}
                disabled={updateEventReviewMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-primary-blue hover:bg-primary-light px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={updateEventReviewMutation.isPending}
              >
                {updateEventReviewMutation.isPending
                  ? "Submitting..."
                  : "Submit"}
              </button>
            </div>
          )}
        </form>
      </MuiModal>
    </Container>
  );
};

export default Reviews;
