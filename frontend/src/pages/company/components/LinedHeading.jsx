import React from "react";

const LinedHeading = ({ title, className = "" }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <div className="flex-1 border-t border-[#111827]" />
    <h2 className="shrink-0 text-center text-sm font-semibold uppercase tracking-[0.15em] text-[#111827] font-['Poppins',ui-sans-serif,system-ui,sans-serif] sm:text-base md:text-xl lg:text-[26px]">
      {title}
    </h2>
    <div className="flex-1 border-t border-[#111827]" />
  </div>
);

export default LinedHeading;
