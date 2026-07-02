import React, { useCallback, useEffect, useRef, useState } from "react";
import TestimonialCard from "./TestimonialCard";

const getPerView = () => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
};

const TestimonialCarousel = ({ testimonials }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [perView, setPerView] = useState(getPerView);
  const [isPaused, setIsPaused] = useState(false);
  const [transition, setTransition] = useState(true);
  const total = testimonials.length;
  const isCarousel = total > perView;

  // Duplicate first items at the end for seamless infinite loop
  const extended = [...testimonials, ...testimonials.slice(0, perView)];

  useEffect(() => {
    const handleResize = () => setPerView(getPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isCarousel) return;
    setSlideIndex(0);
  }, [perView, isCarousel]);

  const slide = useCallback(() => {
    setSlideIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!isCarousel || isPaused) return;
    const timer = setInterval(slide, 3000);
    return () => clearInterval(timer);
  }, [isCarousel, isPaused, slide]);

  // When we reach the duplicated section, jump back to 0 instantly
  useEffect(() => {
    if (slideIndex >= total) {
      const jump = setTimeout(() => {
        setTransition(false);
        setSlideIndex(0);
      }, 500);
      return () => clearTimeout(jump);
    }
  }, [slideIndex, total]);

  // Re-enable transition after jump
  useEffect(() => {
    if (!transition) {
      const restore = requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransition(true));
      });
      return () => cancelAnimationFrame(restore);
    }
  }, [transition]);

  if (!total) return null;

  if (!isCarousel) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.key} className="h-full">
            <TestimonialCard item={t} />
          </div>
        ))}
      </div>
    );
  }

  const slideWidth = 100 / perView;
  const dotIndex = slideIndex % total;

  const handleDotClick = (i) => {
    setTransition(true);
    setSlideIndex(i);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(-${slideIndex * slideWidth}%)`,
            transition: transition ? "transform 500ms ease-in-out" : "none",
          }}
        >
          {extended.map((item, idx) => (
            <div
              key={`${item.key}-${idx}`}
              className="shrink-0 px-3"
              style={{ width: `${slideWidth}%` }}
            >
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleDotClick(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === dotIndex ? "bg-slate-700" : "bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
