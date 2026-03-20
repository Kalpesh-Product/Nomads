import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineChevronDown,
  HiOutlineSearch,
  HiOutlineX,
} from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";

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

const destinationCards = [
  {
    city: "Goa",
    country: "India",
    continent: "Asia",
    suggestions: 102,
    image: "/images/goa-image.jpg",
  },
  {
    city: "Bali",
    country: "Indonesia",
    continent: "Asia",
    suggestions: 89,
    image: "/images/bali-image.jpg",
  },
  {
    city: "Bangkok",
    country: "Thailand",
    continent: "Asia",
    suggestions: 93,
    image: "/images/bangkok-image.jpg",
  },
  {
    city: "Dubai",
    country: "United Arab Emirates",
    continent: "Asia",
    suggestions: 101,
    image: "/images/dubai-image.webp",
  },
  {
    city: "Budapest",
    country: "Hungary",
    continent: "Europe",
    suggestions: 78,
    image: "/images/budapest-image.jpg",
  },
  {
    city: "Auckland",
    country: "New Zealand",
    continent: "Oceania",
    suggestions: 83,
    image: "/images/auckland-image.jpg",
  },
];

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
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${
          isOpen
            ? "border-sky-500 bg-sky-500 text-white"
            : "border-black/20 bg-white text-black/85 hover:border-sky-500"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="max-w-[12rem] truncate sm:max-w-none">
          {selectedValue}
        </span>
        <HiOutlineChevronDown
          size={18}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full z-40 mt-3 w-[18rem] max-w-[calc(100vw-4rem)] rounded-2xl border border-sky-100 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)] ${menuAlignment}`}
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
  const selectedFilter =
    state?.selectedFilter && goalOptions.includes(state.selectedFilter)
      ? state.selectedFilter
      : goalOptions[0];

  const [typedHeading, setTypedHeading] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("World");
  const [selectedGoalOption, setSelectedGoalOption] = useState(selectedFilter);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [headingAnimationKey, setHeadingAnimationKey] = useState(0);
  const dropdownContainerRef = useRef(null);

  const filteredDestinations = useMemo(() => {
    if (selectedContinent === "World") {
      return destinationCards;
    }

    return destinationCards.filter(
      (destination) => destination.continent === selectedContinent,
    );
  }, [selectedContinent]);

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

  const headingText =
    "Showing results for the selected option. Select any option to view your preferred results.";

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

  return (
    <div className="min-h-full bg-white">
      <main className="py-8">
        <div className="mx-0 min-w-[75%] max-w-[80rem] px-6 sm:px-6 lg:mx-auto lg:max-w-[80rem] lg:px-0">
          <div className="rounded-[10px] bg-white px-4 py-6">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-500 text-sky-500"
                aria-label="Go back"
              >
                <HiOutlineArrowLeft size={18} />
              </button>

              <div className="ml-20 mr-36 flex flex-1 items-center rounded-full border border-black/15 bg-white px-4 py-2 shadow-[0_2px_6px_rgba(0,0,0,0.03)]">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-full border border-black/30 px-4 py-2 text-xs font-medium text-black/85">
                    {selectedGoal}
                  </div>
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

            <div className="relative px-28">
              <div
                ref={dropdownContainerRef}
                className="relative z-30 mx-4 mt-6 flex flex-wrap gap-4"
              >
                <DropdownBadge
                  label="Continent"
                  options={continentOptions}
                  selectedValue={selectedContinent}
                  isOpen={openDropdown === "continent"}
                  onToggle={() => handleDropdownToggle("continent")}
                  onSelect={handleContinentSelect}
                />

                <DropdownBadge
                  label={selectedGoal}
                  options={goalOptions}
                  selectedValue={selectedGoalOption}
                  isOpen={openDropdown === "goalOption"}
                  onToggle={() => handleDropdownToggle("goalOption")}
                  onSelect={handleGoalOptionSelect}
                />
              </div>

              <div className="relative mt-8">
                <div className="relative z-10">
                  <p className="text-3xl font-medium leading-snug text-black/85 lg:text-lg">
                    {typedHeading}
                  </p>

                  <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {filteredDestinations.map((destination) => (
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
                        <img
                          src={destination.image}
                          alt={`${destination.city}, ${destination.country}`}
                          className="h-56 w-full rounded-2xl object-cover"
                        />
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

                  {!filteredDestinations.length && (
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
