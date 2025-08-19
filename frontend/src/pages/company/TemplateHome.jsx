// src/pages/TemplateHome.jsx
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

// helper to get subdomain
function getTenantFromHost() {
  const hostname = window.location.hostname; // e.g. "biznest.localhost"
  const parts = hostname.split(".");
  return parts[0] === "www" ? null : parts[0]; // "biznest"
}

const TemplateHome = () => {
  const intervalRef = useRef(null);
  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    mode: "snap",
    slides: { perView: 1 },
  });
  useEffect(() => {
    if (!slider) return;

    intervalRef.current = setInterval(() => {
      slider.current?.next();
    }, 5000); // auto slide every 5 sec

    return () => clearInterval(intervalRef.current);
  }, [slider]);

  const slides = [
    {
      id: 1,
      img: "https://picsum.photos/id/1015/1600/900",
      title: "Welcome to Our Platform",
      subtitle: "We build experiences that matter.",
    },
    {
      id: 2,
      img: "https://picsum.photos/id/1016/1600/900",
      title: "Innovation at Work",
      subtitle: "Empowering your business through technology.",
    },
    {
      id: 3,
      img: "https://picsum.photos/id/1018/1600/900",
      title: "Your Vision, Our Mission",
      subtitle: "Together we achieve more.",
    },
  ];

  const tenant = getTenantFromHost();

  const { data, isPending, error } = useQuery({
    queryKey: ["company", tenant],
    queryFn: async () => {
      const res = await axios.get(
        `https://wonotestbe.vercel.app/api/editor/get-template/${tenant}`
      );
      // axios auto-parses JSON
      return res.data;
    },
    enabled: !!tenant, // only run if we actually have a subdomain
  });

  if (!tenant) {
    return <div>No tenant specified</div>;
  }

  if (isPending) {
    return <div>Loading site...</div>;
  }

  if (error) {
    return <div>Error loading site: {error.message}</div>;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Slider */}
      <div ref={sliderRef} className="keen-slider w-full h-full">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="keen-slider__slide w-full h-full relative"
          >
            <img
              src={slide.img}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay Layer */}
            <div className="absolute inset-0 bg-black/40 flex flex-col gap-6 justify-end items-center text-center text-white p-6 py-8">
              <h1 className="text-4xl md:text-6xl font-bold  drop-shadow-lg">
                {data.title || "Unknown"}
              </h1>
              <p className="text-lg md:text-2xl drop-shadow-md">
                {data.subTitle}
              </p>
              <button>
                {data.CTAButtonText || "Click here"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next Buttons */}
      <button
        onClick={() => slider.current?.prev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition"
      >
        <FaChevronLeft size={20} />
      </button>
      <button
        onClick={() => slider.current?.next()}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition"
      >
        <FaChevronRight size={20} />
      </button>
    </div>
  );
};

export default TemplateHome;
