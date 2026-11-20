import { useCallback, useEffect, useRef, useState } from "react";
import "driver.js/dist/driver.css";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { CalendarDays, MapPin, Star } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Map from "../components/Map";
import LeafRatings from "../components/LeafRatings";
import ReviewCard from "../components/ReviewCard";
import renderStars from "../utils/renderStarts";
import ContentShareButton from "../components/ContentShareButton";
import ContentFavoriteButton from "../components/ContentFavoriteButton";
import MuiModal from "../components/Modal";
import SecondaryButton from "../components/SecondaryButton";
import { annualEvents, popularPlaces } from "../data/aiDestinationHighlights";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import axios from "../utils/axios";
import { createDriverGuide } from "../utils/driverGuide";
import { noOnlyWhitespace } from "../utils/validators";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

const PLACE_DETAIL_GUIDE_SEEN_KEY = "wono-place-detail-guide-seen";
const EVENT_DETAIL_GUIDE_SEEN_KEY = "wono-event-detail-guide-seen";
const ARE_GUIDES_TEMPORARILY_DISABLED = false;
const DETAIL_DISCLAIMER_TOUR_SELECTOR =
  '[data-tour="detail-disclaimer-section"]';

const toValidCoordinate = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
};

const normalizePlaceItem = (place = {}) => ({
  ...place,
  id: place._id || place.id || place.serialNumber || place.placeName,
  title: place.placeName || place.title,
  image: place.mainImage || place.image,
  location: place.address || place.location || place.destination,
  lat: place.latitude ?? place.lat,
  lng: place.longitude ?? place.lng,
  meta: place.rating || place.meta,
  category: place.category || place.placeType,
  region: place.destination || place.region,
  description:
    place.shortDescription || place.description || place.sections?.[0]?.content,
  googleMapsLink: place.googleMapsLink || place.googleMap || "",
});

const normalizeEventItem = (event = {}) => ({
  ...event,
  id: event._id || event.id,
  title: event.eventName || event.title,
  image: event.mainImage || event.image,
  location: event.venue || event.destination || event.location,
  meta: event.month || event.meta,
  subtitle: event.month || event.subtitle,
  description: event.shortDescription || event.description,
});

const getStoredPreviewItem = (search = "") => {
  const previewKey = new URLSearchParams(search).get("previewKey");
  if (!previewKey) return null;

  try {
    const storedItem =
      localStorage.getItem(previewKey) || sessionStorage.getItem(previewKey);
    return storedItem ? JSON.parse(storedItem) : null;
  } catch {
    return null;
  }
};

const AiDestinationDetail = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId, placeId, restaurantId } = useParams();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const hasAutoStartedPlaceDetailGuideRef = useRef(false);
  const hasAutoStartedEventDetailGuideRef = useRef(false);
  const isEvent = type === "event";
  const isRestaurant = type === "restaurant";
  const isReviewEnabled = !isRestaurant;
  const fallback = type === "event" ? annualEvents[0] : popularPlaces[0];
  const isPreview = new URLSearchParams(location.search).has("previewKey");
  const { data: eventDetails } = useQuery({
    queryKey: ["eventDetails", eventId],
    queryFn: async () => {
      const response = await axios.get(`/events/${eventId}`);
      return response.data;
    },
    enabled: isEvent && !!eventId && !isPreview,
    refetchOnWindowFocus: false,
  });
  const { data: placeDetails } = useQuery({
    queryKey: ["placeDetails", placeId],
    queryFn: async () => {
      const response = await axios.get(`/places/${placeId}`);
      return response.data;
    },
    enabled: type === "place" && !!placeId,
    refetchOnWindowFocus: false,
  });
  const item = eventDetails
    ? normalizeEventItem(eventDetails)
    : placeDetails
      ? normalizePlaceItem(placeDetails)
      : location.state?.item || getStoredPreviewItem(location.search) || fallback;
  const mapLatitude = toValidCoordinate(item.lat ?? item.latitude);
  const mapLongitude = toValidCoordinate(item.lng ?? item.longitude);
  const hasMapCoordinates =
    type === "place" && mapLatitude !== null && mapLongitude !== null;
  const placeMapsLink =
    typeof item.googleMapsLink === "string" ? item.googleMapsLink.trim() : "";
  const placeDirectionHref =
    placeMapsLink ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      item.address || item.title,
    )}`;
  const reviewTargetId = isEvent ? eventId : placeId || restaurantId;
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

  const ratedReviews = reviews.filter((review) => {
    const rating = Number(review.starCount);
    return Number.isFinite(rating) && rating >= 1 && rating <= 5;
  });
  const averageRating = ratedReviews.length
    ? Number((ratedReviews.reduce((sum, review) => sum + Number(review.starCount), 0) / ratedReviews.length).toFixed(1))
    : null;
  const placeMapLocations = hasMapCoordinates
    ? [
        {
          id: item.id || placeId,
          lat: mapLatitude,
          lng: mapLongitude,
          name: item.title,
          location: item.region || item.location || item.address,
          ratings: item.meta,
          image: item.image,
          googleMap: item.googleMapsLink,
        },
      ]
    : [];

  const startPlaceDetailGuide = useCallback(() => {
    if (typeof window === "undefined" || ARE_GUIDES_TEMPORARILY_DISABLED) {
      return;
    }

    const getVisibleElement = (selector) =>
      Array.from(document.querySelectorAll(selector)).find(
        (element) =>
          element.getClientRects().length > 0 &&
          window.getComputedStyle(element).visibility !== "hidden",
      );

    const guideSteps = [
      {
        selector: '[data-tour="detail-breadcrumb"]',
        popover: {
          title: "Breadcrumb navigation",
          description:
            "Use this path to jump back to the selected region, destination, or listing category.",
          side: "bottom",
          align: "start",
        },
      },
      {
        selector: '[data-tour="detail-meta-section"]',
        popover: {
          title: "Place details",
          description:
            "This section summarizes the place type, rating, and destination area.",
          side: "top",
          align: "center",
        },
      },
      {
        selector: '[data-tour="place-write-review"]',
        popover: {
          title: "Write a review",
          description:
            "Share your experience and help other nomads understand this place.",
          side: "bottom",
          align: "center",
        },
      },
      {
        selector: '[data-tour="place-map-section"]',
        popover: {
          title: "Map location",
          description:
            "Use this map to see where the place is located before visiting.",
          side: "top",
          align: "center",
        },
      },
      {
        selector: '[data-tour="place-get-direction"]',
        popover: {
          title: "Get directions",
          description:
            "Open this place in Google Maps for directions and route planning.",
          side: "left",
          align: "center",
        },
      },
      // Disclaimer guide hidden for now. Uncomment when needed again.
      // {
      //   selector: DETAIL_DISCLAIMER_TOUR_SELECTOR,
      //   popover: {
      //     title: "Content disclaimer",
      //     description:
      //       "This explains how WONO uses public information and links to the full content and copyright policy.",
      //     side: "top",
      //     align: "center",
      //   },
      // },
    ]
      .map(({ selector, popover }) => ({
        element: getVisibleElement(selector),
        popover,
      }))
      .filter((step) => step.element);

    if (!guideSteps.length) {
      return;
    }

    const guide = createDriverGuide({
      showProgress: true,
      allowClose: true,
      animate: true,
      overlayOpacity: 0.55,
      popoverClass: "wono-driver-popover",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      steps: guideSteps,
      guideSeenKey: PLACE_DETAIL_GUIDE_SEEN_KEY,
    });

    guide?.drive();
  }, []);

  const startEventDetailGuide = useCallback(() => {
    if (typeof window === "undefined" || ARE_GUIDES_TEMPORARILY_DISABLED) {
      return;
    }

    const getVisibleElement = (selector) =>
      Array.from(document.querySelectorAll(selector)).find(
        (element) =>
          element.getClientRects().length > 0 &&
          window.getComputedStyle(element).visibility !== "hidden",
      );

    const guideSteps = [
      {
        selector: '[data-tour="detail-breadcrumb"]',
        popover: {
          title: "Breadcrumb navigation",
          description:
            "Use this path to jump back to the selected region, destination, or event category.",
          side: "bottom",
          align: "start",
        },
      },
      {
        selector: '[data-tour="detail-meta-section"]',
        popover: {
          title: "Event details",
          description:
            "This section summarizes the event category, month, and venue information.",
          side: "top",
          align: "center",
        },
      },
      {
        selector: '[data-tour="event-write-review"]',
        popover: {
          title: "Write a review",
          description:
            "Share your experience after attending so other nomads can learn from it.",
          side: "bottom",
          align: "center",
        },
      },
      // Disclaimer guide hidden for now. Uncomment when needed again.
      // {
      //   selector: DETAIL_DISCLAIMER_TOUR_SELECTOR,
      //   popover: {
      //     title: "Content disclaimer",
      //     description:
      //       "This explains how WONO uses public information and links to the full content and copyright policy.",
      //     side: "top",
      //     align: "center",
      //   },
      // },
    ]
      .map(({ selector, popover }) => ({
        element: getVisibleElement(selector),
        popover,
      }))
      .filter((step) => step.element);

    if (!guideSteps.length) {
      return;
    }

    const guide = createDriverGuide({
      showProgress: true,
      allowClose: true,
      animate: true,
      overlayOpacity: 0.55,
      popoverClass: "wono-driver-popover",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      steps: guideSteps,
      guideSeenKey: EVENT_DETAIL_GUIDE_SEEN_KEY,
    });

    guide?.drive();
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      ARE_GUIDES_TEMPORARILY_DISABLED ||
      type !== "place" ||
      !item?.id ||
      hasAutoStartedPlaceDetailGuideRef.current ||
      window.localStorage.getItem(PLACE_DETAIL_GUIDE_SEEN_KEY) === "1"
    ) {
      return undefined;
    }

    hasAutoStartedPlaceDetailGuideRef.current = true;

    const guideDelay = window.setTimeout(() => {
      startPlaceDetailGuide();
    }, 700);

    return () => {
      window.clearTimeout(guideDelay);
    };
  }, [item?.id, startPlaceDetailGuide, type]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      ARE_GUIDES_TEMPORARILY_DISABLED ||
      type !== "event" ||
      !item?.id ||
      hasAutoStartedEventDetailGuideRef.current ||
      window.localStorage.getItem(EVENT_DETAIL_GUIDE_SEEN_KEY) === "1"
    ) {
      return undefined;
    }

    hasAutoStartedEventDetailGuideRef.current = true;

    const guideDelay = window.setTimeout(() => {
      startEventDetailGuide();
    }, 700);

    return () => {
      window.clearTimeout(guideDelay);
    };
  }, [item?.id, startEventDetailGuide, type]);

  return (
    <main className="mx-auto w-full max-w-[80rem] px-4 pb-8 lg:px-0">
      <header className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-black md:text-title">
            {item.title}
          </h1>
          {(type === "place" || isEvent) && !isPreview && (
            <div className="flex shrink-0 items-center gap-2">
              <ContentShareButton title={item.title} url={window.location.href} kind={type} />
              {item._id && <ContentFavoriteButton item={item} kind={type} variant="detail" />}
            </div>
          )}
          {/* Guide button hidden for now. Uncomment when guides should be manually accessible again.
          {type === "place" && (
            <button
              type="button"
              onClick={startPlaceDetailGuide}
              className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-black/75 shadow-sm transition-colors hover:border-sky-500 hover:text-sky-600"
            >
              <HiOutlineQuestionMarkCircle
                className="text-base"
                aria-hidden="true"
              />
              Guide
            </button>
          )}
          */}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm md:text-base">
          <p className="flex items-center gap-2">
            {isEvent ? <CalendarDays size={17} /> : <MapPin size={17} />}
            {isEvent ? item.subtitle : `Address: ${item.address}`}
          </p>
          {/* {!isEvent && (
            <a
              data-tour="place-get-direction"
              href={placeDirectionHref}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600 underline"
            >
              Get Direction
            </a>
          )} */}
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

      <div
        data-tour="detail-meta-section"
        className="my-5 grid gap-3 border-b border-gray-200 pb-5 text-base font-semibold md:grid-cols-3 md:text-lg"
      >
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
        <section className="flex w-full flex-col gap-8 pt-8 pb-8">
          {averageRating !== null && (
            <div className="flex flex-col justify-center items-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl lg:text-main-header font-medium mt-5">
                <LeafRatings ratings={averageRating} align="items-start" />
              </h2>
              <p className="text-subtitle my-4 font-medium">Guest Favorite</p>
              <span className="text-content text-center">
                This {isEvent ? "event" : "place"} is a guest favourite based on <br /> ratings, reviews
                and reliability
              </span>
            </div>
          )}
          <div className="flex overflow-x-auto gap-6 px-4 md:px-0 scrollbar-hide snap-x snap-mandatory pb-4 w-full items-center">
            {isReviewsLoading ? (
              <p role="status" className="w-full text-sm text-gray-500 text-center">
                Loading reviews...
              </p>
            ) : reviews.length === 0 ? (
              <div className="border-2 border-dotted border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500 h-40 flex justify-center items-center w-full">
                Share your experience and leave a review.
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="w-full md:w-[calc((100%-3rem)/3)] flex-shrink-0 snap-center h-full">
                  <ReviewCard
                    review={review}
                    handleClick={() => setSelectedReview(review)}
                    reviewTextClassName="h-[60px]"
                  />
                </div>
              ))
            )}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              data-tour={isEvent ? "event-write-review" : "place-write-review"}
              onClick={handleWriteReviewClick}
              className="flex rounded-full items-center cursor-pointer justify-center gap-2 bg-primary-blue hover:bg-secondary-light text-primary text-content leading-5 px-6 py-3"
            >
              WRITE A REVIEW
            </button>
          </div>
        </section>
      )}

      <MuiModal open={!!selectedReview} onClose={() => setSelectedReview(null)} title="Review">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-blue flex items-center justify-center text-white font-semibold text-lg uppercase">
              {getInitials(selectedReview?.name) || "A"}
            </div>
            <p className="font-semibold text-base">{selectedReview?.name}</p>
          </div>
          <div className="flex items-center gap-1 text-black text-sm">{renderStars(selectedReview?.starCount || 0)}</div>
          <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">{selectedReview?.description}</p>
        </div>
      </MuiModal>

      {hasMapCoordinates && (
        <section
          data-tour="place-map-section"
          className="mt-5 h-[500px] w-full overflow-hidden rounded-xl border-b border-gray-200 pb-8"
        >
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-title font-medium uppercase text-gray-700">
              Where you'll be
            </h1>
            {placeMapsLink && (
              <a
                data-tour="place-get-direction"
                href={placeMapsLink}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-600 underline"
              >
                Get Direction
              </a>
            )}
          </div>
          <div className="h-[410px] w-full overflow-hidden rounded-xl">
            <Map
              locations={placeMapLocations}
              disableNavigation
              disableTwoFingerScroll
            />
          </div>
        </section>
      )}

      <div
        data-tour="detail-disclaimer-section"
        className="mt-5 text-[0.5rem] leading-relaxed text-gray-500"
      >
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
