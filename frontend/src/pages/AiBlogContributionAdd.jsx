import CharacterLimitedField from "../components/CharacterLimitedField";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import contributionFieldLimits from "../constants/contributionFieldLimits";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineChevronDown,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi";
import { FaCheck } from "react-icons/fa";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useSpecialUserEmails from "../hooks/useSpecialUserEmails";
import axios from "../utils/axios";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { companyLocationsQueryOptions } from "../utils/classicSearchLocations";
import humanDate from "../utils/humanDate";

const formatTitle = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const normalizeLocationKey = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const getLocationKey = (country, state) =>
  `${normalizeLocationKey(country)}|${normalizeLocationKey(state)}`;

const getSelectionStorageKey = (type) =>
  `wono-contribution-add-selection-${type}`;

const CONTENT_PREVIEW_STORAGE_PREFIX = "wono-contribution-preview";

const getItemId = (item = {}) => item._id || item.id;

const getItemDateValue = (item = {}) =>
  new Date(item.date || item.updatedAt || item.createdAt || 0).getTime();

const getItemDestination = (item = {}) =>
  item.destination || item.location || item.region || "";

const isSameDestination = (item = {}, destination = "") =>
  normalizeLocationKey(getItemDestination(item)) === normalizeLocationKey(destination);

const storePreviewItemForNewTab = (type, item) => {
  const itemId = getItemId(item) || Date.now();
  const key = `${CONTENT_PREVIEW_STORAGE_PREFIX}-${type}-${itemId}-${Date.now()}`;

  const serializedItem = JSON.stringify(item);
  localStorage.setItem(key, serializedItem);
  sessionStorage.setItem(key, serializedItem);
  return key;
};

const buildExactKeyword = (label) => {
  if (!label) return null;
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `^${escaped}$`;
};

const emptySection = () => ({
  title: "",
  image: "",
  imageFile: null,
  content: "",
});

const initialFormState = (author = "", destination = "") => ({
  destination,
  link: "",
  mainTitle: "",
  mainImage: "",
  author,
  source: "",
  date: "",
  status: "active",
  mainContent: "",
  eventName: "",
  shortDescription: "",
  placeName: "",
  address: "",
  googleMapsLink: "",
  rating: "",
  latitude: "",
  longitude: "",
  placeType: "",
  category: "",
  month: "",
  venue: "",
  eventType: "",
  sections: [emptySection()],
});

const contributionAddConfig = {
  blog: {
    contentLabel: "Blog",
    contentLabelPlural: "Blogs",
    accessFlag: "isBlogger",
    dashboardPath: "/contributions/blog",
    addPath: "/contributions/blog/add",
    myEndpoint: "/blogs/my",
    existingEndpoint: "/blogs/get-blogs",
    existingQueryKey: "blog-contribution-existing-blogs",
    myQueryKey: "myBlogContributions",
    destinationTitleQueryKey: "blog-contribution-destination-titles",
    detailsRoute: "/blog/blog-details",
    successMessage: "Blog saved successfully.",
    successTitle: "Blog Added",
    errorMessage: "Could not save this blog. Please check the details and try again.",
    submitButtonLabel: "Publish Blog",
    writeButtonLabel: "Write a Blog",
  },
  news: {
    contentLabel: "News",
    contentLabelPlural: "News",
    accessFlag: "isNewsWriter",
    dashboardPath: "/contributions/news",
    addPath: "/contributions/news/add",
    myEndpoint: "/news/my",
    existingEndpoint: "/news/get-news",
    existingQueryKey: "news-contribution-existing-news",
    myQueryKey: "myNewsContributions",
    destinationTitleQueryKey: "news-contribution-destination-titles",
    detailsRoute: "/news/news-details",
    successMessage: "News saved successfully.",
    successTitle: "News Added",
    errorMessage: "Could not save this news item. Please check the details and try again.",
    submitButtonLabel: "Publish News",
    writeButtonLabel: "Write News",
  },
  event: {
    contentLabel: "Event",
    contentLabelPlural: "Events",
    accessFlag: "isEventWriter",
    dashboardPath: "/contributions/event",
    addPath: "/contributions/event/add",
    myEndpoint: "/events/my",
    existingEndpoint: "/events",
    existingParams: (destination) => ({ destination }),
    existingQueryKey: "event-contribution-existing-events",
    myQueryKey: "myEventContributions",
    destinationTitleQueryKey: "event-contribution-destination-titles",
    detailsRoute: (item) => `/events/${item._id || item.id}`,
    successMessage: "Event saved successfully.",
    successTitle: "Event Added",
    errorMessage: "Could not save this event. Please check the details and try again.",
    submitButtonLabel: "Publish Event",
    writeButtonLabel: "Write Event",
    formType: "event",
  },
  places: {
    contentLabel: "Place",
    contentLabelPlural: "Places",
    accessFlag: "isPlaceWriter",
    dashboardPath: "/contributions/places",
    addPath: "/contributions/places/add",
    myEndpoint: "/places/my",
    existingEndpoint: "/places",
    existingParams: (destination) => ({ destination }),
    existingQueryKey: "place-contribution-existing-places",
    myQueryKey: "myPlaceContributions",
    destinationTitleQueryKey: "place-contribution-destination-titles",
    detailsRoute: (item) => `/places/${item._id || item.id}`,
    successMessage: "Place saved successfully.",
    successTitle: "Place Added",
    errorMessage: "Could not save this place. Please check the details and try again.",
    submitButtonLabel: "Publish Place",
    writeButtonLabel: "Write Place",
    formType: "place",
  },
};

const inputClassName =
  "min-h-[42px] w-full rounded-none border-0 border-b border-black/40 bg-transparent px-0 py-2 text-base text-slate-700 outline-none transition hover:border-black focus:border-b-2 focus:border-primary-blue";
const labelClassName = "block text-xs font-normal text-gray-600";
const errorTextClassName = "mt-1 text-xs font-medium text-red-500";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const eventTypes = [
  "Festival", "Nomad", "Patriotic", "Religious", "None of the above",
];

const eventCategories = [
  "Culture", "Heritage", "Museums", "Architecture", "Fashion", "Tourism",
  "Cultural", "Nature", "Water Festival", "Street Festival", "Civic", "Salsa",
  "Dance", "Music", "Folk", "Motorsports", "Lifestyle", "Food", "Historical",
  "Diaspora", "World Music", "Community", "Trade Fair", "Exhibition",
  "Literature", "Music & Arts", "LGBTQ+",
];

const EventCategorySelect = ({ value, onChange, error }) => {
  const selectedCategories = value ? value.split(" / ") : [];

  return (
    <TextField
      select
      label="Category"
      required
      fullWidth
      variant="standard"
      size="small"
      value={selectedCategories}
      error={error}
      helperText="Select 1 to 4 categories"
      onChange={(event) => {
        const selected = typeof event.target.value === "string"
          ? event.target.value.split(",")
          : event.target.value;
        if (selected.length <= 4) onChange(selected.join(" / "));
      }}
      slotProps={{
        select: {
          multiple: true,
          renderValue: (selected) => selected.join(" / "),
          MenuProps: { PaperProps: { style: { maxHeight: 360 } } },
        },
      }}
    >
      {eventCategories.map((category) => {
        const checked = selectedCategories.includes(category);
        return (
          <MenuItem
            key={category}
            value={category}
            disabled={!checked && selectedCategories.length >= 4}
          >
            <Checkbox checked={checked} />
            <ListItemText primary={category} />
          </MenuItem>
        );
      })}
    </TextField>
  );
};

const MonthSelect = ({ value, onChange, error }) => (
  <TextField
    select
    label="Month"
    required
    fullWidth
    variant="standard"
    size="small"
    value={value}
    onChange={onChange}
    error={error}
  >
    {months.map((month) => (
      <MenuItem key={month} value={month}>
        {month}
      </MenuItem>
    ))}
  </TextField>
);

const ContributionTextField = ({ as, maxLength, ...props }) => (
  <CharacterLimitedField
    as={TextField}
    {...props}
    className={undefined}
    label={props.label || props.placeholder}
    placeholder={undefined}
    fullWidth
    variant="standard"
    size="small"
    multiline={as === "textarea"}
    minRows={as === "textarea" ? 6 : undefined}
    error={Boolean(props["aria-invalid"])}
    maxLength={maxLength}
    slotProps={{ htmlInput: { maxLength } }}
  />
);

const RequiredLabel = ({ children }) => (
  <label className={labelClassName}>
    {children}
    <span className="ml-0.5 text-red-500">*</span>
  </label>
);

const FieldError = ({ message }) =>
  message ? <p className={errorTextClassName}>{message}</p> : null;

const BlogImageFileInput = ({
  id,
  label,
  file,
  error,
  required = false,
  onChange,
  onClear,
}) => (
  <div>
    {required ? (
      <RequiredLabel>{label}</RequiredLabel>
    ) : (
      <label className={labelClassName}>{label}</label>
    )}
    <div
      className={`contribution-upload flex min-h-[32px] items-center gap-3 border-b bg-white text-sm transition ${
        error ? "border-red-500" : "border-black/40 hover:border-black focus-within:border-primary-blue"
      }`}
    >
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
      <label
        htmlFor={id}
        className="shrink-0 cursor-pointer rounded-md bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
      >
        Choose image
      </label>
      <span className="min-w-0 flex-1 truncate text-slate-600">
        {file?.name || "No file selected"}
      </span>
      {file ? (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-600"
        >
          Remove
        </button>
      ) : null}
    </div>
    <FieldError message={error} />
  </div>
);

const DropdownBadge = ({
  label,
  options,
  selectedValue,
  isOpen,
  onToggle,
  onSelect,
  disabled = false,
  variant = "pill",
}) => {
  const isInputVariant = variant === "input";

  if (isInputVariant) {
    const selectedOption = options.find(
      (option) => option.value === selectedValue || option.label === selectedValue,
    );

    return (
      <TextField
        select
        label={label}
        required
        fullWidth
        variant="standard"
        size="small"
        disabled={disabled}
        value={selectedOption?.value ?? ""}
        onChange={(event) => {
          const option = options.find(({ value }) => value === event.target.value);
          if (option) onSelect(option);
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  return (
  <div className="relative w-full min-w-0 flex-1">
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={
        isInputVariant
          ? `flex min-h-[42px] w-full items-center justify-between gap-2 border-b py-2 text-base outline-none transition-colors ${
              disabled
                ? "cursor-not-allowed border-black/20 bg-white text-black/35"
                : isOpen
                  ? "border-primary-blue bg-white text-slate-700"
                  : "border-black/40 bg-white text-slate-700 hover:border-black"
            }`
          : `flex min-h-[44px] w-full items-center justify-between gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${
              disabled
                ? "cursor-not-allowed border-black/10 bg-black/[0.03] text-black/35"
                : isOpen
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-black/20 bg-white text-black/85 hover:border-sky-500"
            }`
      }
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <span className="truncate">{selectedValue}</span>
      <HiOutlineChevronDown
        size={18}
        className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>

    {isOpen && !disabled && (
      <div
        className={`absolute top-full z-40 w-full min-w-[11rem] max-w-[calc(100vw-4rem)] border border-sky-100 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)] ${
          isInputVariant ? "mt-2 rounded-md" : "mt-3 rounded-2xl"
        }`}
      >
        <ul
          className="max-h-72 overflow-y-auto"
          role="listbox"
          aria-label={label}
        >
          {options.map((option) => {
            const isSelected =
              option.value === selectedValue || option.label === selectedValue;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => onSelect(option)}
                  className={`group flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-sky-50 font-medium text-sky-600"
                      : "text-black/80 hover:bg-slate-50"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="mr-2 inline-flex w-4 shrink-0 items-center justify-center">
                    <FaCheck
                      size={13}
                      className={`shrink-0 text-primary-blue transition-opacity ${
                        isSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      aria-hidden="true"
                    />
                  </span>
                  <span>{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    )}
  </div>
  );
};

const ContributionPreviewCard = ({ item, stateName, config, returnSelection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSubmittedByUser = Boolean(item.__submittedByUser);
  const thumbnail = item.mainImage || item.image;
  const title =
    item.mainTitle ||
    item.eventName ||
    item.placeName ||
    item.title ||
    config.contentLabel;
  const subtitle =
    item.author ||
    item.venue ||
    item.address ||
    item.destination ||
    "Destination";
  const itemDate = item.date || item.updatedAt || item.createdAt;
  const itemId = getItemId(item);
  const publicDetailsRoute =
    typeof config.detailsRoute === "function"
      ? config.detailsRoute(item)
      : config.detailsRoute;
  const editRoute = itemId ? `${config.dashboardPath}/${itemId}` : null;
  const detailStateItem =
    config.formType === "event"
      ? {
          ...item,
          id: item._id || item.id,
          title: item.eventName || item.title,
          image: item.mainImage || item.image,
          location: item.venue || item.location,
          meta: item.month || item.meta,
          subtitle: item.month ? `During the month of ${item.month}` : item.subtitle,
          description: item.shortDescription || item.description,
          region: item.destination || item.region,
        }
      : config.formType === "place"
        ? {
            ...item,
            id: item._id || item.id,
            title: item.placeName || item.title,
            image: item.mainImage || item.image,
            location: item.address || item.location,
            meta: item.rating || item.meta,
            description: item.shortDescription || item.description,
            category: item.category || item.placeType,
            region: item.destination || item.region,
            lat: item.latitude,
            lng: item.longitude,
          }
      : item;
  const openPublicDetails = () => {
    const previewKey = storePreviewItemForNewTab(config.contentLabel.toLowerCase(), detailStateItem);
    const separator = publicDetailsRoute.includes("?") ? "&" : "?";
    window.open(
      `${publicDetailsRoute}${separator}previewKey=${encodeURIComponent(previewKey)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <article className="flex w-full flex-col gap-2 rounded-lg bg-white text-left transition-all">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
        {isSubmittedByUser ? (
          <span className="absolute left-2 top-2 rounded-full bg-primary-blue px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(73,159,222,0.25)]">
            Published by you
          </span>
        ) : null}
        <button
          type="button"
          onClick={openPublicDetails}
          className={`absolute left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/55 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-black/70 ${
            isSubmittedByUser ? "top-[42%] -translate-y-1/2" : "top-1/2 -translate-y-1/2"
          }`}
        >
          <HiOutlineEye size={14} />
          View
        </button>
        {isSubmittedByUser && editRoute ? (
          <button
            type="button"
            onClick={() =>
              navigate(editRoute, {
                state: {
                  content: item,
                  item: detailStateItem,
                  selectedStateLabel: stateName,
                  returnSelection,
                  sourceSearch: location.search,
                  startEditing: true,
                },
              })
            }
            className="absolute left-1/2 top-[58%] inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-black/55 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-black/70"
          >
            <HiOutlinePencil size={14} />
            Edit
          </button>
        ) : null}
      </div>
      <div className="flex h-[25%] flex-col gap-1 px-4 pr-1">
        <h3
          className="truncate text-xs font-semibold md:text-sm"
          title={title}
        >
          {title}
        </h3>
        <div className="flex w-full items-center justify-between gap-2">
          <span
            className="truncate text-xs font-medium text-gray-600 md:text-sm"
            title={subtitle}
          >
            {subtitle}
          </span>
          <time
            className="shrink-0 text-xs font-medium text-gray-600 md:text-sm"
            dateTime={itemDate}
          >
            {itemDate ? humanDate(itemDate) : ""}
          </time>
        </div>
      </div>
    </article>
  );
};

const AiBlogContributionAdd = ({ type = "blog" }) => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const queryClient = useQueryClient();
  const axiosPrivate = useAxiosPrivate();
  const dropdownContainerRef = useRef(null);
  const { auth } = useAuth();
  const user = auth?.user || {};
  const config = contributionAddConfig[type] || contributionAddConfig.blog;
  const isArticleContribution = ["blog", "news"].includes(type);
  const isEventForm = config.formType === "event";
  const isPlaceForm = config.formType === "place";
  const supportsImageUploads = ["blog", "news", "event", "places"].includes(type);
  const supportsSectionImageUploads = ["blog", "news"].includes(type);
  const selectionStorageKey = getSelectionStorageKey(type);
  const hasAccess = Boolean(user?.[config.accessFlag]);
  const contributorName = user?.fullName?.trim() || user?.name || "";
  const isAddRoute = routeLocation.pathname.endsWith("/add");

  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedContinent, setSelectedContinent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationLabel, setSelectedLocationLabel] = useState("");
  const [showForm, setShowForm] = useState(() =>
    isAddRoute || Boolean(routeLocation.state?.openForm),
  );
  const [formValues, setFormValues] = useState(() =>
    initialFormState(contributorName),
  );
  const [formErrors, setFormErrors] = useState({});

  const specialUserEmails = useSpecialUserEmails();
  const { data: rawLocations = [] } = useQuery(companyLocationsQueryOptions);

  const locations = useMemo(() => {
    const userEmail = user?.email?.toLowerCase();
    const isSpecialUser = specialUserEmails.includes(userEmail);

    if (isSpecialUser) return rawLocations;

    return rawLocations
      .map((country) => ({
        ...country,
        states: (country.states || []).filter((state) => state?.isPublic),
      }))
      .filter((country) => (country.states?.length || 0) > 0);
  }, [rawLocations, specialUserEmails, user?.email]);

  const { data: destinationTitleLookup = new Map() } = useQuery({
    queryKey: [config.destinationTitleQueryKey],
    queryFn: async () => {
      try {
        const response = await axios.get("state-wise-weight");
        const destinations = response?.data?.data || [];
        const lookup = new Map();

        destinations.forEach((destination) => {
          if (!destination?.title || !destination?.country) return;

          [destination.state, destination.title].filter(Boolean).forEach((name) => {
            lookup.set(getLocationKey(destination.country, name), destination.title);
          });
        });

        return lookup;
      } catch (error) {
        console.error(error?.response?.data?.message || error.message);
        return new Map();
      }
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const continentOptions = useMemo(() => {
    const uniqueContinents = [
      ...new Set(locations.map((item) => item.continent).filter(Boolean)),
    ];

    return uniqueContinents
      .map((continent) => ({
        label: formatTitle(continent),
        value: continent.toLowerCase(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [locations]);

  const countryOptions = useMemo(() => {
    const filtered = selectedContinent
      ? locations.filter(
          (item) =>
            item.continent?.toLowerCase() === selectedContinent?.toLowerCase(),
        )
      : locations;

    return filtered
      .map((item) => ({
        label: formatTitle(item.country || ""),
        value: item.country?.toLowerCase(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [locations, selectedContinent]);

  const locationOptions = useMemo(() => {
    const countryData = locations.find(
      (item) => item.country?.toLowerCase() === selectedCountry?.toLowerCase(),
    );

    return (
      countryData?.states?.map((item) => ({
        label:
          destinationTitleLookup.get(
            getLocationKey(countryData.country, item.name),
          ) ||
          item.title ||
          item.name,
        value: item.name?.toLowerCase(),
        destination: item.name,
      })) || []
    ).sort((a, b) => a.label.localeCompare(b.label));
  }, [destinationTitleLookup, locations, selectedCountry]);

  const continentLabel =
    continentOptions.find((option) => option.value === selectedContinent)
      ?.label || "Select Continent";
  const countryLabel =
    countryOptions.find((option) => option.value === selectedCountry)?.label ||
    "Select Country";
  const locationLabel =
    selectedLocationLabel ||
    locationOptions.find((option) => option.value === selectedLocation)?.label ||
    "Select Location";

  const hasAllSelections = Boolean(
    selectedContinent && selectedCountry && selectedLocation,
  );
  const selectedDestination =
    locationOptions.find((option) => option.value === selectedLocation)
      ?.destination || selectedLocationLabel;
  const currentSelection = useMemo(
    () => ({
      continent: selectedContinent,
      country: selectedCountry,
      location: selectedLocation,
      locationLabel: selectedLocationLabel,
    }),
    [selectedContinent, selectedCountry, selectedLocation, selectedLocationLabel],
  );
  const previewHeadingLocation = hasAllSelections ? `${locationLabel} ` : "";

  const { data: existingItems = [], isPending: isExistingItemsLoading } = useQuery({
    queryKey: [config.existingQueryKey, selectedDestination],
    queryFn: async () => {
      const response = await axios.get(config.existingEndpoint, {
        params:
          selectedDestination && typeof config.existingParams === "function"
            ? config.existingParams(selectedDestination)
            : selectedDestination
              ? {
                  keyword: buildExactKeyword(selectedDestination),
                }
              : {},
      });

      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: true,
    refetchOnWindowFocus: false,
  });

  const { data: userSubmittedItems = [], isPending: isUserSubmittedItemsLoading } =
    useQuery({
      queryKey: [config.myQueryKey, user?._id || user?.id, selectedDestination],
      queryFn: async () => {
        const response = await axiosPrivate.get(config.myEndpoint);
        const items = Array.isArray(response.data?.data) ? response.data.data : [];

        return items
          .filter(
            (item) =>
              (!selectedDestination || isSameDestination(item, selectedDestination)) &&
              !item.isDraft &&
              (item.status || "pending").toLowerCase() === "approved",
          )
          .sort((a, b) => getItemDateValue(b) - getItemDateValue(a))
          .map((item) => ({
            ...item,
            __submittedByUser: true,
          }));
      },
      enabled: Boolean(user?._id || user?.id),
      refetchOnWindowFocus: false,
    });

  const previewItems = useMemo(() => {
    const submittedIds = new Set(
      userSubmittedItems.map((item) => getItemId(item)).filter(Boolean),
    );
    const submittedTitles = new Set(
      userSubmittedItems
        .map((item) =>
          normalizeLocationKey(
            item.mainTitle || item.eventName || item.placeName || item.title || "",
          ),
        )
        .filter(Boolean),
    );
    const publicItems = existingItems.filter((item) => {
      const itemId = getItemId(item);
      const itemTitle = normalizeLocationKey(
        item.mainTitle || item.eventName || item.placeName || item.title || "",
      );

      return !(
        (itemId && submittedIds.has(itemId)) ||
        (itemTitle && submittedTitles.has(itemTitle))
      );
    });

    return [...userSubmittedItems, ...publicItems];
  }, [existingItems, userSubmittedItems]);

  const isPreviewItemsLoading =
    isExistingItemsLoading || isUserSubmittedItemsLoading;

  const { mutate: createContribution, isPending: isSaving } = useMutation({
    mutationFn: async (payload) => axiosPrivate.post(config.myEndpoint, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [config.existingQueryKey, selectedDestination],
      });
      await queryClient.invalidateQueries({
        queryKey: [config.myQueryKey, user?._id || user?.id],
      });
      await showSuccessAlert(config.successMessage, {
        title: config.successTitle,
      });
      navigate(config.dashboardPath);
    },
    onError: (error) => {
      showErrorAlert(
        error?.response?.data?.message ||
          config.errorMessage,
      );
    },
  });

  useEffect(() => {
    if (!auth?.user) {
      navigate("/login", {
        replace: true,
        state: { redirectTo: config.addPath },
      });
      return;
    }

    if (!hasAccess) {
      navigate("/profile", { replace: true });
    }
  }, [auth?.user, config.addPath, hasAccess, navigate]);

  useEffect(() => {
    setFormValues((current) => ({
      ...current,
      author: current.author || contributorName,
      destination: selectedDestination || current.destination,
    }));
  }, [contributorName, selectedDestination]);

  useEffect(() => {
    if (continentOptions.length === 0 || locations.length === 0) return;

    if ((isAddRoute || routeLocation.state?.openForm) && !showForm) {
      setShowForm(true);
    }

    if (routeLocation.state?.freshAdd) {
      sessionStorage.removeItem(selectionStorageKey);
      navigate(`${routeLocation.pathname}${routeLocation.search}`, {
        replace: true,
        state: { ...routeLocation.state, freshAdd: false, openForm: isAddRoute },
      });
      return;
    }

    const stateSelection = routeLocation.state?.returnSelection;
    let savedSelection = null;

    if (!stateSelection) {
      try {
        savedSelection = JSON.parse(
          sessionStorage.getItem(selectionStorageKey) || "null",
        );
      } catch {
        savedSelection = null;
      }
    }

    const selection = stateSelection || savedSelection;
    if (
      !selection?.continent ||
      !selection?.country ||
      !selection?.location ||
      selectedContinent ||
      selectedCountry ||
      selectedLocation
    ) {
      return;
    }

    setSelectedContinent(selection.continent);
    setSelectedCountry(selection.country);
    setSelectedLocation(selection.location);
    setSelectedLocationLabel(selection.locationLabel || "");
    if (!isAddRoute) {
      setShowForm(false);
    }
  }, [
    continentOptions.length,
    isAddRoute,
    locations.length,
    navigate,
    routeLocation.pathname,
    routeLocation.search,
    routeLocation.state,
    selectedContinent,
    selectedCountry,
    selectedLocation,
    selectionStorageKey,
    showForm,
  ]);

  useEffect(() => {
    if (!hasAllSelections) return;

    sessionStorage.setItem(selectionStorageKey, JSON.stringify(currentSelection));
  }, [currentSelection, hasAllSelections, selectionStorageKey]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (!auth?.user || !hasAccess) {
    return null;
  }

  const getErrorMessage = (field) => formErrors[field] || "";
  const getFieldClassName = (field) =>
    `${inputClassName} ${
      getErrorMessage(field)
        ? "!border-red-500 focus:!border-red-500 focus:!ring-red-100"
        : ""
    }`;
  const clearFormError = (field) => {
    if (!formErrors[field]) return;

    setFormErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };
  const clearSectionFormError = (index, field) => {
    clearFormError(`sections.${index}.${field}`);
  };

  const updateFormField = (field, value) => {
    clearFormError(field);

    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSection = (index, field, value) => {
    clearSectionFormError(index, field);

    setFormValues((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    }));
  };

  const updateBlogImageFile = (field, file) => {
    clearFormError(field);

    setFormValues((current) => ({
      ...current,
      [field]: "",
      [`${field}File`]: file,
    }));
  };

  const updateSectionImageFile = (index, file) => {
    clearSectionFormError(index, "image");

    setFormValues((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index
          ? { ...section, image: "", imageFile: file }
          : section,
      ),
    }));
  };

  const removeSection = (index) => {
    setFormValues((current) => ({
      ...current,
      sections:
        current.sections.length > 1
          ? current.sections.filter((_, sectionIndex) => sectionIndex !== index)
          : current.sections,
    }));
  };

  const validateContributionForm = () => {
    const errors = {};

    if (!selectedContinent) errors.continent = "Continent is required";
    if (!selectedCountry) errors.country = "Country is required";
    if (!selectedLocation || !selectedDestination) {
      errors.location = "Location is required";
    }

    if (isEventForm) {
      if (!formValues.eventName.trim()) errors.eventName = "Event name is required";
      if (!formValues.mainImageFile && !formValues.mainImage.trim()) {
        errors.mainImage = "Main image is required";
      }
      const categories = formValues.category ? formValues.category.split(" / ") : [];
      if (
        categories.length < 1 || categories.length > 4 ||
        categories.some((category) => !eventCategories.includes(category))
      ) {
        errors.category = "Select between 1 and 4 categories";
      }
      if (!formValues.month.trim()) errors.month = "Month is required";
      if (!formValues.venue.trim()) errors.venue = "Venue is required";
      if (!formValues.eventType.trim()) errors.eventType = "Type is required";
      if (!formValues.shortDescription.trim()) {
        errors.shortDescription = "Short description is required";
      }

      return errors;
    }

    if (isPlaceForm) {
      if (!formValues.placeName.trim()) errors.placeName = "Place name is required";
      if (!formValues.mainImageFile && !formValues.mainImage.trim()) {
        errors.mainImage = "Main image is required";
      }
      if (!formValues.address.trim()) errors.address = "Address is required";
      if (!formValues.googleMapsLink.trim()) {
        errors.googleMapsLink = "Google Maps link is required";
      }
      if (!formValues.rating.trim()) errors.rating = "Rating is required";
      if (!formValues.placeType.trim()) errors.placeType = "Type is required";
      if (!formValues.category.trim()) errors.category = "Category is required";
      if (!formValues.month.trim()) errors.month = "Month is required";
      if (!formValues.venue.trim()) errors.venue = "Venue is required";
      if (!formValues.latitude.trim()) errors.latitude = "Latitude is required";
      if (!formValues.longitude.trim()) errors.longitude = "Longitude is required";
      if (!formValues.shortDescription.trim()) {
        errors.shortDescription = "Short description is required";
      }

      return errors;
    }

    if (!formValues.mainTitle.trim()) errors.mainTitle = "Main title is required";
    if (!formValues.mainImageFile && !formValues.mainImage.trim()) {
      errors.mainImage = "Main image is required";
    }
    if (!formValues.mainContent.trim()) {
      errors.mainContent = "Main content is required";
    }

    formValues.sections.forEach((section, index) => {
      if (!section.title.trim()) {
        errors[`sections.${index}.title`] = "Section title is required";
      }
      if (!section.imageFile && !section.image.trim()) {
        errors[`sections.${index}.image`] = "Section image is required";
      }
      if (!section.content.trim()) {
        errors[`sections.${index}.content`] = "Section content is required";
      }
    });

    return errors;
  };

  const handleSubmit = async (status) => {
    if (isSaving) return;

    const cleanedSections = formValues.sections
      .map((section) => ({
        title: section.title.trim(),
        image: section.image.trim(),
        content: section.content.trim(),
      }))
      .filter((section) => section.title || section.image || section.content);

    const validationErrors = validateContributionForm();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (status !== "draft") {
      const result = await Swal.fire({
        icon: "info",
        title: "Submit for review?",
        text: `Your ${config.contentLabel.toLowerCase()} will be sent for review before it is published.`,
        showCancelButton: true,
        confirmButtonText: "Submit for Review",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#0BA9EF",
        focusCancel: true,
        heightAuto: false,
        customClass: {
          popup: "swal2-popup--rounded",
          title: "swal2-title--serif",
          confirmButton: "swal2-button--pill",
          cancelButton: "swal2-button--pill",
        },
      });

      if (!result.isConfirmed) return;
    }

    if (supportsSectionImageUploads) {
      const payload = {
        mainTitle: formValues.mainTitle.trim(),
        mainImage: formValues.mainImage.trim(),
        mainContent: formValues.mainContent.trim(),
        author: isArticleContribution ? contributorName : formValues.author.trim(),
        date: isArticleContribution
          ? new Date().toISOString()
          : formValues.date
            ? new Date(formValues.date).toISOString()
            : null,
        destination: selectedDestination,
        blogType: "",
        link: "",
        source: formValues.source.trim(),
        sections: cleanedSections,
        isDraft: status === "draft",
      };
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (key === "sections") {
          formData.append(key, JSON.stringify(value));
          return;
        }

        formData.append(key, value ?? "");
      });

      if (formValues.mainImageFile) {
        formData.append("mainImageFile", formValues.mainImageFile);
      }

      formValues.sections.forEach((section, index) => {
        if (section.imageFile) {
          formData.append(`sectionImageFiles[${index}]`, section.imageFile);
        }
      });

      createContribution(formData);
      return;
    }

    if (isEventForm) {
      const payload = {
        eventName: formValues.eventName.trim(),
        shortDescription: formValues.shortDescription.trim(),
        mainImage: formValues.mainImage.trim(),
        destination: selectedDestination,
        link: "",
        category: formValues.category.trim(),
        month: formValues.month.trim(),
        venue: formValues.venue.trim(),
        eventType: formValues.eventType === "None of the above"
          ? ""
          : formValues.eventType.trim(),
        sections: cleanedSections,
        isDraft: status === "draft",
      };

      if (supportsImageUploads) {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          if (key === "sections") {
            formData.append(key, JSON.stringify(value));
            return;
          }

          formData.append(key, value ?? "");
        });

        if (formValues.mainImageFile) {
          formData.append("mainImageFile", formValues.mainImageFile);
        }

        createContribution(formData);
        return;
      }

      createContribution(payload);
      return;
    }

    if (isPlaceForm) {
      const payload = {
        placeName: formValues.placeName.trim(),
        shortDescription: formValues.shortDescription.trim(),
        mainImage: formValues.mainImage.trim(),
        destination: selectedDestination,
        link: "",
        address: formValues.address.trim(),
        googleMapsLink: formValues.googleMapsLink.trim(),
        rating: formValues.rating.trim(),
        category: formValues.category.trim(),
        month: formValues.month.trim(),
        venue: formValues.venue.trim(),
        latitude: formValues.latitude,
        longitude: formValues.longitude,
        placeType: formValues.placeType.trim(),
        sections: cleanedSections,
        isDraft: status === "draft",
      };

      if (supportsImageUploads) {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          if (key === "sections") {
            formData.append(key, JSON.stringify(value));
            return;
          }

          formData.append(key, value ?? "");
        });

        if (formValues.mainImageFile) {
          formData.append("mainImageFile", formValues.mainImageFile);
        }

        createContribution(formData);
        return;
      }

      createContribution(payload);
      return;
    }

    createContribution({
      mainTitle: formValues.mainTitle.trim(),
      mainImage: formValues.mainImage.trim(),
      mainContent: formValues.mainContent.trim(),
      author: isArticleContribution ? contributorName : formValues.author.trim(),
      date: isArticleContribution
        ? new Date().toISOString()
        : formValues.date
          ? new Date(formValues.date).toISOString()
          : null,
      destination: selectedDestination,
      blogType: "",
      link: "",
      source: formValues.source.trim(),
      sections: cleanedSections,
      isDraft: status === "draft",
    });
  };

  return (
    <main className="mx-auto w-full max-w-[80rem] px-4 pb-8 pt-2 md:px-8 lg:px-8">
      {!showForm ? (
        <section className="mt-4">
          <p className="font-play text-sm font-medium leading-snug text-black/85 lg:text-[0.95rem]">
            {hasAllSelections
              ? `Below are the existing ${config.contentLabelPlural.toLowerCase()} for the selected location.`
              : `Browse all available ${config.contentLabelPlural.toLowerCase()} or filter by continent, country and state.`}
          </p>

          <div
            ref={dropdownContainerRef}
            className="relative z-30 mt-6 grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <DropdownBadge
              label="Continent"
              options={continentOptions}
              selectedValue={continentLabel}
              isOpen={openDropdown === "continent"}
              onToggle={() =>
                setOpenDropdown((current) =>
                  current === "continent" ? null : "continent",
                )
              }
              onSelect={(option) => {
                setSelectedContinent(option.value);
                setSelectedCountry("");
                setSelectedLocation("");
                setSelectedLocationLabel("");
                setShowForm(false);
                setOpenDropdown(null);
              }}
            />

            <DropdownBadge
              label="Country"
              options={countryOptions}
              selectedValue={countryLabel}
              isOpen={openDropdown === "country"}
              onToggle={() =>
                setOpenDropdown((current) =>
                  current === "country" ? null : "country",
                )
              }
              onSelect={(option) => {
                setSelectedCountry(option.value);
                setSelectedLocation("");
                setSelectedLocationLabel("");
                setShowForm(false);
                setOpenDropdown(null);
              }}
              disabled={!selectedContinent}
            />

            <DropdownBadge
              label="Location"
              options={locationOptions}
              selectedValue={locationLabel}
              isOpen={openDropdown === "location"}
              onToggle={() =>
                setOpenDropdown((current) =>
                  current === "location" ? null : "location",
                )
              }
              onSelect={(option) => {
                setSelectedLocation(option.value);
                setSelectedLocationLabel(option.label);
                setFormValues(initialFormState(contributorName, option.destination));
                setShowForm(false);
                setOpenDropdown(null);
              }}
              disabled={!selectedCountry}
            />

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-primary-blue px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 lg:min-w-[10rem]"
            >
              {config.writeButtonLabel}
            </button>
          </div>

          <div className="mt-8">
              <h1 className="mb-4 pl-0 text-sm font-semibold text-black md:pl-12">
                Latest {previewHeadingLocation}{config.contentLabelPlural}
              </h1>

              {isPreviewItemsLoading ? (
                <p className="text-sm text-slate-500">
                  Loading {config.contentLabelPlural.toLowerCase()}...
                </p>
              ) : previewItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                  {previewItems.map((item, index) => (
                    <ContributionPreviewCard
                      key={`${item.__submittedByUser ? "mine" : "public"}-${getItemId(item) || index}`}
                      item={item}
                      stateName={locationLabel}
                      config={config}
                      returnSelection={currentSelection}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No {config.contentLabel.toLowerCase()} posts found
                  {hasAllSelections ? ` for ${locationLabel}` : ""}.
                </p>
              )}
            </div>
        </section>
      ) : (
        <section className="mt-0 bg-transparent px-0 py-2">
          <div className="w-full py-6">
            <h1 className="mb-8 text-2xl font-semibold uppercase text-slate-700">
              Add {config.contentLabel}
            </h1>

            <div
              ref={dropdownContainerRef}
              className="relative z-30 mb-5 grid gap-4 lg:grid-cols-3"
            >
              <div>
                <DropdownBadge
                  label="Continent"
                  options={continentOptions}
                  selectedValue={continentLabel}
                  isOpen={openDropdown === "form-continent"}
                  variant="input"
                  onToggle={() =>
                    setOpenDropdown((current) =>
                      current === "form-continent" ? null : "form-continent",
                    )
                  }
                  onSelect={(option) => {
                    setSelectedContinent(option.value);
                    setSelectedCountry("");
                    setSelectedLocation("");
                    setSelectedLocationLabel("");
                    setFormValues((current) => ({
                      ...current,
                      destination: "",
                    }));
                    setFormErrors((current) => {
                      const next = { ...current };
                      delete next.continent;
                      delete next.country;
                      delete next.location;
                      return next;
                    });
                    setOpenDropdown(null);
                  }}
                />
                <FieldError message={getErrorMessage("continent")} />
              </div>

              <div>
                <DropdownBadge
                  label="Country"
                  options={countryOptions}
                  selectedValue={countryLabel}
                  isOpen={openDropdown === "form-country"}
                  variant="input"
                  onToggle={() =>
                    setOpenDropdown((current) =>
                      current === "form-country" ? null : "form-country",
                    )
                  }
                  onSelect={(option) => {
                    setSelectedCountry(option.value);
                    setSelectedLocation("");
                    setSelectedLocationLabel("");
                    setFormValues((current) => ({
                      ...current,
                      destination: "",
                    }));
                    setFormErrors((current) => {
                      const next = { ...current };
                      delete next.country;
                      delete next.location;
                      return next;
                    });
                    setOpenDropdown(null);
                  }}
                  disabled={!selectedContinent}
                />
                <FieldError message={getErrorMessage("country")} />
              </div>

              <div>
                <DropdownBadge
                  label="Location"
                  options={locationOptions}
                  selectedValue={locationLabel}
                  isOpen={openDropdown === "form-location"}
                  variant="input"
                  onToggle={() =>
                    setOpenDropdown((current) =>
                      current === "form-location" ? null : "form-location",
                    )
                  }
                  onSelect={(option) => {
                    setSelectedLocation(option.value);
                    setSelectedLocationLabel(option.label);
                    setFormValues((current) => ({
                      ...current,
                      destination: option.destination,
                    }));
                    clearFormError("location");
                    setOpenDropdown(null);
                  }}
                  disabled={!selectedCountry}
                />
                <FieldError message={getErrorMessage("location")} />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <ContributionTextField label={isEventForm
                    ? "Event Name"
                    : isPlaceForm
                      ? "Place Name"
                      : "Main Title"}
                  className={getFieldClassName(
                    isEventForm
                      ? "eventName"
                      : isPlaceForm
                        ? "placeName"
                        : "mainTitle",
                  )}
                  required
                  aria-invalid={Boolean(
                    getErrorMessage(
                      isEventForm
                        ? "eventName"
                        : isPlaceForm
                          ? "placeName"
                          : "mainTitle",
                    ),
                  )}
                  value={
                    isEventForm
                      ? formValues.eventName
                      : isPlaceForm
                        ? formValues.placeName
                      : formValues.mainTitle
                  }
                  onChange={(event) =>
                    updateFormField(
                      isEventForm
                        ? "eventName"
                        : isPlaceForm
                          ? "placeName"
                          : "mainTitle",
                      event.target.value,
                    )
                  }
                  maxLength={contributionFieldLimits.mainTitle}
                  placeholder={
                    isEventForm
                      ? "Event name"
                      : isPlaceForm
                        ? "Place name"
                        : "Main title"
                  }
                />
                <FieldError
                  message={getErrorMessage(
                    isEventForm
                      ? "eventName"
                      : isPlaceForm
                        ? "placeName"
                        : "mainTitle",
                  )}
                />
              </div>
              <div>
                {supportsImageUploads ? (
                  <BlogImageFileInput
                    id="blog-main-image"
                    label="Main Image"
                    file={formValues.mainImageFile}
                    error={getErrorMessage("mainImage")}
                    required
                    onChange={(file) => updateBlogImageFile("mainImage", file)}
                    onClear={() => updateBlogImageFile("mainImage", null)}
                  />
                ) : (
                  <>
                  <ContributionTextField label="Main Image URL"
                    className={getFieldClassName("mainImage")}
                    required
                    aria-invalid={Boolean(getErrorMessage("mainImage"))}
                    value={formValues.mainImage}
                    maxLength={contributionFieldLimits.mainImage}
                    onChange={(event) =>
                      updateFormField("mainImage", event.target.value)
                    }
                    placeholder="Main image URL"
                  />
                  <FieldError message={getErrorMessage("mainImage")} />
                </>
                )}
              </div>
              {isArticleContribution ? (
                <div>
                  <ContributionTextField label="Source (optional)"
                    className={getFieldClassName("source")}
                    aria-invalid={Boolean(getErrorMessage("source"))}
                    value={formValues.source}
                    maxLength={contributionFieldLimits.source}
                    onChange={(event) =>
                      updateFormField("source", event.target.value)
                    }
                    placeholder="Source (optional)"
                  />
                  <FieldError message={getErrorMessage("source")} />
                </div>
              ) : null}
              {isEventForm ? (
                <div>
                  <EventCategorySelect
                    error={Boolean(getErrorMessage("category"))}
                    value={formValues.category}
                    onChange={(value) => updateFormField("category", value)}
                  />
                  <FieldError message={getErrorMessage("category")} />
                </div>
              ) : null}
              {isPlaceForm ? (
                <div>
                  <ContributionTextField label="Address"
                    className={getFieldClassName("address")}
                    required
                    aria-invalid={Boolean(getErrorMessage("address"))}
                    value={formValues.address}
                    maxLength={contributionFieldLimits.address}
                    onChange={(event) =>
                      updateFormField("address", event.target.value)
                    }
                    placeholder="Address"
                  />
                  <FieldError message={getErrorMessage("address")} />
                </div>
              ) : null}
            </div>

            {config.formType === "event" ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <MonthSelect
                    error={Boolean(getErrorMessage("month"))}
                    value={formValues.month}
                    onChange={(event) =>
                      updateFormField("month", event.target.value)
                    }
                  />
                  <FieldError message={getErrorMessage("month")} />
                </div>
                <div>
                  <ContributionTextField label="Venue"
                    className={getFieldClassName("venue")}
                    required
                    aria-invalid={Boolean(getErrorMessage("venue"))}
                    value={formValues.venue}
                    maxLength={contributionFieldLimits.venue}
                    onChange={(event) =>
                      updateFormField("venue", event.target.value)
                    }
                    placeholder="Venue"
                  />
                  <FieldError message={getErrorMessage("venue")} />
                </div>
                <div>
                  <TextField
                    select
                    label="Type"
                    required
                    fullWidth
                    variant="standard"
                    size="small"
                    error={Boolean(getErrorMessage("eventType"))}
                    value={formValues.eventType}
                    onChange={(event) =>
                      updateFormField("eventType", event.target.value)
                    }
                  >
                    {eventTypes.map((eventType) => (
                      <MenuItem key={eventType} value={eventType}>
                        {eventType}
                      </MenuItem>
                    ))}
                  </TextField>
                  <FieldError message={getErrorMessage("eventType")} />
                </div>
              </div>
            ) : config.formType === "place" ? (
              <>
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <ContributionTextField label="Google Maps Link"
                      className={getFieldClassName("googleMapsLink")}
                      required
                      aria-invalid={Boolean(getErrorMessage("googleMapsLink"))}
                      value={formValues.googleMapsLink}
                      maxLength={contributionFieldLimits.googleMapsLink}
                      onChange={(event) =>
                        updateFormField("googleMapsLink", event.target.value)
                      }
                      placeholder="Google Maps link"
                    />
                    <FieldError message={getErrorMessage("googleMapsLink")} />
                  </div>
                  <div>
                    <ContributionTextField label="Rating"
                      className={getFieldClassName("rating")}
                      required
                      aria-invalid={Boolean(getErrorMessage("rating"))}
                      value={formValues.rating}
                      maxLength={contributionFieldLimits.rating}
                      onChange={(event) =>
                        updateFormField("rating", event.target.value)
                      }
                      placeholder="Rating"
                    />
                    <FieldError message={getErrorMessage("rating")} />
                  </div>
                  <div>
                    <ContributionTextField label="Type"
                      className={getFieldClassName("placeType")}
                      required
                      aria-invalid={Boolean(getErrorMessage("placeType"))}
                      value={formValues.placeType}
                      maxLength={contributionFieldLimits.type}
                      onChange={(event) =>
                        updateFormField("placeType", event.target.value)
                      }
                      placeholder="Type"
                    />
                    <FieldError message={getErrorMessage("placeType")} />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <ContributionTextField label="Category"
                      className={getFieldClassName("category")}
                      required
                      aria-invalid={Boolean(getErrorMessage("category"))}
                      value={formValues.category}
                      maxLength={contributionFieldLimits.category}
                      onChange={(event) =>
                        updateFormField("category", event.target.value)
                      }
                      placeholder="Category"
                    />
                    <FieldError message={getErrorMessage("category")} />
                  </div>
                  <div>
                    <MonthSelect
                      error={Boolean(getErrorMessage("month"))}
                      value={formValues.month}
                      onChange={(event) =>
                        updateFormField("month", event.target.value)
                      }
                    />
                    <FieldError message={getErrorMessage("month")} />
                  </div>
                  <div>
                    <ContributionTextField label="Venue"
                      className={getFieldClassName("venue")}
                      required
                      aria-invalid={Boolean(getErrorMessage("venue"))}
                      value={formValues.venue}
                      maxLength={contributionFieldLimits.venue}
                      onChange={(event) =>
                        updateFormField("venue", event.target.value)
                      }
                      placeholder="Venue"
                    />
                    <FieldError message={getErrorMessage("venue")} />
                  </div>
                  <div>
                    <ContributionTextField label="Latitude"
                      className={getFieldClassName("latitude")}
                      required
                      aria-invalid={Boolean(getErrorMessage("latitude"))}
                      value={formValues.latitude}
                      maxLength={contributionFieldLimits.coordinate}
                      onChange={(event) =>
                        updateFormField("latitude", event.target.value)
                      }
                      placeholder="Latitude"
                    />
                    <FieldError message={getErrorMessage("latitude")} />
                  </div>
                  <div>
                    <ContributionTextField label="Longitude"
                      className={getFieldClassName("longitude")}
                      required
                      aria-invalid={Boolean(getErrorMessage("longitude"))}
                      value={formValues.longitude}
                      maxLength={contributionFieldLimits.coordinate}
                      onChange={(event) =>
                        updateFormField("longitude", event.target.value)
                      }
                      placeholder="Longitude"
                    />
                    <FieldError message={getErrorMessage("longitude")} />
                  </div>
                </div>
              </>
            ) : isArticleContribution ? null : (
              <div
                className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
              >
                <div>
                  <label className={labelClassName}>Author</label>
                  <input
                    className={inputClassName}
                    value={formValues.author}
                    onChange={(event) =>
                      updateFormField("author", event.target.value)
                    }
                    placeholder="Author"
                  />
                </div>
                <div>
                  <label className={labelClassName}>Source (optional)</label>
                  <input
                    className={inputClassName}
                    value={formValues.source}
                    onChange={(event) =>
                      updateFormField("source", event.target.value)
                    }
                    placeholder="Source (optional)"
                  />
                </div>
                <div>
                  <label className={labelClassName}>Date</label>
                  <input
                    className={inputClassName}
                    type="date"
                    value={formValues.date}
                    onChange={(event) =>
                      updateFormField("date", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClassName}>Status</label>
                  <select
                    className={inputClassName}
                    value={formValues.status}
                    onChange={(event) =>
                      updateFormField("status", event.target.value)
                    }
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            )}

            <div className="mt-6">
              <ContributionTextField label={isEventForm || isPlaceForm ? "Short Description" : "Main Content"}
                as="textarea"
                className={`${getFieldClassName(
                  isEventForm || isPlaceForm ? "shortDescription" : "mainContent",
                )} min-h-[150px] resize-y leading-relaxed`}
                required
                aria-invalid={Boolean(
                  getErrorMessage(
                    isEventForm || isPlaceForm ? "shortDescription" : "mainContent",
                  ),
                )}
                value={
                  isEventForm || isPlaceForm
                    ? formValues.shortDescription
                    : formValues.mainContent
                }
                maxLength={
                  isEventForm || isPlaceForm
                    ? contributionFieldLimits.shortDescription
                    : contributionFieldLimits.mainContent
                }
                onChange={(event) =>
                  updateFormField(
                    isEventForm || isPlaceForm
                      ? "shortDescription"
                      : "mainContent",
                    event.target.value,
                  )
                }
                placeholder={
                  isEventForm || isPlaceForm
                    ? "Short description"
                    : "Main content"
                }
              />
              <FieldError
                message={getErrorMessage(
                  isEventForm || isPlaceForm ? "shortDescription" : "mainContent",
                )}
              />
            </div>

            {config.formType === "event" || config.formType === "place" ? null : (
              <>
                <h2 className="mt-5 text-lg font-semibold text-slate-700">
                  Sections
                </h2>

                <div className="mt-3 space-y-4">
                  {formValues.sections.map((section, index) => (
                    <div
                      key={index}
                      className="border-t border-slate-200 pt-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium text-slate-600">
                          Section {index + 1}
                        </h3>
                        {formValues.sections.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeSection(index)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                          >
                            <HiOutlineTrash size={14} />
                            Remove
                          </button>
                        ) : null}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <ContributionTextField label="Section Title"
                            className={getFieldClassName(
                              `sections.${index}.title`,
                            )}
                            required
                            aria-invalid={Boolean(
                              getErrorMessage(`sections.${index}.title`),
                            )}
                            value={section.title}
                            maxLength={contributionFieldLimits.sectionTitle}
                            onChange={(event) =>
                              updateSection(index, "title", event.target.value)
                            }
                            placeholder="Section Title"
                          />
                          <FieldError
                            message={getErrorMessage(`sections.${index}.title`)}
                          />
                        </div>
                        <div>
                          {supportsSectionImageUploads ? (
                            <BlogImageFileInput
                              id={`blog-section-image-${index}`}
                              label={`Section ${index + 1} Image`}
                              file={section.imageFile}
                              error={getErrorMessage(`sections.${index}.image`)}
                              required
                              onChange={(file) =>
                                updateSectionImageFile(index, file)
                              }
                              onClear={() => updateSectionImageFile(index, null)}
                            />
                          ) : (
                            <>
                              <ContributionTextField label="Section Image URL"
                                className={getFieldClassName(
                                  `sections.${index}.image`,
                                )}
                                required
                                aria-invalid={Boolean(
                                  getErrorMessage(`sections.${index}.image`),
                                )}
                                value={section.image}
                                maxLength={contributionFieldLimits.sectionImage}
                                onChange={(event) =>
                                  updateSection(index, "image", event.target.value)
                                }
                                placeholder="Section Image URL"
                              />
                              <FieldError
                                message={getErrorMessage(`sections.${index}.image`)}
                              />
                            </>
                          )}
                        </div>
                        <div>
                          <ContributionTextField label="Section Content"
                            as="textarea"
                            className={`${getFieldClassName(
                              `sections.${index}.content`,
                            )} min-h-[150px] resize-y leading-relaxed`}
                            required
                            aria-invalid={Boolean(
                              getErrorMessage(`sections.${index}.content`),
                            )}
                            value={section.content}
                            maxLength={contributionFieldLimits.sectionContent}
                            onChange={(event) =>
                              updateSection(index, "content", event.target.value)
                            }
                            placeholder="Section content"
                          />
                          <FieldError
                            message={getErrorMessage(
                              `sections.${index}.content`,
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormValues((current) => ({
                      ...current,
                      sections: [...current.sections, emptySection()],
                    }))
                  }
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-800 hover:text-primary-blue"
                >
                  <HiOutlinePlus size={16} />
                  Add Section
                </button>
              </>
            )}

            <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                disabled={isSaving}
                className="rounded-full bg-primary-blue px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Save As Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("active")}
                disabled={isSaving}
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {config.submitButtonLabel}
              </button>
              <button
                type="button"
                onClick={() => navigate(config.dashboardPath)}
                disabled={isSaving}
                className="rounded-full bg-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-400 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default AiBlogContributionAdd;
