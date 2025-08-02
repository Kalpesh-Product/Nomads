import React from "react";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import logo from "../assets/WONO_LOGO_white _TP.png";
import img1 from "../assets/download.png";
import img2 from "../assets/download 2.png";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-2">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-2  w-full px-32 py-1">
        <img
          src={logo}
          alt="WONO Logo"
          className="w-36 cursor-pointer"
          onClick={() => {
            navigate("/nomad");
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        />
        <h1 className="text-[2.2rem]  font-cursive">Worlds Nomad Community</h1>
        <div className="w-36"></div>
      </div>

      {/* Main content grid */}
      <div className="flex flex-col lg:flex-row gap-8 w-full justify-between mt-2 font-heading px-4">
        {/* Left Column: For Nomads */}
        <div className="flex flex-col items-center gap-4 w-full">
          <img
            src={img1}
            alt="Nomad Woman"
            className="w-full  h-96 object-cover rounded-md object-top"
          />
          <button
            onClick={() => navigate("/nomad")}
            className="bg-sky-400 text-black font-bold px-20 pt-1 pb-2 rounded-full hover:bg-cyan-300 transition-all duration-200 text-subtitle mt-2">
            For Nomads
          </button>
          <div className="text-center text-sm w-full">
            <p className="text-subtitle px-6 lg:px-28">
              A Global one stop platform for Nomads to manage <br /> their Nomad
              Lifestyle across Aspiring Destinations!
            </p>
            <ul className="text-left mt-4 list-disc list-inside px-6 lg:px-28 text-subtitle">
              <li>Co-Working</li>
              <li>Co-Living</li>
              <li>Apartments</li>
              <li>Hostels</li>
              <li>Smart Café’s and more</li>
            </ul>
          </div>
        </div>

        {/* Divider only on large screens */}
        <div className="hidden lg:flex border-l-2 border-dashed border-gray-400 mx-4"></div>

        {/* Right Column: For Businesses */}
        <div className="flex flex-col items-center gap-4 w-full">
          <img
            src={img2}
            alt="Nomad Man"
            className="w-full  h-96 object-cover rounded-md object-[0_70%]"
          />
          <button
            onClick={() => (window.location.href = "https://wono.co")}
            className="bg-sky-400 text-black font-bold px-20 pt-1 pb-2 rounded-full hover:bg-cyan-300 transition-all duration-200 text-subtitle mt-2">
            For Businesses
          </button>
          <div className="text-center w-full text-sm">
            <p className="text-subtitle px-6 lg:px-28">
              A User-Friendly No-Code SaaS platform built to <br /> empower
              nomad-friendly businesses worldwide.
            </p>
            <ul className="text-left mt-4 list-disc list-inside px-6 lg:px-28 text-subtitle">
              <li>Website Builder</li>
              <li>Meeting Room Booking System</li>
              <li>Tickets Management System</li>
              <li>Visitor Management System</li>
              <li>Task Management System</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-4 text-center text-content text-white flex flex-col items-center gap-2 border-t border-gray-600  w-full pt-2">
        <p className="pt-4 text-[1rem] font-heading">
          © Copyright 2025–26 WONOCO PRIVATE LIMITED – SINGAPORE. All Rights
          Reserved.
        </p>
        <div className="flex gap-4 text-white text-lg pb-4">
          <a
            className="p-2 text-[1.5rem]"
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer">
            <FaTwitter />
          </a>
          <a
            className="p-2 text-[1.5rem]"
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer">
            <FaFacebook />
          </a>
          <a
            className="p-2 text-[1.5rem]"
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer">
            <FaInstagram />
          </a>
          <a
            className="p-2 text-[1.5rem]"
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer">
            <FaLinkedin />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
