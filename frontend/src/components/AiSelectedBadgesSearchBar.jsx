import React from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineSearch,
  HiOutlineX,
} from "react-icons/hi";

const badgeClassName =
  "inline-flex min-h-[40px] min-w-[5rem] items-center rounded-full border border-black/30 px-4 py-2 text-xs font-medium text-black/85";

const AiSelectedBadgesSearchBar = ({
  badges = [],
  stateLabel = "",
  onBack,
  onClear,
  heading = null,
  className = "",
}) => {
  const visibleBadges = badges.filter(Boolean);

  return (
    <div className={`hidden lg:block ${className}`}>
      <div className="flex min-w-[11rem] items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-500 text-sky-500"
          aria-label="Go back to search results"
        >
          <HiOutlineArrowLeft size={18} />
        </button>
        {/* {stateLabel && (
          <span className="text-lg font-medium text-primary-blue">
            {stateLabel}
          </span>
        )} */}
      </div>
      {heading && (
        <div className="mx-auto mt-4 w-full max-w-[50rem] lg:max-w-[61rem] xl:max-w-[61rem]">
          {heading}
        </div>
      )}

      <div
        className={`mx-auto flex min-h-[58px] w-full max-w-[50rem] items-center rounded-full border border-black/15 bg-white px-4 py-2 shadow-[0_2px_6px_rgba(0,0,0,0.03)] lg:max-w-[61rem] xl:max-w-[61rem] ${heading ? "mt-2" : "mt-4"}`}
      >
        <div className="flex flex-1 flex-wrap items-center gap-2 overflow-hidden">
          {visibleBadges.map((badgeLabel, index) => (
            <div key={`${badgeLabel}-${index}`} className={badgeClassName}>
              <span className="truncate">{badgeLabel}</span>
            </div>
          ))}
          {/* {stateLabel && <span className={badgeClassName}>{stateLabel}</span>} */}
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-black/70 transition-colors hover:bg-black/5 hover:text-black"
            aria-label="Clear search and go back"
          >
            <HiOutlineX size={24} />
          </button>
          <HiOutlineSearch size={34} className="text-black/90" />
        </div>
      </div>
    </div>
  );
};

export default AiSelectedBadgesSearchBar;
