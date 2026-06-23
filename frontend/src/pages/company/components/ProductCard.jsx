import React from "react";
import { getMediaSrc } from "../utils/templateRouteUtils";

const ProductCard = ({ product, onClick, buttonText = "VIEW DETAILS", showButton = true }) => {
  const imageSrc =
    getMediaSrc(product?.cardImage) ||
    getMediaSrc(product?.homeCardImage) ||
    getMediaSrc(product?.heroImage) ||
    getMediaSrc(product?.heroImages) ||
    getMediaSrc(product?.images);
  const heading =
    product?.heading ||
    product?.homeCardHeading ||
    product?.name ||
    product?.type ||
    "Product";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(event);
        }
      }}
      className="flex h-full w-full cursor-pointer flex-col gap-3 text-left"
    >
      <div className="text-center">
        <h1 className="text-[20px] font-medium text-[#5b5b5b] md:text-[20px]">
          {heading}
        </h1>
      </div>
      <div className="relative h-[220px] overflow-hidden rounded-[10px] shadow-md md:h-[13.5rem]">
        <img
          src={imageSrc}
          alt="img"
          className="h-full w-full rounded-[10px] overflow-hidden object-cover"
        />
        {showButton ? (
          <div className="absolute inset-0 flex items-end justify-center bg-black/18 p-4">
            <div className="rounded-full border border-white/85 bg-black/55 px-5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-md">
              {buttonText}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductCard;
