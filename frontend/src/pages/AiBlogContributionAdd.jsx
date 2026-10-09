import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineChevronDown,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi";
import { FaCheck } from "react-icons/fa";
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

const getItemId = (item = {}) => item._id || item.id;

const getItemDateValue = (item = {}) =>
  new Date(item.date || item.updatedAt || item.createdAt || 0).getTime();

const getItemDestination = (item = {}) =>
  item.destination || item.location || item.region || "";

const isSameDestination = (item = {}, destination = "") =>
  normalizeLocationKey(getItemDestination(item)) === normalizeLocationKey(destination);

const buildExactKeyword = (label) => {
  if (!label) return null;
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `^${escaped}$`;
};

const emptySection = () => ({
  title: "",
  image: "",
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
  "min-h-[42px] w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
const labelClassName = "mb-2 block text-xs font-semibold text-slate-600";

const DropdownBadge = ({
  label,
  options,
  selectedValue,
  isOpen,
  onToggle,
  onSelect,
  disabled = false,
}) => (
  <div className="relative w-full min-w-0 flex-1">
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${
        disabled
          ? "cursor-not-allowed border-black/10 bg-black/[0.03] text-black/35"
          : isOpen
            ? "border-sky-500 bg-sky-500 text-white"
            : "border-black/20 bg-white text-black/85 hover:border-sky-500"
      }`}
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
      <div className="absolute top-full z-40 mt-3 w-full min-w-[11rem] max-w-[calc(100vw-4rem)] rounded-2xl border border-sky-100 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
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
  const detailsRoute =
    isSubmittedByUser && itemId
      ? `${config.dashboardPath}/${itemId}`
      : typeof config.detailsRoute === "function"
      ? config.detailsRoute(item)
      : config.detailsRoute;
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
            Submitted by you
          </span>
        ) : null}
        <button
          type="button"
          onClick={() =>
            navigate(detailsRoute, {
              state: {
                content: item,
                item: detailStateItem,
                selectedStateLabel: stateName,
                returnSelection,
                sourceSearch: location.search,
              },
            })
          }
          className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-black/55 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-black/70"
        >
          <HiOutlineEye size={14} />
          View
        </button>
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
  const selectionStorageKey = getSelectionStorageKey(type);
  const hasAccess = Boolean(user?.[config.accessFlag]);
  const contributorName = user?.fullName?.trim() || user?.name || "";

  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedContinent, setSelectedContinent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationLabel, setSelectedLocationLabel] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState(() =>
    initialFormState(contributorName),
  );

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

    if (routeLocation.state?.freshAdd) {
      sessionStorage.removeItem(selectionStorageKey);
      navigate(`${routeLocation.pathname}${routeLocation.search}`, {
        replace: true,
        state: { ...routeLocation.state, freshAdd: false },
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
    setShowForm(false);
  }, [
    continentOptions.length,
    locations.length,
    navigate,
    routeLocation.pathname,
    routeLocation.search,
    routeLocation.state,
    selectedContinent,
    selectedCountry,
    selectedLocation,
    selectionStorageKey,
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

  const updateFormField = (field, value) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSection = (index, field, value) => {
    setFormValues((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
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

  const handleSubmit = (status) => {
    const cleanedSections = formValues.sections
      .map((section) => ({
        title: section.title.trim(),
        image: section.image.trim(),
        content: section.content.trim(),
      }))
      .filter((section) => section.title || section.image || section.content);

    const isEventForm = config.formType === "event";
    const isPlaceForm = config.formType === "place";
    const titleValue = isEventForm
      ? formValues.eventName
      : isPlaceForm
        ? formValues.placeName
        : formValues.mainTitle;
    const contentValue = isEventForm || isPlaceForm
      ? formValues.shortDescription
      : formValues.mainContent;

    if (!titleValue.trim()) {
      showErrorAlert(
        isEventForm
          ? "Event name is required."
          : isPlaceForm
            ? "Place name is required."
            : "Main title is required.",
      );
      return;
    }

    if (!contentValue.trim()) {
      showErrorAlert(
        isEventForm || isPlaceForm
          ? "Short description is required."
          : "Main content is required.",
      );
      return;
    }

    if (!selectedDestination) {
      showErrorAlert("Please select a continent, country and state.");
      return;
    }

    if (isEventForm) {
      createContribution({
        eventName: formValues.eventName.trim(),
        shortDescription: formValues.shortDescription.trim(),
        mainImage: formValues.mainImage.trim(),
        destination: selectedDestination,
        link: formValues.link.trim(),
        category: formValues.category.trim(),
        month: formValues.month.trim(),
        venue: formValues.venue.trim(),
        eventType: formValues.eventType.trim(),
        sections: cleanedSections,
        isDraft: status === "draft",
      });
      return;
    }

    if (isPlaceForm) {
      createContribution({
        placeName: formValues.placeName.trim(),
        shortDescription: formValues.shortDescription.trim(),
        mainImage: formValues.mainImage.trim(),
        destination: selectedDestination,
        link: formValues.link.trim(),
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
      });
      return;
    }

    createContribution({
      mainTitle: formValues.mainTitle.trim(),
      mainImage: formValues.mainImage.trim(),
      mainContent: formValues.mainContent.trim(),
      author: formValues.author.trim(),
      date: formValues.date ? new Date(formValues.date).toISOString() : null,
      destination: selectedDestination,
      blogType: formValues.link.trim(),
      link: formValues.link.trim(),
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
        <section className="mt-3 bg-transparent px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-2xl font-semibold uppercase text-slate-700">
              Add {config.contentLabel}
            </h1>

            <div
              ref={dropdownContainerRef}
              className="relative z-30 mb-5 grid gap-4 lg:grid-cols-3"
            >
              <DropdownBadge
                label="Continent"
                options={continentOptions}
                selectedValue={continentLabel}
                isOpen={openDropdown === "form-continent"}
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
                  setOpenDropdown(null);
                }}
              />

              <DropdownBadge
                label="Country"
                options={countryOptions}
                selectedValue={countryLabel}
                isOpen={openDropdown === "form-country"}
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
                  setOpenDropdown(null);
                }}
                disabled={!selectedContinent}
              />

              <DropdownBadge
                label="Location"
                options={locationOptions}
                selectedValue={locationLabel}
                isOpen={openDropdown === "form-location"}
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
                  setOpenDropdown(null);
                }}
                disabled={!selectedCountry}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className={labelClassName}>Link</label>
                <input
                  className={inputClassName}
                  value={formValues.link}
                  onChange={(event) => updateFormField("link", event.target.value)}
                  placeholder="Type URL here"
                />
              </div>
              <div>
                <label className={labelClassName}>
                  {config.formType === "event"
                    ? "Event Name"
                    : config.formType === "place"
                      ? "Place Name"
                      : "Main Title"}
                </label>
                <input
                  className={inputClassName}
                  value={
                    config.formType === "event"
                      ? formValues.eventName
                      : config.formType === "place"
                        ? formValues.placeName
                      : formValues.mainTitle
                  }
                  onChange={(event) =>
                    updateFormField(
                      config.formType === "event"
                        ? "eventName"
                        : config.formType === "place"
                          ? "placeName"
                          : "mainTitle",
                      event.target.value,
                    )
                  }
                  placeholder={
                    config.formType === "event"
                      ? "Event name"
                      : config.formType === "place"
                        ? "Place name"
                        : "Main title"
                  }
                />
              </div>
              <div>
                <label className={labelClassName}>Main Image URL</label>
                <input
                  className={inputClassName}
                  value={formValues.mainImage}
                  onChange={(event) =>
                    updateFormField("mainImage", event.target.value)
                  }
                  placeholder="Main image URL"
                />
              </div>
            </div>

            {config.formType === "event" ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={labelClassName}>Category</label>
                  <input
                    className={inputClassName}
                    value={formValues.category}
                    onChange={(event) =>
                      updateFormField("category", event.target.value)
                    }
                    placeholder="Category"
                  />
                </div>
                <div>
                  <label className={labelClassName}>Month</label>
                  <input
                    className={inputClassName}
                    value={formValues.month}
                    onChange={(event) =>
                      updateFormField("month", event.target.value)
                    }
                    placeholder="Month"
                  />
                </div>
                <div>
                  <label className={labelClassName}>Venue</label>
                  <input
                    className={inputClassName}
                    value={formValues.venue}
                    onChange={(event) =>
                      updateFormField("venue", event.target.value)
                    }
                    placeholder="Venue"
                  />
                </div>
                <div>
                  <label className={labelClassName}>Type</label>
                  <input
                    className={inputClassName}
                    value={formValues.eventType}
                    onChange={(event) =>
                      updateFormField("eventType", event.target.value)
                    }
                    placeholder="Type"
                  />
                </div>
              </div>
            ) : config.formType === "place" ? (
              <>
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={labelClassName}>Address</label>
                    <input
                      className={inputClassName}
                      value={formValues.address}
                      onChange={(event) =>
                        updateFormField("address", event.target.value)
                      }
                      placeholder="Address"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Google Maps Link</label>
                    <input
                      className={inputClassName}
                      value={formValues.googleMapsLink}
                      onChange={(event) =>
                        updateFormField("googleMapsLink", event.target.value)
                      }
                      placeholder="Google Maps link"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Rating</label>
                    <input
                      className={inputClassName}
                      value={formValues.rating}
                      onChange={(event) =>
                        updateFormField("rating", event.target.value)
                      }
                      placeholder="Rating"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Type</label>
                    <input
                      className={inputClassName}
                      value={formValues.placeType}
                      onChange={(event) =>
                        updateFormField("placeType", event.target.value)
                      }
                      placeholder="Type"
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label className={labelClassName}>Category</label>
                    <input
                      className={inputClassName}
                      value={formValues.category}
                      onChange={(event) =>
                        updateFormField("category", event.target.value)
                      }
                      placeholder="Category"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Month</label>
                    <input
                      className={inputClassName}
                      value={formValues.month}
                      onChange={(event) =>
                        updateFormField("month", event.target.value)
                      }
                      placeholder="Month"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Venue</label>
                    <input
                      className={inputClassName}
                      value={formValues.venue}
                      onChange={(event) =>
                        updateFormField("venue", event.target.value)
                      }
                      placeholder="Venue"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Latitude</label>
                    <input
                      className={inputClassName}
                      value={formValues.latitude}
                      onChange={(event) =>
                        updateFormField("latitude", event.target.value)
                      }
                      placeholder="Latitude"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Longitude</label>
                    <input
                      className={inputClassName}
                      value={formValues.longitude}
                      onChange={(event) =>
                        updateFormField("longitude", event.target.value)
                      }
                      placeholder="Longitude"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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
                  <label className={labelClassName}>Source</label>
                  <input
                    className={inputClassName}
                    value={formValues.source}
                    onChange={(event) =>
                      updateFormField("source", event.target.value)
                    }
                    placeholder="Source"
                  />
                </div>
                <div>
                  <label className={labelClassName}>Date</label>
                  <input
                    className={inputClassName}
                    type="date"
                    value={formValues.date}
                    onChange={(event) => updateFormField("date", event.target.value)}
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
              <label className={labelClassName}>
                {config.formType === "event" || config.formType === "place"
                  ? "Short Description"
                  : "Main Content"}
              </label>
              <textarea
                className={`${inputClassName} min-h-[150px] resize-y leading-relaxed`}
                value={
                  config.formType === "event" || config.formType === "place"
                    ? formValues.shortDescription
                    : formValues.mainContent
                }
                onChange={(event) =>
                  updateFormField(
                    config.formType === "event" || config.formType === "place"
                      ? "shortDescription"
                      : "mainContent",
                    event.target.value,
                  )
                }
                placeholder={
                  config.formType === "event" || config.formType === "place"
                    ? "Short description"
                    : "Main content"
                }
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
                      className="rounded-lg border border-slate-200 bg-white p-4"
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
                          <label className={labelClassName}>Section Title</label>
                          <input
                            className={inputClassName}
                            value={section.title}
                            onChange={(event) =>
                              updateSection(index, "title", event.target.value)
                            }
                            placeholder="Section Title"
                          />
                        </div>
                        <div>
                          <label className={labelClassName}>Section Image URL</label>
                          <input
                            className={inputClassName}
                            value={section.image}
                            onChange={(event) =>
                              updateSection(index, "image", event.target.value)
                            }
                            placeholder="Section Image URL"
                          />
                        </div>
                        <div>
                          <label className={labelClassName}>Section Content</label>
                          <textarea
                            className={`${inputClassName} min-h-[150px] resize-y leading-relaxed`}
                            value={section.content}
                            onChange={(event) =>
                              updateSection(index, "content", event.target.value)
                            }
                            placeholder="Section content"
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
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Save As Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("active")}
                disabled={isSaving}
                className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {config.submitButtonLabel}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={isSaving}
                className="rounded-lg bg-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-400 disabled:cursor-not-allowed"
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
