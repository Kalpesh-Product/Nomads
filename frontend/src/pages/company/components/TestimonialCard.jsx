import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

const MAX_CHARS = 200;

const TestimonialCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const text = item?.testimony || item?.text || "";
  const isLong = text.length > MAX_CHARS;
  const rating = item?.rating || 0;

  return (
    <div className="flex h-full w-full min-w-0 flex-col text-left">
      <h3 className="text-base font-semibold text-gray-800">
        {item?.name || "name"}
      </h3>

      <div className="mt-1 flex gap-1 text-black">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar
            key={i}
            size={14}
            className={i < rating ? "fill-current" : "fill-gray-300"}
          />
        ))}
      </div>

      <div className="mt-3 min-w-0 flex-1">
        <p className="break-words whitespace-normal text-sm leading-relaxed text-gray-600">
          "{text || "testimony"}"
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
};

export default TestimonialCard;
