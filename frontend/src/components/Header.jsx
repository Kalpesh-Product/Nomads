import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Drawer } from "@mui/material";
import { IoCloseSharp } from "react-icons/io5";
import PrimaryButton from "./PrimaryButton";
import logo from "../assets/WONO_LOGO_Black_TP.png";
import SecondaryButton from "./SecondaryButton";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view"); // could be 'map', 'list', or null

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  const headerLinks = [
    // { id: 1, text: "ROI", to: "" },
    // { id: 1, text: "Map view", to: "nomad/career" },
    { id: 1, text: "Destination news", to: "nomad/destination-news" },
    { id: 2, text: "Local Blog", to: "nomad/local-blog" },
    {
      id: 3,
      text: "Become a host",
      external: true,
      to: "https://wono.co",
    },
  ];
  return (
    <div className="flex px-4 justify-between items-center md:py-3 md:px-[7.5rem] lg:px-[7.5rem]  bg-white/80 backdrop-blur-md ">
      <div
        onClick={() => navigate("/")}
        className=" w-36 overflow-x-hidden rounded-lg flex justify-between items-center cursor-pointer">
        <img src={logo} alt={"logo"} className="w-full h-full object-contain" />
      </div>
      <div className="h-full px-2 md:hidden lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="hamburger-menu rounded-lg text-title text-black">
          ☰
        </button>
      </div>

      <div>
        <ul className="hidden xl:flex sm:hidden gap-6 justify-center flex-1">
          {/* Show Map View only if current view is not 'map' */}
          {view !== "map" && (
            <li className="flex items-center">
              <div className="p-4 px-0 whitespace-nowrap">
                <Link
                  to={`/nomad/india/goa?view=map`}
                  className="group relative text-base font-medium text-black">
                  <span className="relative z-10 group-hover:font-bold mb-2">
                    Map view
                  </span>
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </li>
          )}

          {/* Show List View only if current view is 'map' */}
          {view === "map" && (
            <li className="flex items-center">
              <div className="p-4 px-0 whitespace-nowrap">
                <Link
                  to={`/nomad/india/goa`}
                  className="group relative text-base font-medium text-black">
                  <span className="relative z-10 group-hover:font-bold mb-2">
                    List view
                  </span>
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </li>
          )}

          {headerLinks.map((item, index) => (
            <li key={item.id} className="flex items-center">
              {!["Signup"].includes(item.text) ? (
                <>
                  <div className="p-4 px-0 whitespace-nowrap">
                    {/* <Link
                      to={item.to}
                      className="text-base font-medium text-white">
                      {item.text}
                    </Link> */}
                    {/* <Link
                      to={item.to}
                      className="group relative text-base font-medium text-white">
                      <span className="relative z-10 group-hover:font-bold mb-8">
                        {item.text}
                      </span>
                      <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-blue-500 transition-all duration-300 group-hover:w-full "></span>
                    </Link> */}

                    {item.external ? (
                      <a
                        href={item.to}
                        className="group relative text-base font-medium text-black">
                        <span className="relative z-10 group-hover:font-bold mb-8">
                          {item.text}
                        </span>
                        <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                      </a>
                    ) : (
                      <Link
                        to={item.to}
                        className="group relative text-base font-medium text-black">
                        <span className="relative z-10 group-hover:font-bold mb-8">
                          {item.text}
                        </span>
                        <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                      </Link>
                    )}
                  </div>
                  {/* {index !== headerLinks.length - 1 && (
                  <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
                )} */}
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-4">
        <div className="px-1 hidden xl:flex gap-2">
          <PrimaryButton
            title={"Login"}
            handleSubmit={() => navigate("")}
            className={"text-white font-bold px-8"}
          />
        </div>
        {/* <div className="px-1 hidden xl:flex gap-2">
          <SecondaryButton
            title={"SIGN UP"}
            handleSubmit={() => navigate("")}
          />
        </div> */}
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
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}>
        <div className="flex flex-col h-full justify-between">
          <ul className="flex flex-col gap-4 p-4 ">
            <div>
              <span
                className="text-title cursor-pointer"
                onClick={() => setOpen(false)}>
                <IoCloseSharp />
              </span>
            </div>
            {headerLinks.map((item) => (
              <li key={item.id} className="items-center text-center">
                <div onClick={() => handleNavigation(item.to)} className="py-4">
                  <p className="text-primary">{item.text}</p>
                </div>
                <div className="h-[0.2px] bg-gray-300"></div>
              </li>
            ))}
            <div className="flex justify-center p-4">
              <PrimaryButton
                title={"Sign In"}
                externalStyles={"bg-primary-blue"}
                handleSubmit={() => {
                  navigate("");
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
              <span></span>
              <span>BRIDG. All rights reserved</span>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Header;
