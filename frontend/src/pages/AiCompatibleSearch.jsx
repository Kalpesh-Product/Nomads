import React, { useEffect, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const compatibleBadges = [
  "Adventure",
  "Gyming",
  "Founders",
  "Solopreners",
  "Freelancers",
  "Family Nomads",
  "Party Focused",
  "Co-Working Density",
  "Internet",
  "Creative Individuals",
  "Infulencers",
  "Yoga",
  "Pubs",
  "Events",
  "Startups",
  "Nightlife",
  "Nature",
  "Accessibility",
  "Dating Scene",
  "Work-Life Balance",
];

const AiCompatibleSearch = () => {
  const navigate = useNavigate();
  const [selectedBadges, setSelectedBadges] = useState([]);

  const [typedHeading, setTypedHeading] = useState("");

  const headingText =
    "Please share the below details to find the best destinations for you";

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

  const handleBadgeClick = (selectedBadge) => {
    setSelectedBadges((currentBadges) => {
      if (currentBadges.includes(selectedBadge)) {
        return currentBadges.filter((badge) => badge !== selectedBadge);
      }

      return [...currentBadges, selectedBadge];
    });
  };

  const handleSearch = () => {
    if (!selectedBadges.length) return;

    navigate("/compatible/results", {
      state: {
        selectedBadges,
      },
    });
  };

  const selectedBadgesText = selectedBadges.join(", ");

  return (
    <div className="min-h-full bg-white">
      <main className="px-6 py-12 lg:px-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex justify-between">
            <div></div>
            <h1 className="text-left text-[1.43rem] font-medium text-black/90 w-full px-28">
              {typedHeading}
            </h1>
            <div></div>
          </div>

          <div className=" mt-16 ml-28 flex max-w-3xl items-center rounded-full border border-black/15  px-4 py-0 shadow-[0_2px_6px_rgba(0,0,0,0.03)] ">
            <input
              type="text"
              aria-label="Search destinations"
              readOnly
              value={selectedBadgesText}
              placeholder="Select badges below"
              className="w-full border-none bg-transparent text-xl text-black/80 outline-none placeholder:text-black/30 "
            />
            <button
              type="button"
              onClick={handleSearch}
              aria-label="Search"
              className="ml-4 rounded-full  p-2 text-black/90"
            >
              <HiOutlineSearch size={36} />
            </button>
          </div>

          <div className="mt-6 ml-28 flex flex-wrap items-center justify-start gap-8">
            {compatibleBadges.map((badge) => {
              const isActive = selectedBadges.includes(badge);

              return (
                <button
                  key={badge}
                  type="button"
                  onClick={() => handleBadgeClick(badge)}
                  className={`rounded-full border px-6 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-black text-black/90 hover:border-sky-500"
                  }`}
                >
                  {badge}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiCompatibleSearch;
