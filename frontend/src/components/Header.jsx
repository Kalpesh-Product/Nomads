import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import PrimaryButton from "./PrimaryButton";
import logo from "../assets/WONO_LOGO_Black_TP.png";
import { useSelector } from "react-redux";
import { Drawer } from "@mui/material";
import { IoCloseSharp } from "react-icons/io5";

const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view");
  const showToggle = location.pathname.includes("verticals");

  const formData = useSelector((state) => state.location.formValues);
  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  const goToHosts = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://hosts.localhost:5173";
    } else {
      window.location.href = "https://hosts.wono.co";
    }
  };
    const goToHostssMain = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://localhost:5173";
    } else {
      window.location.href = "https://wono.co";
    }
  };

  const headerLinks = [
    { id: 1, text: "Home", to: "/" },
    { id: 2, text: "News", to: "/news" },
    { id: 3, text: "Blog", to: "/blog" },
  ];

  return (
    <div className="flex px-4 py-3 justify-between items-center md:py-3 md:px-[7.5rem] lg:px-[7.5rem] sm:px-6 xs:px-6 lg:py-[0.625rem] shadow-md bg-white/80 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center">
        {/* Logo */}
        <div
          onClick={goToHostssMain}
          className="w-24 h-10 lg:w-48 overflow-x-hidden rounded-lg flex gap-8 justify-start items-start cursor-pointer"
        >
          <img src={logo} alt="logo" className="w-fit h-full object-contain" />
        </div>

        {/* Toggle or placeholder */}
        <div className="min-w-[80px] hidden lg:block">
          {showToggle && (
            <ul>
              {view !== "map" && (
                <li className="flex items-center">
                  <div className="p-4 px-0 whitespace-nowrap">
                    <Link
                      to={`${location.pathname}?country=${formData?.country}&location=${formData?.location}&view=map`}
                      className="group relative text-md text-black"
                    >
                      <span className="relative z-10 group-hover:font-bold mb-2">
                        Map view
                      </span>
                      <span className="absolute left-0 bottom-0 top-6 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </div>
                </li>
              )}

              {view === "map" && (
                <li className="flex items-center">
                  <div className="p-4 px-0 whitespace-nowrap">
                    <Link
                      to={`${location.pathname}?country=${formData?.country}&location=${formData?.location}`}
                      className="group relative text-md text-black"
                    >
                      <span className="relative z-10 group-hover:font-bold mb-2">
                        List view
                      </span>
                      <span className="absolute left-0 bottom-0 top-6 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <div className="w-full">
        <ul className="hidden xl:flex sm:hidden gap-8 justify-end flex-1">
          {headerLinks.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/" // exact match for home
                : location.pathname.startsWith(item.to);

            return (
              <li key={item.id} className="flex items-center">
                <div className="p-4 px-0 whitespace-nowrap">
                  <Link
                    to={item.to}
                    className="group relative text-md text-black"
                  >
                    <span
                      className={`relative z-10 mb-8 uppercase ${
                        isActive
                          ? "text-black"
                          : "group-hover:font-bold"
                      }`}
                    >
                      {item.text}
                    </span>
                    <span
                      className={`absolute left-0 bottom-0 top-6 block h-[2px] bg-blue-500 transition-all duration-300 
                ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                    ></span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex pl-10 gap-10">
        <li className="flex items-center">
          <div className="p-4 px-0 whitespace-nowrap">
            <button
              onClick={goToHosts}
              className="relative pb-1 transition-all cursor-pointer duration-300 group font-bold bg-transparent uppercase border-none"
            >
              Become a host
              <span className="absolute left-0 w-0 bottom-0 block h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </div>
        </li>

        <div className="px-1 hidden xl:flex xl:gap-4 py-2">
          <PrimaryButton
            title="Login"
            padding="py-1"
            handleSubmit={() => navigate("/login")}
            className="bg-[#FF5757] flex text-white font-[500] capatilize hover:bg-[#E14C4C] w-[7rem] px-6"
          />
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="h-full px-2 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg text-subtitle text-black"
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
            {/* Close button */}
            <div className="flex w-full justify-end text-right">
              <span
                className="text-title cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <IoCloseSharp />
              </span>
            </div>

            {/* Map/List View Toggle */}
            {showToggle && (
              <div>
                <ul className="flex flex-col gap-2 justify-center items-center">
                  {view !== "map" && (
                    <li className="flex flex-col justify-center items-center">
                      <div className="p-4 px-0 whitespace-nowrap">
                        <Link
                          onClick={() => setOpen(false)}
                          to={`${location.pathname}?country=${formData?.country}&location=${formData?.location}&view=map`}
                          className="group relative text-md text-black"
                        >
                          <span className="relative z-10 group-hover:font-bold mb-2">
                            Map view
                          </span>
                          <span className="absolute left-0 bottom-0 top-6 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                      </div>
                    </li>
                  )}

                  {view === "map" && (
                    <li className="flex flex-col justify-center items-center">
                      <div className="p-4 px-0 whitespace-nowrap">
                        <Link
                          onClick={() => setOpen(false)}
                          to={`${location.pathname}?country=${formData?.country}&location=${formData?.location}`}
                          className="group relative text-md text-black"
                        >
                          <span className="relative z-10 group-hover:font-bold mb-2">
                            List view
                          </span>
                          <span className="absolute left-0 bottom-0 top-6 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                      </div>
                    </li>
                  )}
                  <div className="h-[0.2px] bg-gray-300 w-full"></div>
                </ul>
              </div>
            )}

            {/* Nav Links */}
            {headerLinks.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <li key={item.id} className="items-center text-center">
                  <div
                    onClick={() => handleNavigation(item.to)}
                    className="py-4 cursor-pointer"
                  >
                    <p
                      className={`text-lg ${
                        isActive
                          ? "font-bold text-black underline decoration-2 decoration-blue-500"
                          : "text-secondary-dark"
                      }`}
                    >
                      {item.text}
                    </p>
                  </div>
                  <div className="h-[0.2px] bg-gray-300"></div>
                </li>
              );
            })}

            {/* Login */}
            <div className="flex justify-center p-4">
              <PrimaryButton
                title={"Login"}
                externalStyles={
                  "bg-[#FF5757]  flex text-white font-[400] capatilize hover:bg-[#E14C4C] w-[7rem] px-6 py-2 leading-4 justify-center items-center"
                }
                handleSubmit={() => {
                  navigate("/nomad/login");
                  setOpen(false);
                }}
              />
            </div>
          </ul>

          {/* Footer */}
          <div className="w-full text-center flex flex-col gap-4 items-center py-4">
            <div className="flex w-full flex-col gap-2 text-small md:text-small">
              <hr />
              <span>
                &copy; Copyright {new Date().getFullYear()} -{" "}
                {(new Date().getFullYear() + 1).toString().slice(-2)}
              </span>
              <span>WoNo. All rights reserved</span>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Header;
