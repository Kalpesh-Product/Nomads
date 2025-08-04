import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import sliderImageOne from "../assets/main-slider-images/slider-image-1.png";
import sliderImageTwo from "../assets/main-slider-images/slider-image-2.png";
import logo from "../assets/WONO_LOGO_white _TP.png";
import img1 from "../assets/download.png";
import img2 from "../assets/download 2.png";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const slides = [
  {
    image: sliderImageOne,
    text: "A one stop platform for Nomads to manage their Nomad Lifestyle and discover the most curated co-working, hostels, working cafes, meeting spaces across Aspiring Destinations!",
  },
  {
    image: sliderImageTwo,
    text: "A No-Code SaaS platform built to empower nomad-friendly hosting businesses worldwide. Includes Website Builder, Meeting Room Booking, Tickets, Visitors and other modules.",
  },
];

const MainPage = () => {
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1,
      spacing: 10,
    },
  });

  useEffect(() => {
    if (!slider) return;

    let index = 0;

    intervalRef.current = setInterval(() => {
      index = (index + 1) % slides.length;
      slider.current?.moveToIdx(index);
    }, 5000); // every 5 seconds

    return () => clearInterval(intervalRef.current);
  }, [slider]);

  return (
    <div className="min-h-screen grid grid-cols-2 relative">
      {/* Left Column */}
      <figure className="flex flex-col w-full h-full items-center justify-center">
        <img src="images/main-page-branding.png" alt="wono" />
      </figure>

      {/* Vertical Centered Dotted Separator */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3/4 border-l-2 border-dotted border-gray-400 z-10" />

      {/* Right Column */}
      <article className="flex flex-col w-full h-full justify-center items-center px-6">
        <div ref={sliderRef} className="keen-slider w-full max-w-xl">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="keen-slider__slide flex flex-col items-center gap-4 text-center px-4"
            >
              <img
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className="w-full h-auto object-contain"
              />
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                {slide.text}
              </p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
};

export default MainPage;
