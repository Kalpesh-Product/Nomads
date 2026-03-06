import React, { useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";

const filters = [
  "Budget",
  "Internet",
  "Visa Duration",
  "Time Zone",
  "Continent",
];

const filterOptions = {
  Budget: ["Under $100", "$100 - $250", "$500 - $1,000", "$1,000+"],
  Internet: ["Under 25 Mbps", "25 - 50 Mbps", "50 - 100 Mbps", "100+ Mbps"],
  "Visa Duration": [
    "Up to 30 days",
    "31 - 90 days",
    "3 - 6 months",
    "6+ months",
  ],
  "Time Zone": ["Americas", "Europe/Africa", "Asia", "Oceania"],
  Continent: [
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Africa",
    "Oceania",
  ],
};

const AiSearch = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [orderedFilters, setOrderedFilters] = useState(filters);

  const handleFilterClick = (selectedFilter) => {
    setActiveFilter(selectedFilter);

    setOrderedFilters((currentFilters) => {
      const selectedIndex = currentFilters.indexOf(selectedFilter);

      if (selectedIndex <= 0) {
        return currentFilters;
      }

      return [
        ...currentFilters.slice(selectedIndex),
        ...currentFilters.slice(0, selectedIndex),
      ];
    });
  };
  return (
    <div className="min-h-full bg-white">
      <main className="px-6 py-12 lg:px-14">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-center text-2xl font-medium text-black/90 ">
            Please share the below details to find the best destinations for you
          </h1>

          <div className="mx-auto mt-16 flex max-w-4xl items-center rounded-full border border-black/15 bg-white px-5 py-1 shadow-[0_2px_6px_rgba(0,0,0,0.03)]">
            <input
              type="text"
              aria-label="Search destinations"
              className="w-full border-none bg-transparent text-xl text-black/80 outline-none placeholder:text-black/30"
            />
            <button
              type="button"
              aria-label="Search"
              className="ml-4 rounded-full  p-2 text-black/90"
            >
              <HiOutlineSearch size={36} />
            </button>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
            {orderedFilters.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => handleFilterClick(filter)}
                  className={`rounded-full border px-8 py-3 text-lg font-medium transition-colors ${
                    isActive
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-black text-black/90 hover:border-sky-500 hover:bg-sky-500 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {activeFilter && (
            <div className="mx-auto mt-8 w-full max-w-4xl">
              <ul className="w-full max-w-[220px] space-y-2">
                {filterOptions[activeFilter].map((option) => (
                  <li
                    key={option}
                    className="rounded-md px-3 py-2 text-base text-black/90"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AiSearch;
