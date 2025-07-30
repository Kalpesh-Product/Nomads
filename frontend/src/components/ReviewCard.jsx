// components/ReviewCard.jsx
import React from "react";
import { AiFillStar } from "react-icons/ai";

const ReviewCard = ({ review }) => {
  const { name, avatar, duration, stars, date, message } = review;

  return (
    <div className="flex flex-col gap-2 max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">{duration}</p>
        </div>
      </div>

      {/* Stars and Date */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        {Array(stars)
          .fill()
          .map((_, i) => (
            <AiFillStar key={i} className="text-black text-xs" />
          ))}
        <span>· {date}</span>
      </div>

      {/* Review */}
      <p className="text-sm text-gray-700 line-clamp-3">{message}</p>

      <button className="text-sm font-medium underline">Show more</button>
    </div>
  );
};

export default ReviewCard;
