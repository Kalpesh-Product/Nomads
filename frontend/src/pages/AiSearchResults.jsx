import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineChevronDown,
  HiOutlineSearch,
  HiOutlineX,
} from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";

import { aiDestinationCards } from "../constants/aiDestinationCards";

import { defaultGoal, goalFilterMap } from "../constants/aiGoalFilters";

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
                    className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-sky-50 font-medium text-sky-600"
                        : "text-black/80 hover:bg-slate-50"
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {option}
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

  const [typedHeading, setTypedHeading] = useState("");
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [selectedGoalOption, setSelectedGoalOption] = useState(selectedFilter);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [headingAnimationKey, setHeadingAnimationKey] = useState(0);
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const dropdownContainerRef = useRef(null);

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
    const sortedSpeeds = filteredDestinations
      .map((destination) => destination.suggestions)
      .sort((left, right) => right - left);

    return filteredDestinations.map((destination, index) => ({
      ...destination,
      rankLabel: `Rank ${index + 1}`,
      speedLabel: `${sortedSpeeds[index]} Mbps`,
    }));
  }, [filteredDestinations]);

  const searchBarBadges = useMemo(() => {
    const badges = [selectedGoal];

    if (hasSelectedContinent || hasSelectedGoalOption) {
      badges.push(selectedContinent || "Select from below");
      badges.push(selectedGoalOption || "Select from below");
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
    setOpenDropdown(null);
    setHeadingAnimationKey((currentKey) => currentKey + 1);
  };

  const handleGoalOptionSelect = (option) => {
    setSelectedGoalOption(option);
    setOpenDropdown(null);
    setHeadingAnimationKey((currentKey) => currentKey + 1);
  };

  const headingText = hasSelectedFilters
    ? "Showing results for the selected option. Select any option to view your preferred results."
    : "Select one option from each badge above to view matching destinations.";

  useEffect(() => {
    setTypedHeading("");

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      currentIndex += 1;
      setTypedHeading(headingText.slice(0, currentIndex));

      if (currentIndex >= headingText.length) {
        clearInterval(typingInterval);
      }
    }, 25);

    return () => clearInterval(typingInterval);
  }, [headingText, headingAnimationKey]);

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

  useEffect(() => {
    setSelectedGoalOption(selectedFilter);
  }, [selectedFilter]);

  useEffect(() => {
    setShowAllDestinations(false);
  }, [selectedContinent, selectedGoalOption]);

  return (
    <div className="min-h-full bg-white">
      <main className="py-8">
        <div className="mx-0 w-full max-w-[80rem] px-4 sm:px-6 lg:mx-auto lg:max-w-[80rem] lg:px-0 lg:min-w-[75%]">
          <div className="rounded-[10px] bg-white px-4 py-6">
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-500 text-sky-500"
                aria-label="Go back"
              >
                <HiOutlineArrowLeft size={18} />
              </button>

              <div className="flex w-full flex-1 items-center rounded-[30px] border border-black/15 bg-white px-4 py-2 shadow-[0_2px_6px_rgba(0,0,0,0.03)] lg:ml-12 lg:mr-36">
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
            </div>

            <div className="relative mt-6 lg:ml-[6.25rem] lg:mr-36">
              <div
                ref={dropdownContainerRef}
                className="relative z-30 flex w-full flex-col gap-4 sm:flex-row sm:items-stretch"
              >
                <DropdownBadge
                  label="Continent"
                  options={continentOptions}
                  selectedValue={selectedContinent || "Select from below"}
                  isOpen={openDropdown === "continent"}
                  onToggle={() => handleDropdownToggle("continent")}
                  onSelect={handleContinentSelect}
                />

                <DropdownBadge
                  label={selectedGoal}
                  options={goalOptions}
                  selectedValue={selectedGoalOption || "Select from below"}
                  isOpen={openDropdown === "goalOption"}
                  onToggle={() => handleDropdownToggle("goalOption")}
                  onSelect={handleGoalOptionSelect}
                />
              </div>

              <div className="relative mt-8">
                <div className="relative z-10">
                  <p className="text-sm font-medium leading-snug text-black/85 lg:text-lg font-play">
                    {typedHeading}
                  </p>

                  {hasSelectedFilters ? (
                    <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
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
                          <div className="relative overflow-hidden rounded-2xl">
                            <img
                              src={destination.image}
                              alt={`${destination.city}, ${destination.country}`}
                              className="h-56 w-full rounded-2xl object-cover"
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-4 py-3 text-white">
                              <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm">
                                {destination.speedLabel}
                              </span>
                              <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm">
                                {destination.rankLabel}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-[1.2rem] font-semibold text-black/90">
                                {destination.city}
                              </h3>
                            </div>
                            <p className="mt-1 text-[1rem] font-semibold text-black/90">
                              {destination.country}
                            </p>
                          </div>
                          <div>
                            <p className="text-[0.9rem] text-black/60">
                              Find activation options
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                      Results will appear here after you select both filters
                      above.
                    </div>
                  )}

                  {shouldShowViewMore && (
                    <button
                      type="button"
                      onClick={() => setShowAllDestinations(true)}
                      className="mx-auto mt-8 block text-center text-base font-semibold text-sky-600 transition-colors hover:text-sky-700"
                    >
                      View More
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
