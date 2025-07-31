import React from "react";
import logo from "../assets/WONO_LOGO_white _TP.png";
import img1 from "../assets/download.jpg";
import img2 from "../assets/download 2.png";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row text-white">
      {/* Left Section */}
      <div className="lg:w-1/2 w-full bg-black flex flex-col items-center justify-center text-center px-6 py-12 gap-10">
        {/* Logo and Title */}
        <div>
          <img
            src={logo}
            onClick={() => {
              navigate("/nomad");
              window.scrollTo({ top: 0, behavior: "instant" });
              changeActiveTab("Home");
            }}
            className="w-80 cursor-pointer mb-4"
            alt="logo"
          />
          <p className="text-xl font-light tracking-wide">
            Worlds Nomad Community
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => navigate("nomad")}
            className="bg-primary-blue text-black font-semibold px-6 py-2 rounded-full hover:bg-cyan-300 transition-all duration-200"
          >
            For Nomads
          </button>
          <button
            onClick={() => (window.location.href = "https://wono.co")}
            className="bg-primary-blue text-black font-semibold px-6 py-2 rounded-full hover:bg-cyan-300 transition-all duration-200">
            For Businesses
          </button>
        </div>

        {/* Divider + Info */}
        <div className="flex flex-col lg:flex-row gap-8 mt-4 text-left text-sm leading-relaxed">
          {/* Left Column */}
          <div className="flex flex-col items-start justify-start max-w-[300px]">
            <p>
              A Global one stop platform for Nomads to manage their Nomad
              Lifestyle across Aspiring Destinations!
            </p>
            <ul className="mt-3 list-disc list-inside">
              <li>Co-Working</li>
              <li>Co-Living</li>
              <li>Apartments</li>
              <li>Hostels</li>
              <li>Smart Café’s and more</li>
            </ul>
          </div>

          {/* Vertical dashed divider (only on lg+) */}
          <div className="hidden lg:block border-l-2 border-dashed border-white h-auto mx-4"></div>

          {/* Right Column */}
          <div className="flex flex-col items-start justify-start max-w-[300px]">
            <p>
              A simple NO CODE SaaS Platform. <br />
              <br />
              SaaS Tech for Nomad supporting businesses across the world.
              (Example: Co-Working, Co-Living, Hostels, Workations, Resorts,
              Cafes, Events etc)
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Placeholder Images */}
      <div className="lg:w-1/2 w-full grid grid-rows-2">
        <div className=" h-[50vh] object-cover">
          <img
            // src="https://plus.unsplash.com/premium_photo-1661627374844-11ca6ddb3633?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            src={img1}
            alt="Nomad Woman"
            className="w-full h-full object-cover"
          />
        </div>
        <div className=" h-[50vh] object-cover">
          <img
            // src="https://images.unsplash.com/photo-1713947503813-da5351679a0c?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            src={img2}
            alt="Nomad Man"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
