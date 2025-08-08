import React from "react";

const Amenities = ({ image, title }) => {
  return (
    <div className="flex flex-row gap-1 w-full lg:w-40 items-center">
      <div className="h-10 w-10 overflow-hidden">
        <img
          src={image || ""}
          className="h-full w-full object-contain"
          alt={image || ""}
        />
      </div>
      <p className="text-center text-secondary-dark w-full text-[0.89rem] uppercase">
        {title || ""}
      </p>
    </div>
  );
};

export default Amenities;
