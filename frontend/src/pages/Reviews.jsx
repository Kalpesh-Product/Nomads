import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AiFillStar } from "react-icons/ai";
import Container from "../components/Container";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import ListingCard from "../components/ListingCard";
import MuiModal from "../components/Modal";

const FALLBACK_IMAGE =
  "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp";

const Reviews = () => {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openReviewModal = (review) => {
    setSelectedReview(review || null);
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };
  const reviewStatus = (selectedReview?.status || "pending").toLowerCase();
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
        <div className="flex flex-col gap-6">
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

            <span
              className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize shrink-0 ${
                statusBadgeStyles[reviewStatus] || statusBadgeStyles.pending
              }`}
            >
              {reviewStatus}
            </span>
          </div>

          <div className="flex items-center gap-3 text-4xl">
            {Array.from({ length: 5 }).map((_, index) => (
              <AiFillStar
                key={index}
                className={
                  index < (selectedReview?.starCount || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>

          <div className="pt-5 border-t border-borderGray">
            <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
              {selectedReview?.description || "No review details available."}
            </p>
          </div>
        </div>
      </MuiModal>
    </Container>
  );
};

export default Reviews;
