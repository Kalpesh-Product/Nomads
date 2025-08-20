import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Drawer } from "@mui/material";
import { IoCloseSharp } from "react-icons/io5";
import PrimaryButton from "../../../components/PrimaryButton";
import logo from "../../../assets/WONO_LOGO_Black_TP.png";
import { useLocation } from "react-router-dom";

const TempHeader = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view"); // could be 'map', 'list', or null

  const currentPath = location.pathname;

  const isNomadOrListings =
    /^\/nomad(\/listings\/[^/]+)?$/.test(currentPath) ||
    currentPath === "/nomad/login" ||
    currentPath === "/nomad/signup";

  const hideMapListLinks = isNomadOrListings;
  const isNomadHome = isNomadOrListings;

  const pathRegex = /^\/nomad\/[^/]+\/[^/]+$/; // e.g., /nomad/india/goa
  const isNomadLocation = /^\/nomad\/[^/]+\/[^/]+$/.test(location.pathname); // Matches /nomad/:country/:state

  const isNomadListingsPage = location.pathname === "/nomad/listings";

  // NEW: listings detail page like /nomad/listings/BIZ%20Nest
  const isNomadListingsDetail = /^\/nomad\/listings\/[^/]+$/.test(currentPath);

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  // Only the two links you want, and absolute paths so they work from nested routes
  const headerLinks = [
    { id: 1, text: "Home", to: "hero" },
    { id: 2, text: "About", to: "about" },
    { id: 3, text: "Products", to: "products" },
    { id: 4, text: "Gallery", to: "gallery" },
    { id: 5, text: "Testimonials", to: "testimonials" },
    { id: 6, text: "Contact", to: "contact" },
  ];

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  return (
    <div className="flex px-4 py-3 justify-between items-center md:py-3 md:px-[7.5rem] lg:px-[7.5rem] sm:px-6 xs:px-6 lg:py-[0.625rem] shadow-md bg-white/80 backdrop-blur-md ">
      <div className="w-full">
        <div
          onClick={() => navigate("/")}
          className="w-24 lg:w-36 overflow-x-hidden rounded-lg flex justify-between items-center cursor-pointer"
        >
          <img
            src={logo}
            alt={"logo"}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* NEW: show the two links on listings detail pages too, while keeping /nomad hidden */}
      <div className="w-full">
        <ul className="hidden xl:flex sm:hidden gap-8 pl-20 justify-center flex-1">
          {headerLinks.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleScroll(item.to)}
                className="group relative text-md text-black"
              >
                <span className="relative z-10 group-hover:font-bold">
                  {item.text}
                </span>
                <span className="absolute left-0 bottom-0 top-6 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="hidden lg:block w-full"></div>

      <div className="h-full px-2  lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className=" rounded-lg text-subtitle text-black"
        >
          ☰
        </button>
      </div>

      <Drawer
        sx={{
          "& .MuiDrawer-paper": {
            width: {
              xs: "85%",
              sm: "400px",
            },
          },
        }}
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col h-full justify-between">
          <ul className="flex flex-col gap-4 p-4 ">
            <div className="flex w-full justify-end text-right">
              <span
                className="text-title cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <IoCloseSharp />
              </span>
            </div>

            {headerLinks.map((item) => (
              <li key={item.id} className="items-center text-center">
                <div
                  onClick={() => handleScroll(item.to)}
                  className="py-4 cursor-pointer"
                >
                  <p className="text-secondary-dark text-lg">{item.text}</p>
                </div>
                <div className="h-[0.2px] bg-gray-300"></div>
              </li>
            ))}
          </ul>

          {/* Footer */}

          <div className="w-full text-center flex flex-col gap-4 items-center py-4">
            <div className="flex w-full flex-col gap-2 text-small md:text-small">
              <hr />
              <span>
                &copy; Copyright {new Date().getFullYear()} -{" "}
                {(new Date().getFullYear() + 1).toString().slice(-2)}
              </span>
              <span></span>
              <span>WoNo. All rights reserved</span>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default TempHeader;
