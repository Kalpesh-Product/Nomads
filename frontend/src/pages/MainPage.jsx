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
import PrimaryButton from "../components/PrimaryButton";

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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative">
      {/* Left Column */}
      <figure className="flex flex-col w-full h-full justify-center items-center p-4 lg:p-6">
        <img
          src="images/main-page-branding.png"
          alt="wono"
          className="object-cover max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-3xl lg:w-full"
        />
      </figure>

      {/* Vertical Centered Dotted Separator */}
      <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3/4 border-l-2 border-dashed border-gray-600 z-10" />

      {/* Right Column */}
      <article className="flex flex-col gap-4 w-full h-full justify-center items-center p-8">
        <div ref={sliderRef} className="keen-slider w-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="keen-slider__slide flex flex-col items-center gap-4 text-center"
            >
              <img
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className="w-full h-auto object-contain"
              />
              <p className="text-gray-700 text-base text-pretty leading-relaxed md:line-clamp-3 md:max-h-[6em] overflow-hidden">
                {slide.text}
              </p>
            </div>
          ))}
        </div>
        <div className="flex gap-8 w-full justify-center items-center">
          <PrimaryButton
            title="For Nomads"
            padding={0}
            externalStyles="bg-[#FF5757] text-sm flex lg:text-xl text-white font-bold capatilize hover:bg-[#E14C4C] w-[16rem] text-lg px-6 py-6"
          />
          <PrimaryButton
            title="For Hosts"
            padding={0}
            externalStyles="bg-[#FF5757] text-sm flex lg:text-xl text-white font-bold capatilize hover:bg-[#E14C4C] w-[16rem] text-lg px-6 py-6"
          />
        </div>
      </article>
    </div>
  );
};

export default MainPage;
