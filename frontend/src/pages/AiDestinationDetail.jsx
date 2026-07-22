import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { CalendarDays, MapPin, Star } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MuiModal from "../components/Modal";
import SecondaryButton from "../components/SecondaryButton";
import { annualEvents, popularVenues } from "../data/aiDestinationHighlights";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import axios from "../utils/axios";
import { noOnlyWhitespace } from "../utils/validators";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

const AiDestinationDetail = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId, venueId, restaurantId } = useParams();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const fallback = type === "event" ? annualEvents[0] : popularVenues[0];
  const item = location.state?.item || fallback;
  const isEvent = type === "event";
  const isRestaurant = type === "restaurant";
  const isReviewEnabled = !isRestaurant;
  const venueMapsLink =
    typeof item.googleMapsLink === "string" ? item.googleMapsLink.trim() : "";
  const venueDirectionHref =
    venueMapsLink ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      item.address || item.title,
    )}`;
  const reviewTargetId = isEvent ? eventId : venueId || restaurantId;
  const reviewEndpoint = isEvent ? "/event-reviews" : "/place-reviews";
  const reviewIdParam = isEvent ? "eventId" : "placeId";
  const userId = auth?.user?._id || auth?.user?.id;
  const reviewerName = auth?.user?.fullName?.trim() || "";

  const handleImageOpen = (imageUrl) => {
    if (imageUrl) {
      setActiveImage(imageUrl);
    }
  };

  const handleImageClose = () => {
    setActiveImage(null);
  };

  const goToHostsContentCopyright = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://host.localhost:5173/content-and-copyright";
    } else {
      window.location.href = "https://host.wono.co/content-and-copyright";
    }
  };

  const { data: reviews = [], isPending: isReviewsLoading } = useQuery({
    queryKey: [
      isEvent ? "approvedEventReviews" : "approvedPlaceReviews",
      reviewTargetId,
    ],
    queryFn: async () => {
      const response = await axios.get(reviewEndpoint, {
        params: { [reviewIdParam]: reviewTargetId },
      });

      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: isReviewEnabled && !!reviewTargetId,
    refetchOnWindowFocus: false,
  });

  const {
    handleSubmit: handleSubmitReview,
    control: reviewControl,
    reset: resetReview,
    formState: { errors: reviewErrors },
  } = useForm({
    defaultValues: {
      starCount: 5,
      description: "",
    },
    mode: "onChange",
  });

  const handleWriteReviewClick = () => {
    if (!userId) {
      navigate("/login");
      return;
    }

    setIsAddReviewOpen(true);
  };

  const { mutate: submitReview, isPending: isSubmittingReview } = useMutation({
    mutationKey: [
      isEvent ? "submitEventReview" : "submitPlaceReview",
      reviewTargetId,
    ],
    mutationFn: async (data) => {
      const response = await axiosPrivate.post(reviewEndpoint, {
        [reviewIdParam]: reviewTargetId,
        name: reviewerName || auth?.user?.name || "Anonymous",
        starCount: Number(data.starCount),
        description: data.description?.trim(),
      });

      return response.data;
    },
    onSuccess: () => {
      showSuccessAlert("Review submitted successfully.");
      resetReview();
      setIsAddReviewOpen(false);
    },
    onError: (error) => {
      showErrorAlert(
        error?.response?.data?.message || "Unable to submit review.",
      );
    },
  });

  return (
    <main className="mx-auto w-full max-w-[75rem] px-4 pb-8 lg:px-0">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-black md:text-title">
          {item.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm md:text-base">
          <p className="flex items-center gap-2">
            {isEvent ? <CalendarDays size={17} /> : <MapPin size={17} />}
            {isEvent ? item.subtitle : `Address: ${item.address}`}
          </p>
          {!isEvent && (
            <a
              href={venueDirectionHref}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600 underline"
            >
              Get Direction
            </a>
          )}
        </div>
      </header>

      <div className="h-64 w-full overflow-hidden rounded-2xl md:h-[23rem]">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full cursor-pointer object-cover"
          onClick={() => handleImageOpen(item.image)}
        />
      </div>

      <div className="my-5 grid gap-3 border-b border-gray-200 pb-5 text-base font-semibold md:grid-cols-3 md:text-lg">
        <span>{item.category}</span>
        <span className="flex items-center gap-1 md:justify-center">
          {isEvent ? (
            item.meta
          ) : (
            <>
              <Star size={18} fill="currentColor" /> {item.meta}
            </>
          )}
        </span>
        <span className="md:text-right">
          {isEvent ? item.location : item.region}
        </span>
      </div>

      <section className="space-y-5 border-b border-gray-200 pb-8 text-sm leading-relaxed md:text-base">
        <p>{item.description}</p>
        <p>
          This placeholder details page follows the supplied product-page mock.
          Verified schedules, facilities, directions, and visitor information
          can be connected when the destination content source is available.
        </p>
        <p>
          Explore responsibly, confirm local timings before travelling, and
          check official sources for the latest information.
        </p>
      </section>

      {isReviewEnabled && (
        <section className="py-8">
          <div className="mb-8 text-center">
            <button
              type="button"
              onClick={handleWriteReviewClick}
              className="rounded-full bg-primary-blue px-8 py-3 text-sm font-semibold text-white"
            >
              WRITE A REVIEW
            </button>
          </div>
          <div className="space-y-7">
            {isReviewsLoading ? (
              <p className="text-sm text-gray-500 text-center">
                Loading reviews...
              </p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-gray-500 text-center h-20">
                Share your experience and leave a review.
              </p>
            ) : (
              reviews.map((review) => (
                <article key={review._id}>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-blue text-xs font-semibold text-white">
                      {getInitials(review.name) || "A"}
                    </span>
                    <strong className="text-sm">{review.name}</strong>
                  </div>
                  <div className="mb-1 flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={14}
                        fill={
                          index < review.starCount ? "currentColor" : "none"
                        }
                        className={
                          index < review.starCount
                            ? "text-black"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-sm">{review.description}</p>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      <div className="mt-5 text-[0.5rem] leading-relaxed text-gray-500">
        <p className="mb-2">
          <b>Source:</b> All above content, images and details are placeholder
          content for the supplied mockup and will be replaced with verified
          publicly available information.
        </p>
        <p className="mb-2">
          <b>Content and Copyright Disclaimer:</b> WoNo is a nomad services and
          informational platform that aggregates and presents publicly available
          information about co-working spaces, co-living spaces, serviced
          apartments, hostels, workation spaces, meeting rooms, working cafes
          and related lifestyle or travel services. All such information
          displayed on its platform, including images, brand names, or
          descriptions is shared solely for informational and reference purposes
          to help nomads/users discover and compare global nomad-friendly
          information and services on its central platform.
        </p>
        <p className="mb-2">
          WoNo does not claim ownership of any third-party logos, images,
          descriptions, or business information displayed on the platform. All
          trademarks, brand names, and intellectual property remain the
          exclusive property of their respective owners and platforms. The
          inclusion of third-party information does not imply endorsement,
          partnership, or affiliation unless explicitly stated.
        </p>
        <p className="mb-2">
          The content featured from other websites and platforms on WoNo is not
          used for direct monetization, resale, or advertising gain. WoNo's
          purpose is to inform and connect digital nomads and remote working
          professionals by curating publicly available data in a transparent,
          good-faith manner for the ease of its users and to support and grow
          the businesses who are providing these services with intent to grow
          them and the ecosystem.
        </p>
        <p className="mt-2">
          Read the entire{" "}
          <span
            className="underline text-primary-blue cursor-pointer"
            onClick={goToHostsContentCopyright}
          >
            Content and Copyright
          </span>{" "}
          by clicking the link in our website footer.
        </p>
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
          onClick={handleImageClose}
        >
          <div
            className="relative max-h-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -right-3 -top-3 rounded-full bg-white px-2 py-1 text-sm font-semibold text-gray-700 shadow"
              onClick={handleImageClose}
              aria-label="Close image preview"
            >
              x
            </button>
            <img
              src={activeImage}
              alt="Expanded content"
              className="max-h-[85vh] w-full rounded-lg object-contain shadow-xl"
            />
          </div>
        </div>
      )}

      <MuiModal
        open={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        title={item.title || "Add a review"}
      >
        <form
          onSubmit={handleSubmitReview((data) => submitReview(data))}
          className="grid grid-cols-1 gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-blue text-2xl font-semibold uppercase text-white">
              {(reviewerName || auth?.user?.name || "U")
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)}
            </div>
            <p className="text-card-title font-semibold text-gray-900">
              {reviewerName || auth?.user?.name || "Unknown User"}
            </p>
          </div>

          <Controller
            name="starCount"
            control={reviewControl}
            rules={{
              required: "Star rating is required",
              min: { value: 1, message: "Minimum rating is 1" },
              max: { value: 5, message: "Maximum rating is 5" },
            }}
            render={({ field }) => (
              <div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => field.onChange(rating)}
                      className="transition-transform hover:scale-105"
                      aria-label={`Rate ${rating} star`}
                    >
                      {rating <= field.value ? (
                        <AiFillStar size={56} className="text-yellow-400" />
                      ) : (
                        <AiOutlineStar size={56} className="text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
                {reviewErrors?.starCount?.message ? (
                  <p className="mt-1 text-xs text-red-600">
                    {reviewErrors.starCount.message}
                  </p>
                ) : null}
              </div>
            )}
          />

          <Controller
            name="description"
            control={reviewControl}
            rules={{
              required: "Review details are required",
              validate: { noOnlyWhitespace },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder={`Share details of your own experience at this ${
                  isEvent ? "event" : "place"
                }`}
                fullWidth
                variant="standard"
                size="small"
                multiline
                minRows={3}
                error={!!reviewErrors?.description}
                helperText={reviewErrors?.description?.message}
              />
            )}
          />

          <div className="flex justify-center">
            <SecondaryButton
              title="Submit Review"
              type="submit"
              externalStyles="mt-4"
              disabled={isSubmittingReview}
              isLoading={isSubmittingReview}
            />
          </div>
        </form>
      </MuiModal>
    </main>
  );
};

export default AiDestinationDetail;
