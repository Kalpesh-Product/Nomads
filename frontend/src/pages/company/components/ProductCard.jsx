import React from "react";
import TempButton from "./TempButton";

const ProductCard = ({ product }) => {
    console.log("inisde product : ", product?.images?.[0]?.url)
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="text-center">
        <h1 className="text-subtitle">{product.type || "Co-Working"}</h1>
      </div>
      <div className="relative h-[16rem] overflow-hidden rounded-xl ">
        <img
          src={ product?.images?.[0]?.url}
          alt="img"
          className="h-full w-full rounded-xl overflow-hidden object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-end items-center p-8 overflow-hidden">
          <TempButton buttonText="View Details" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
