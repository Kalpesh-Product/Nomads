// components/ReviewCard.jsx
import React from "react";
import { AiFillStar } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import renderStars from "../utils/renderStarts";

const ReviewCard = ({ review, handleClick }) => {
  const {
    name,
    avatar,
    duration,
    stars,
    date,
    message,
    reviewText,
    rating,
    description,
    starCount,
  } = review;

  return (
    <div className="flex flex-col gap-2 max-w-sm  p-4 rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-white uppercase">
            {name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
        )}
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">{duration}</p>
        </div>
      </div>

      {/* Stars and Date */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        {renderStars(starCount || rating)}
        <span>· {date}</span>
      </div>

      {/* Review */}
      <p className="text-sm text-gray-700 line-clamp-3">
        {message || reviewText || description}
      </p>

      <span
        onClick={handleClick}
        className="text-small font-medium underline cursor-pointer"
      >
        Show more
      </span>
    </div>
  );
};

export default ReviewCard;
