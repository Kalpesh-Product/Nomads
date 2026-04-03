import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineChevronDown,
  HiOutlineSearch,
  HiOutlineX,
} from "react-icons/hi";
import { FaCheck } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { aiDestinationCards } from "../constants/aiDestinationCards";

import {
  defaultGoal,
  getGoalOptionMetricLabel,
  goalFilterMap,
} from "../constants/aiGoalFilters";

const continentOptions = [
  "World",
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
];

const destinationCards = aiDestinationCards;

const INITIAL_VISIBLE_DESTINATIONS = 18;
const TYPING_INTERVAL_MS = 8;
const SELECTED_HEADING_TRANSITION_DELAY_MS = 1200;
const DESTINATION_REVEAL_INTERVAL_MS = 70;
const SEARCH_RESULTS_GOAL_STORAGE_KEY = "aiSearchResults.selectedGoal";
const SEARCH_RESULTS_SELECTION_SIGNATURE_STORAGE_KEY =
  "aiSearchResults.selectionSignature";

const goalNameBySlug = {
  worldranking: "World Ranking",
  workfromanywhere: "Work From Anywhere",
  increaseyoursavings: "Increase Your Savings",
  advanceyourcareer: "Advance Your Career",
  findyourcommunity: "Find Your Community",
};


const goalNarrativeTopHeadingMap = {
  "World Ranking":
    "Please find below the best curated results from the options you suggested to me based on world ranking index.",
  "Work From Anywhere":
    "Please find below the best curated results from the options you suggested to me to help you discover and work from the best nomad destinations.",
  "Increase Your Savings":
    "Please find below the best curated results from the options you suggested to me to help you increase your savings.",
  "Advance Your Career":
    "Please find below the best curated results from the options you suggested to me to help you advance your career.",
  "Find Your Community":
    "Please find below the best curated results from the options you suggested to me to help you discover your preferred community in nomad destinations.",
  "Search Old School":
    "Please find below the best curated results from the options you suggested to me to help you discover your preferred nomad destinations.",
};

const searchBarBadgeClassName =
  "inline-flex min-h-[40px] min-w-[5rem] items-center rounded-full border border-black/30 px-4 py-2 text-xs font-medium text-black/85";

const DropdownBadge = ({
  label,
  options,
  selectedValue,
  isOpen,
  onToggle,
  onSelect,
  align = "left",
}) => {
  const menuAlignment = align === "right" ? "right-0" : "left-0";

  return (
    <div className="relative w-full min-w-0 flex-1">
      <button
        type="button"
        onClick={onToggle}
        className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${isOpen
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

      {isOpen && (
        <div
          className={`absolute top-full z-40 mt-3 min-w-[11rem] w-full max-w-[calc(100vw-4rem)] rounded-2xl border border-sky-100 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)] ${menuAlignment}`}
        >
          <ul
            className="max-h-72 overflow-y-auto"
            role="listbox"
            aria-label={label}
          >
            {options.map((option) => {
              const isSelected = option === selectedValue;

              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => onSelect(option)}
                    className={`group flex w-full items-center rounded-xl px-4 py-2 text-left text-sm transition-colors ${isSelected
                      ? "bg-sky-50 font-medium text-sky-600"
                      : "text-black/80 hover:bg-slate-50"
                      }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="mr-2 inline-flex w-4 shrink-0 items-center justify-center">
                      <FaCheck
                        size={13}
                        className={`shrink-0 text-primary-blue transition-opacity ${isSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                          }`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="pl-1">{option}</span>
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

const AiSearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { goal, loc, attr } = useParams();
  const { state } = location;
  const requestedGoalFromUrl = goal ? goalNameBySlug[goal.toLowerCase()] : null;
  const requestedGoal = state?.selectedGoal || requestedGoalFromUrl;
  const selectedGoal =
    requestedGoal && goalFilterMap[requestedGoal] ? requestedGoal : defaultGoal;
  const searchResultsBasePath = goal
    ? `/search/${encodeURIComponent(goal)}/results`
    : "/search/results";
  const goalOptions = goalFilterMap[selectedGoal] || goalFilterMap[defaultGoal];
  const getPersistedGoal = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(SEARCH_RESULTS_GOAL_STORAGE_KEY);
  },
    getPersistedSelectionSignature = () => {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(SEARCH_RESULTS_SELECTION_SIGNATURE_STORAGE_KEY);
    };

  const initialContinent = useMemo(() => {
    if (loc) return decodeURIComponent(loc);
    return state?.selectedFilters?.continent || null;
  }, [loc, state?.selectedFilters?.continent]);

  const initialGoalOption = useMemo(() => {
    if (attr) return decodeURIComponent(attr);
    return state?.selectedFilters?.goalOption || null;
  }, [attr, state?.selectedFilters?.goalOption]);

  const [typedTopHeading, setTypedTopHeading] = useState("");
  const [typedBottomHeading, setTypedBottomHeading] = useState("");
  const [typedResultsHeading, setTypedResultsHeading] = useState("");
  const [selectedContinent, setSelectedContinent] = useState(initialContinent);
  const [selectedGoalOption, setSelectedGoalOption] = useState(initialGoalOption);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const [isResultsReady, setIsResultsReady] = useState(false);
  const [visibleDestinationCount, setVisibleDestinationCount] = useState(0);
  const dropdownContainerRef = useRef(null);
  const closeDropdownTimeoutRef = useRef(null);

  const topTypingIntervalRef = useRef(null);
  const bottomTypingIntervalRef = useRef(null);
  const selectedHeadingDelayTimeoutRef = useRef(null);
  const previousSelectedPairRef = useRef(null);
  const previousGoalRef = useRef(getPersistedGoal() || selectedGoal);

  const hasSelectedContinent = Boolean(selectedContinent);
  const hasSelectedGoalOption = Boolean(selectedGoalOption);
  const hasSelectedFilters = hasSelectedContinent && hasSelectedGoalOption;

  const filteredDestinations = useMemo(() => {
    if (!hasSelectedFilters) {
      return [];
    }

    if (selectedContinent === "World") {
      return destinationCards;
    }

    return destinationCards.filter(
      (destination) => destination.continent === selectedContinent,
    );
  }, [hasSelectedFilters, selectedContinent]);

  const rankedDestinations = useMemo(() => {
    const goalOptionMetricLabel = getGoalOptionMetricLabel(selectedGoalOption);
    const sortedSpeeds = filteredDestinations
      .map((destination) => destination.suggestions)
      .sort((left, right) => right - left);

    return filteredDestinations.map((destination, index) => ({
      ...destination,
      rankLabel: `Rank ${index + 1}`,
      speedLabel: `${sortedSpeeds[index]} ${goalOptionMetricLabel}`,
    }));
  }, [filteredDestinations, selectedGoalOption]);

  const searchBarBadges = useMemo(() => {
    const badges = [selectedGoal];

    const displayLoc = loc ? decodeURIComponent(loc) : selectedContinent;
    const displayAttr = attr ? decodeURIComponent(attr) : selectedGoalOption;

    if (displayLoc) {
      badges.push(displayLoc);
    }

    if (displayAttr) {
      badges.push(displayAttr);
    }

    return badges;
  }, [
    loc,
    attr,
    selectedContinent,
    selectedGoalOption,
    selectedGoal,
  ]);

  const visibleDestinations = useMemo(() => {
    if (showAllDestinations) {
      return rankedDestinations;
    }

    return rankedDestinations.slice(0, INITIAL_VISIBLE_DESTINATIONS);
  }, [rankedDestinations, showAllDestinations]);

  const shouldShowViewMore =
    rankedDestinations.length > INITIAL_VISIBLE_DESTINATIONS &&
    !showAllDestinations;

  const handleDestinationClick = (destination) => {
    const country = destination.country.toLowerCase();
    const selectedLocationLabel = destination.displayCity || destination.city;
    const selectedLocationParam = (
      destination.routeCity || destination.city
    ).toLowerCase();
    const continent = destination.continent.toLowerCase();
    const nextSearchBarBadges = [...searchBarBadges, selectedLocationLabel];

    navigate(
      `/ai-verticals?country=${encodeURIComponent(country)}&state=${encodeURIComponent(selectedLocationParam)}`,
      {
        state: {
          breadcrumbFilters: {
            continent,
            country,
            location: selectedLocationParam,
          },
          selectedFilters: {
            continent: selectedContinent,
            goalOption: selectedGoalOption,
          },
          searchBarBadges: nextSearchBarBadges,
        },
      },
    );
  };

  const handleDropdownToggle = (dropdownKey) => {
    setOpenDropdown((currentDropdown) =>
      currentDropdown === dropdownKey ? null : dropdownKey,
    );
  };

  const handleContinentSelect = (continent) => {
    setSelectedContinent(continent);
    const encodedLoc = encodeURIComponent(continent);
    if (selectedGoalOption) {
      navigate(
        `${searchResultsBasePath}/${encodedLoc}/${encodeURIComponent(selectedGoalOption)}`,
        { state },
      );
    } else {
      navigate(`${searchResultsBasePath}/${encodedLoc}`, { state });
    }

    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
    }
    closeDropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  const handleGoalOptionSelect = (option) => {
    setSelectedGoalOption(option);
    const encodedLoc = selectedContinent ? encodeURIComponent(selectedContinent) : "World";
    const encodedAttr = encodeURIComponent(option);
    navigate(`${searchResultsBasePath}/${encodedLoc}/${encodedAttr}`, { state });

    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
    }
    closeDropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  const isPrimaryGoalOptionSelected =
    hasSelectedGoalOption && selectedGoalOption === goalOptions[0];

  const initialTopHeadingText =
    "Please select one option from each below so that I can display the best curated results.";
  const selectedTopHeadingText =
    goalNarrativeTopHeadingMap[requestedGoal] ||
    goalNarrativeTopHeadingMap[selectedGoal] ||
    goalNarrativeTopHeadingMap["World Ranking"];
  const selectedBottomHeadingText =
    "Feel free to edit your above selection anytime and I will curate the new set of best results for you.";

  const selectedResultsHeadingText = useMemo(() => {
    if (!selectedContinent || !selectedGoalOption) {
      return "";
    }

    return `Curated below are the best cities in ${selectedContinent} as per the ${selectedGoalOption} for you. The results below are ranked using WoNo’s Intelligence Model, analyzing 50+ global factors — including safety, nomad population, healthcare, visa flexibility, cost of living, taxation, work infrastructure, lifestyle quality, and community — tailored to your personal profile.`;
  }, [selectedContinent, selectedGoalOption]);

  const thinkingHeadingText = "Curating the best results for you";

  const isThinkingHeadingVisible =
    typedTopHeading.length > 0 &&
    thinkingHeadingText.startsWith(typedTopHeading);

  const clearTypingAnimations = useCallback(() => {
    if (topTypingIntervalRef.current) {
      clearInterval(topTypingIntervalRef.current);
      topTypingIntervalRef.current = null;
    }

    if (bottomTypingIntervalRef.current) {
      clearInterval(bottomTypingIntervalRef.current);
      bottomTypingIntervalRef.current = null;
    }

    if (selectedHeadingDelayTimeoutRef.current) {
      clearTimeout(selectedHeadingDelayTimeoutRef.current);
      selectedHeadingDelayTimeoutRef.current = null;
    }
  }, []);

  const animateTypedText = useCallback((text, setText, onComplete) => {
    setText("");

    if (!text) {
      onComplete?.();
      return null;
    }

    let currentIndex = 0;

    const intervalId = setInterval(() => {
      currentIndex += 1;
      setText(text.slice(0, currentIndex));

      if (currentIndex >= text.length) {
        clearInterval(intervalId);
        onComplete?.();
      }
    }, TYPING_INTERVAL_MS);

    return intervalId;
  }, []);

  const playInitialHeadingAnimation = useCallback(() => {
    clearTypingAnimations();
    setIsResultsReady(false);
    setTypedBottomHeading("");

    setTypedResultsHeading("");

    topTypingIntervalRef.current = animateTypedText(
      initialTopHeadingText,
      setTypedTopHeading,
    );
  }, [animateTypedText, clearTypingAnimations, initialTopHeadingText]);

  const playSelectedHeadingAnimation = useCallback(() => {
    clearTypingAnimations();
    setIsResultsReady(false);
    setTypedBottomHeading("");
    setTypedResultsHeading("");

    topTypingIntervalRef.current = animateTypedText(
      thinkingHeadingText,
      setTypedTopHeading,
      () => {
        selectedHeadingDelayTimeoutRef.current = setTimeout(() => {
          topTypingIntervalRef.current = animateTypedText(
            selectedTopHeadingText,
            setTypedTopHeading,
            () => {
              bottomTypingIntervalRef.current = animateTypedText(
                selectedBottomHeadingText,
                setTypedBottomHeading,
                () => {
                  bottomTypingIntervalRef.current = animateTypedText(
                    selectedResultsHeadingText,
                    setTypedResultsHeading,
                    () => {
                      setIsResultsReady(true);
                    },
                  );
                },
              );
            },
          );
        }, SELECTED_HEADING_TRANSITION_DELAY_MS);
      },
    );
  }, [
    animateTypedText,
    clearTypingAnimations,
    thinkingHeadingText,
    selectedBottomHeadingText,
    selectedResultsHeadingText,
    selectedTopHeadingText,
  ]);

  useEffect(() => {
    playInitialHeadingAnimation();

    return () => {
      clearTypingAnimations();
    };
  }, [clearTypingAnimations, playInitialHeadingAnimation]);

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

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(
    () => () => {
      if (closeDropdownTimeoutRef.current) {
        clearTimeout(closeDropdownTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (loc) {
      setSelectedContinent(decodeURIComponent(loc));
    } else if (loc === undefined) {
      setSelectedContinent(null);
    }
  }, [loc]);

  useEffect(() => {
    if (attr) {
      setSelectedGoalOption(decodeURIComponent(attr));
    } else if (attr === undefined) {
      setSelectedGoalOption(null);
    }
  }, [attr]);

  useEffect(() => {
    const incomingFilters = location.state?.selectedFilters;
    if (!incomingFilters || loc || attr) return; // If URL params exist, they take priority

    setSelectedContinent(incomingFilters.continent || null);
    setSelectedGoalOption(incomingFilters.goalOption || null);
  }, [location.state, loc, attr]);

  // Redundant localStorage sync removed as per user request to use URLs instead
  /*
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedContinent) {
      localStorage.setItem(
        SEARCH_RESULTS_LOCATION_STORAGE_KEY,
        selectedContinent,
      );
    } else {
      localStorage.removeItem(SEARCH_RESULTS_LOCATION_STORAGE_KEY);
    }
  }, [selectedContinent]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedGoalOption) {
      localStorage.setItem(
        SEARCH_RESULTS_ATTRIBUTE_STORAGE_KEY,
        selectedGoalOption,
      );
    } else {
      localStorage.removeItem(SEARCH_RESULTS_ATTRIBUTE_STORAGE_KEY);
    }
  }, [selectedGoalOption]);
  */

  // Goal-change effect
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (previousGoalRef.current !== selectedGoal) {
      setSelectedContinent(null);
      setSelectedGoalOption(null);
      // If we are at a deep results URL, go back to root results on goal change
      if (loc || attr) {
        navigate(searchResultsBasePath, { state: location.state });
      }
    }

    if (selectedGoal) {
      localStorage.setItem(SEARCH_RESULTS_GOAL_STORAGE_KEY, selectedGoal);
    }

    previousGoalRef.current = selectedGoal;
  }, [selectedGoal, navigate, loc, attr, location.state, searchResultsBasePath]);

  useEffect(() => {
    if (!hasSelectedFilters) {
      setIsResultsReady(false);
      setTypedBottomHeading("");
      setTypedResultsHeading("");
    }
  }, [hasSelectedFilters]);

  useEffect(() => {
    setShowAllDestinations(false);
  }, [selectedContinent, selectedGoalOption]);

  useEffect(() => {
    if (!hasSelectedFilters || !isResultsReady) {
      setVisibleDestinationCount(0);
      return;
    }

    if (!visibleDestinations.length) {
      setVisibleDestinationCount(0);
      return;
    }

    let currentVisibleCount = 0;

    const revealInterval = setInterval(() => {
      currentVisibleCount += 1;
      setVisibleDestinationCount(currentVisibleCount);

      if (currentVisibleCount >= visibleDestinations.length) {
        clearInterval(revealInterval);
      }
    }, DESTINATION_REVEAL_INTERVAL_MS);

    return () => {
      clearInterval(revealInterval);
    };
  }, [hasSelectedFilters, isResultsReady, visibleDestinations]);

  useEffect(() => {
    const persistedSignature = getPersistedSelectionSignature();
    const persistedGoal = getPersistedGoal();
    const selectedPair = hasSelectedFilters
      ? `${selectedContinent}|${selectedGoalOption}`
      : null;
    const selectedSignature = selectedPair
      ? `${selectedGoal}|${selectedPair}`
      : null;

    if (!selectedSignature) {
      previousSelectedPairRef.current = selectedPair;
      return;
    }

    const isFirstRenderForSelection = previousSelectedPairRef.current === null;
    const hasPersistedMatch =
      persistedSignature === selectedSignature && persistedGoal === selectedGoal;

    if (isFirstRenderForSelection && hasPersistedMatch) {
      clearTypingAnimations();
      setTypedTopHeading(selectedTopHeadingText);
      setTypedBottomHeading(selectedBottomHeadingText);
      setTypedResultsHeading(selectedResultsHeadingText);
      setIsResultsReady(true);
    } else if (previousSelectedPairRef.current !== selectedPair) {
      playSelectedHeadingAnimation();
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(
        SEARCH_RESULTS_SELECTION_SIGNATURE_STORAGE_KEY,
        selectedSignature,
      );
    }

    previousSelectedPairRef.current = selectedPair;
  }, [
    clearTypingAnimations,
    hasSelectedFilters,
    playSelectedHeadingAnimation,
    selectedBottomHeadingText,
    selectedContinent,
    selectedGoal,
    selectedGoalOption,
    selectedResultsHeadingText,
    selectedTopHeadingText,
  ]);

  const shouldShowResultsContent = hasSelectedFilters && isResultsReady;
  const shouldShowNarrative =
    hasSelectedFilters && (typedBottomHeading || typedResultsHeading);

  return (
    <div className="min-h-full bg-white">
      <main className="pb-8">
        <div className="mx-0 w-full max-w-[80rem] px-3 sm:px-6 lg:mx-auto lg:max-w-[80rem] lg:px-0 lg:min-w-[75%]">
          <div className="rounded-[10px] bg-white px-0 pb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-500 text-sky-500"
                aria-label="Go back"
              >
                <HiOutlineArrowLeft size={18} />
              </button>
              <span className="text-lg font-semibold text-primary-blue sm:hidden">
                {selectedGoal}
              </span>
            </div>

            <div className="mt-6 mb-6 lg:ml-[6.25rem] lg:mr-36">
              <p className="flex items-center gap-2 text-sm font-medium leading-snug text-black/85 lg:text-[0.9rem] font-play">
                {isThinkingHeadingVisible && (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-b-transparent"
                    aria-hidden="true"
                  />
                )}
                {typedTopHeading}
              </p>
            </div>

            <div className="mt-4 hidden max-w-full items-center rounded-[30px] border border-black/15 bg-white px-4 py-2 shadow-[0_2px_6px_rgba(0,0,0,0.03)] sm:flex lg:ml-[6.25rem] lg:mr-36">
              <div className="flex flex-wrap items-center gap-2">
                {searchBarBadges.map((badgeLabel, index) => (
                  <div
                    key={`${badgeLabel}-${index}`}
                    className={searchBarBadgeClassName}
                  >
                    <span className="truncate">{badgeLabel}</span>
                  </div>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-black/70 transition-colors hover:bg-black/5 hover:text-black"
                  aria-label="Clear search and go back"
                >
                  <HiOutlineX size={24} />
                </button>
                <HiOutlineSearch size={34} className="text-black/90" />
              </div>
            </div>

            <div className="relative mt-6 lg:ml-[6.25rem] lg:mr-36">
              <div
                ref={dropdownContainerRef}
                className="relative z-30 flex w-full flex-col gap-4 sm:flex-row sm:items-stretch"
              >
                <DropdownBadge
                  label="Continent"
                  options={continentOptions}
                  selectedValue={selectedContinent || "Select Location"}
                  isOpen={openDropdown === "continent"}
                  onToggle={() => handleDropdownToggle("continent")}
                  onSelect={handleContinentSelect}
                />

                <DropdownBadge
                  label={selectedGoal}
                  options={goalOptions}
                  selectedValue={selectedGoalOption || "Select Attribute"}
                  isOpen={openDropdown === "goalOption"}
                  onToggle={() => handleDropdownToggle("goalOption")}
                  onSelect={handleGoalOptionSelect}
                />
              </div>

              <div className="relative mt-8">
                <div className="relative z-10">
                  {shouldShowNarrative && (
                    <>
                      <p className="text-sm font-medium leading-relaxed text-primary-blue lg:text-[0.9rem] font-play">
                        {typedBottomHeading}
                      </p>
                      <p className="mt-6 text-sm font-medium leading-relaxed text-black/85 lg:text-[0.9rem] font-play">
                        {typedResultsHeading}
                      </p>
                    </>
                  )}

                  {shouldShowResultsContent ? (
                    <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:gap-4 xl:grid-cols-3">
                      {visibleDestinations.map((destination, index) => (
                        <article
                          key={`${destination.city}-${destination.country}`}
                          className={`cursor-pointer transition-all duration-300 ${index < visibleDestinationCount
                            ? "translate-y-0 opacity-100"
                            : "pointer-events-none translate-y-2 opacity-0"
                            }`}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleDestinationClick(destination)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleDestinationClick(destination);
                            }
                          }}
                        >
                          <div className="relative overflow-hidden rounded-xl md:rounded-2xl">
                            <img
                              src={destination.image}
                              alt={`${destination.city}, ${destination.country}`}
                              className="aspect-square w-full rounded-xl object-cover md:rounded-2xl"
                            />
                            <div
                              className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-1.5 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-2 py-2 text-white md:gap-3 md:px-4 md:py-3 ${isPrimaryGoalOptionSelected
                                ? "justify-end"
                                : "justify-between"
                                }`}
                            >
                              {!isPrimaryGoalOptionSelected && (
                                <span className="rounded-full bg-black/45 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide backdrop-blur-sm md:px-3 md:py-1 md:text-xs">
                                  {destination.speedLabel}
                                </span>
                              )}
                              <span className="rounded-full bg-black/45 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide backdrop-blur-sm md:px-3 md:py-1 md:text-xs">
                                {destination.rankLabel}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1.5 flex items-start justify-start gap-1 md:mt-2 md:gap-1">
                            <div className="min-w-0">
                              <h3 className="truncate text-[0.8rem] font-semibold leading-tight text-black/90 md:text-[1.2rem]">
                                {`${destination.displayCity || destination.city} - `}
                              </h3>
                            </div>

                            <p className="truncate text-[0.8rem] font-semibold leading-tight text-black/90  md:text-[1.2rem]">
                              {destination.country}
                            </p>
                          </div>
                          <div>
                            <p className="text-[0.82rem] text-black/60 md:text-[0.9rem]">
                              Click to view options
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                      Results will appear here after you select both filters
                      above.
                    </div> */}
                    </>
                  )}

                  {shouldShowResultsContent && shouldShowViewMore && (
                    <button
                      type="button"
                      onClick={() => setShowAllDestinations(true)}
                      className="mx-auto mt-8 block text-center text-base font-semibold text-sky-600 transition-colors hover:text-sky-700"
                    >
                      View more
                    </button>
                  )}

                  {shouldShowResultsContent && !rankedDestinations.length && (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                      No destinations are available for {selectedContinent}{" "}
                      right now.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiSearchResults;
