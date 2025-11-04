import {
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGlobe,
  FaRupeeSign,
  FaFacebookF,
} from "react-icons/fa";
import sliderImageOne from "../assets/main-slider-images/slider-image-1.png";
import sliderImageTwo from "../assets/main-slider-images/slider-image-2.png";
import logo from "../assets/wono-logo-white.png";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import PrimaryButton from "../components/PrimaryButton";
import { FaXTwitter } from "react-icons/fa6";

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

const WebsiteUnderMaintenance = () => {
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const goToNomads = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://nomad.localhost:5173";
    } else {
      window.location.href = "https://nomad.wono.co";
    }
  };

  const goToHosts = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://hosts.localhost:5173";
    } else {
      window.location.href = "https://hosts.wono.co";
    }
  };

  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1,
      spacing: 10,
    },
  });

  useEffect(() => {
    if (!slider || !slider.current) return;

    intervalRef.current = setInterval(() => {
      slider.current.next();
    }, 10000);

    return () => clearInterval(intervalRef.current);
  }, [slider]);

  return (
    <main className="min-h-[100lvh] flex flex-col justify-center items-center">
      <div className=" min-h-[90lvh]">
        {/* Left Column */}
        <figure className="flex flex-col w-full h-full justify-center items-center p-4 lg:p-6 gap-10">
          <img
            src="images/main-page-1.png"
            alt="wono"
            className="object-cover max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-md lg:w-full"
          />
          <div>
            <div>
              <h2 className="text-title font-bold text-center py-10">
                Website is currently under maintenance
              </h2>
            </div>
            <div>
              <p className="text-subtitle text-center">We'll be back shortly</p>
            </div>
          </div>
        </figure>

        {/* Vertical Centered Dotted Separator */}
        {/* <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[90%] border-l-2 border-dashed border-gray-600 z-10" /> */}

        {/* Right Column */}

        {/* <div>
          <h2>maint</h2>
        </div> */}
      </div>
      <div className="flex justify-evenly items-center  w-full flex-col sm:flex-col xs:flex-col lg:flex-row md:flex-row pt-2">
        <div className="w-32"></div>
        <div className="w-full  ">
          <p className="text-center pb-2 text-tiny sm:text-tiny xs:text-tiny md:text-content lg:text-content">
            <span className="whitespace-nowrap">
              &copy; Copyright {new Date().getFullYear()} -{" "}
              {(new Date().getFullYear() + 1).toString().slice(-2)}
            </span>
            <span className="block sm:inline">
              {" "}
              WONOCO PRIVATE LIMITED – SINGAPORE. All Rights Reserved.
            </span>
          </p>
        </div>
        <div className="flex items-right justify-end gap-4  pb-2 px-6 w-32 ">
          <FaFacebookF className="text-[12px]" />

          <FaXTwitter className="text-[12px]" />
          <FaInstagram className="text-[12px]" />
        </div>
      </div>
    </main>
  );
};

export default WebsiteUnderMaintenance;
