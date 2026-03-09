import React, { useEffect, useState } from "react";
import { HiOutlineArrowLeft, HiOutlineSearch } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";

const filters = [
  "Budget",
  "Internet",
  "Visa Duration",
  "Time Zone",
  "Continent",
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

const AiSearchResults = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [typedHeading, setTypedHeading] = useState("");

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

  const selectedFilter = state?.selectedFilter || "Budget";
  const selectedOption = state?.selectedOption || "Under $100";

  const orderedFilters =
    state?.orderedFilters && state.orderedFilters.length
      ? state.orderedFilters
      : (() => {
          const selectedIndex = filters.indexOf(selectedFilter);

          if (selectedIndex <= 0) {
            return filters;
          }

          return [
            ...filters.slice(selectedIndex),
            ...filters.slice(0, selectedIndex),
          ];
        })();

  const headingText =
    "As per your inputs, please find below the best destinations curated for you based on " +
    `${selectedFilter.toLowerCase()} preference`;

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
  }, [headingText]);

  return (
    <div className="min-h-full bg-white">
      <main className="py-8">
        <div className="min-w-[75%] max-w-[80rem] lg:max-w-[80rem] mx-0 px-6 sm:px-6 lg:mx-auto lg:px-0">
          <div className=" rounded-[10px] bg-white py-6 px-4">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => navigate("/search")}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-500 text-sky-500"
                aria-label="Go back"
              >
                <HiOutlineArrowLeft size={18} />
              </button>

              <div className="flex flex-1 items-center rounded-full border border-black/15 bg-white px-4 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.03)] ml-16 mr-32">
                <div className="rounded-full border border-black/30 px-4 py-2 text-sm font-medium text-black/85">
                  {selectedOption}
                </div>
                <div className="ml-auto">
                  <HiOutlineSearch size={34} className="text-black/90" />
                </div>
              </div>
            </div>

            <div className="px-28">
              <div className="mt-6 flex flex-wrap gap-6">
                {orderedFilters.map((filter) => {
                  const isActive = filter === selectedFilter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      className={`rounded-full border px-6 py-2 text-xl font-medium transition-colors lg:text-lg ${
                        isActive
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-black/80 bg-white text-black/90"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              <p className="mt-8 text-3xl font-medium leading-snug text-black/85 lg:text-lg">
                {typedHeading}
              </p>

              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 ">
                {destinationCards.map((destination) => (
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
                        {destination.suggestions} Suggestions
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiSearchResults;
