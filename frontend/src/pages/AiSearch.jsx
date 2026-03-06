import React from "react";
import { HiOutlineSearch } from "react-icons/hi";

const filters = [
  "Budget",
  "Internet",
  "Visa Duration",
  "Time Zone",
  "Continent",
];

const AiSearch = () => {
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
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className="rounded-full border border-black px-8 py-3 text-lg font-medium text-black/90 transition-colors hover:bg-sky-500 hover:text-white hover:border-sky-500 "
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiSearch;
