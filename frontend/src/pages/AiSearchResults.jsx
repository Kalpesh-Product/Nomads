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
import { useLocation, useNavigate } from "react-router-dom";

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
        className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${
          isOpen
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
                    className={`group flex w-full items-center rounded-xl px-4 py-2 text-left text-sm transition-colors ${
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
  const { state } = useLocation();
  const selectedGoal =
    state?.selectedGoal && goalFilterMap[state.selectedGoal]
      ? state.selectedGoal
      : defaultGoal;
  const goalOptions = goalFilterMap[selectedGoal] || goalFilterMap[defaultGoal];
  const selectedFilter = null;

  const [typedTopHeading, setTypedTopHeading] = useState("");
  const [typedBottomHeading, setTypedBottomHeading] = useState("");
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [selectedGoalOption, setSelectedGoalOption] = useState(selectedFilter);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const dropdownContainerRef = useRef(null);
  const closeDropdownTimeoutRef = useRef(null);

  const topTypingIntervalRef = useRef(null);
  const bottomTypingIntervalRef = useRef(null);
  const selectedHeadingDelayTimeoutRef = useRef(null);
  const previousSelectedPairRef = useRef(null);

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

    if (hasSelectedContinent || hasSelectedGoalOption) {
      badges.push(selectedContinent || "Select Location");
      badges.push(selectedGoalOption || "Select Attribute");
    }

    return badges;
  }, [
    hasSelectedContinent,
    hasSelectedGoalOption,
    selectedContinent,
    selectedGoal,
    selectedGoalOption,
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
    const location = destination.city.toLowerCase();
    const continent = destination.continent.toLowerCase();

    navigate(
      `/ai-verticals?country=${encodeURIComponent(country)}&state=${encodeURIComponent(location)}`,
      {
        state: {
          breadcrumbFilters: {
            continent,
            country,
            location,
          },
          searchBarBadges,
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
    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
    }
    closeDropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  const handleGoalOptionSelect = (option) => {
    setSelectedGoalOption(option);
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
    "Select one option from each badge below to view matching destinations.";
  const selectedTopHeadingText = "Showing results for the selected options.";
  const selectedBottomHeadingText =
    "Change any of the above options to view your preferred results.";

  const thinkingHeadingText = "Thinking...";

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
    }, 25);

    return intervalId;
  }, []);

  const playInitialHeadingAnimation = useCallback(() => {
    clearTypingAnimations();
    setTypedBottomHeading("");

    topTypingIntervalRef.current = animateTypedText(
      initialTopHeadingText,
      setTypedTopHeading,
    );
  }, [animateTypedText, clearTypingAnimations, initialTopHeadingText]);

  const playSelectedHeadingAnimation = useCallback(() => {
    clearTypingAnimations();
    setTypedBottomHeading("");

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
              );
            },
          );
        }, 2000);
      },
    );
  }, [
    animateTypedText,
    clearTypingAnimations,
    thinkingHeadingText,
    selectedBottomHeadingText,
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
    setSelectedGoalOption(selectedFilter);
  }, [selectedFilter]);

  useEffect(() => {
    setShowAllDestinations(false);
  }, [selectedContinent, selectedGoalOption]);

  useEffect(() => {
    const selectedPair = hasSelectedFilters
      ? `${selectedContinent}|${selectedGoalOption}`
      : null;

    if (selectedPair && previousSelectedPairRef.current !== selectedPair) {
      playSelectedHeadingAnimation();
    }

    previousSelectedPairRef.current = selectedPair;
  }, [
    hasSelectedFilters,
    playSelectedHeadingAnimation,
    selectedContinent,
    selectedGoalOption,
  ]);

  return (
    <div className="min-h-full bg-white">
      <main className="pb-8">
        <div className="mx-0 w-full max-w-[80rem] px-1 sm:px-6 lg:mx-auto lg:max-w-[80rem] lg:px-0 lg:min-w-[75%]">
          <div className="rounded-[10px] bg-white px-0 pb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/home")}
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
              <p className="flex items-center gap-2 text-sm font-medium leading-snug text-black/85 lg:text-lg font-play">
                {isThinkingHeadingVisible && (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-b-transparent"
                    aria-hidden="true"
                  />
                )}
                {typedTopHeading}
              </p>
            </div>

            <div className="mt-4 hidden max-w-4xl items-center rounded-[30px] border border-black/15 bg-white px-4 py-2 shadow-[0_2px_6px_rgba(0,0,0,0.03)] sm:flex lg:ml-[6.25rem] lg:mr-36">
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
                  <p
                    className={`text-sm font-medium leading-snug text-black/85 lg:text-lg font-play ${typedBottomHeading ? "visible" : "invisible"}`}
                  >
                    {typedBottomHeading || " "}
                  </p>

                  {hasSelectedFilters ? (
                    <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:gap-4 xl:grid-cols-3">
                      {visibleDestinations.map((destination) => (
                        <article
                          key={`${destination.city}-${destination.country}`}
                          className="cursor-pointer"
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
                              className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-1.5 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-2 py-2 text-white md:gap-3 md:px-4 md:py-3 ${
                                isPrimaryGoalOptionSelected
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
                                {`${destination.city} - `}
                              </h3>
                            </div>

                            <p className="truncate text-[0.8rem] font-semibold leading-tight text-black/90  md:text-[1.2rem]">
                              {destination.country}
                            </p>
                          </div>
                          <div>
                            <p className="text-[0.82rem] text-black/60 md:text-[0.9rem]">
                              Find activation options
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

                  {shouldShowViewMore && (
                    <button
                      type="button"
                      onClick={() => setShowAllDestinations(true)}
                      className="mx-auto mt-8 block text-center text-base font-semibold text-sky-600 transition-colors hover:text-sky-700"
                    >
                      View more
                    </button>
                  )}

                  {hasSelectedFilters && !rankedDestinations.length && (
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
