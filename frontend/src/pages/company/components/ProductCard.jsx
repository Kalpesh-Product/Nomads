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
  const description =
    product?.homeCardSubText ||
    product?.subText ||
    product?.description ||
    "";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(event);
        }
      }}
      className="flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl shadow-md"
    >
      {/* Image */}
      <div className="w-full overflow-hidden bg-slate-200">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={heading}
            className="h-[200px] w-full object-cover md:h-[230px]"
          />
        ) : (
          <div className="h-[200px] w-full md:h-[230px]" />
        )}
      </div>
      
      {/* Dark card: name + description + explore button */}
      <div className="flex flex-1 flex-col items-center gap-3 bg-[#1a1a1a] px-5 py-5 text-center">
        <h3 className="text-[15px] font-semibold uppercase tracking-wide text-white font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[17px]">
          {heading}
        </h3>
        {description ? (
          <p className="text-[12px] leading-relaxed text-white/75 font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[13px]">
            {description}
          </p>
        ) : null}
        {showButton ? (
          <div className="mt-auto pt-1">
            <button
              type="button"
              className="rounded-full border border-white/60 px-6 py-2 text-[11px] font-semibold uppercase tracking-widest text-white transition hover:bg-white hover:text-[#1a1a1a] font-['Poppins',ui-sans-serif,system-ui,sans-serif]"
            >
              {buttonText}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default ProductCard;
