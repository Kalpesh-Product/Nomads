// src/components/TestimonialCard.jsx
import React from "react";
import { FaStar } from "react-icons/fa";

const TestimonialCard = ({ item }) => {
  return (
    <div className=" w-full h-[25rem] border-2  rounded-lg p-6 text-center shadow-sm bg-white">
      {/* Profile Image */}
      <div className="w-20 h-20 mx-auto mb-4">
        <img
          src={item?.image?.url}
          alt={item.name}
          className="w-full h-full object-cover rounded-full border-2 border-purple-400"
        />
      </div>

      {/* Name + Role */}
      <h3 className="text-lg font-semibold text-gray-800">{item?.name || "name"}</h3>
      <p className="text-sm text-gray-500 mb-4">
        {item?.jobPosition || "position"}
      </p>

      {/* Testimonial Text */}
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">"{item?.testimony || "testimony"}"</p>

      {/* Rating */}
      <div className="flex justify-center gap-1 text-yellow-400">
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
