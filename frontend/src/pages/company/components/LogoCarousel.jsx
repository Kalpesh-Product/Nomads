import React, { useEffect, useState } from "react";

const LinedHeading = ({ title }) => (
  <div className="flex items-center gap-4">
    <div className="flex-1 border-t border-[#111827]" />
    <h2 className="shrink-0 text-center text-sm font-semibold uppercase tracking-[0.15em] text-[#111827] font-['Poppins',ui-sans-serif,system-ui,sans-serif] sm:text-base md:text-xl lg:text-[26px]">
      {title}
    </h2>
    <div className="flex-1 border-t border-[#111827]" />
  </div>
);

const getVisibleCount = () => {
  if (typeof window === "undefined") return 4;
  if (window.innerWidth < 768) return 2;
  return 4;
};

const LogoCarousel = ({ logos, title }) => {
  const [offset, setOffset] = useState(0);
  const [visible, setVisible] = useState(getVisibleCount);
  const total = logos.length;

  useEffect(() => {
    const handleResize = () => setVisible(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (total <= visible) return;
    setOffset(0);
  }, [visible, total]);

  useEffect(() => {
    if (total <= visible) return;
    const timer = window.setInterval(() => {
      setOffset((prev) => (prev + 1) % total);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [total, visible]);

  if (!total) return null;

  const displayed = Array.from({ length: visible }, (_, i) =>
    logos[(offset + i) % total]
  );

  return (
    <section className="bg-white px-4 py-10 md:px-6 md:py-12">
      <div className="mx-auto w-full max-w-7xl">
        {title ? (
          <div className="mb-8">
            <LinedHeading title={title} />
          </div>
        ) : null}
        <div className="overflow-hidden">
          <div className="flex items-center justify-center gap-6 transition-all duration-700 md:gap-16">
            {displayed.map((src, idx) => (
              <div
                key={`logo-${offset}-${idx}`}
                className="flex h-[60px] w-[140px] shrink-0 items-center justify-center md:h-[80px] md:w-[220px]"
              >
                <img
                  src={src}
                  alt={`Partner logo ${idx + 1}`}
                  className="max-h-full max-w-full object-contain transition duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
