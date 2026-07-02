import React from "react";
import { FaStar } from "react-icons/fa";

const OverallRating = ({ testimonials = [] }) => {
  const valid = testimonials.filter((t) => t?.rating > 0);
  if (!valid.length) return null;

  const avg =
    valid.reduce((sum, t) => sum + t.rating, 0) / valid.length;
  const full = Math.round(avg);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-5xl font-bold text-gray-900">
        {avg.toFixed(1)}
      </span>
      <div className="flex gap-0.5 text-yellow-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar key={i} size={20} className={i < full ? "fill-current" : "fill-gray-300"} />
        ))}
      </div>
      <span className="text-sm text-gray-500">
        {valid.length} {valid.length === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
};

export default OverallRating;
