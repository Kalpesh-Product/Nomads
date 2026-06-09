// src/components/TestimonialCard.jsx
import React from "react";
import { FaStar } from "react-icons/fa";
import { getMediaSrc } from "../utils/templateRouteUtils";

const TestimonialCard = ({ item }) => {
  const initials = String(item?.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "RT";
  const imageSrc = getMediaSrc(item?.image);

  return (
    <div className="w-full rounded-2xl bg-white p-6 text-left shadow-sm">
      {/* Profile Image */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item?.name || "reviewer"}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            {item?.name || "name"}
          </h3>
          <p className="text-xs text-gray-500">
            {item?.jobPosition || item?.role || "position"}
          </p>
        </div>
      </div>

      {/* Testimonial Text */}
      <p className="mb-4 text-sm leading-relaxed text-gray-600">
        "{item?.testimony || item?.text || "testimony"}"
      </p>

      {/* Rating */}
      <div className="flex gap-1 text-black">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar
            key={i}
            className={i < item?.rating ? "fill-current" : "fill-gray-300"}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCard;
