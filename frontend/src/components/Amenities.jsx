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
      <p className="text-center w-full text-[0.89rem] font-semibold">
        {title || ""}
      </p>
    </div>
  );
};

export default Amenities;
