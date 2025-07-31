import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Drawer } from "@mui/material";
import { IoCloseSharp } from "react-icons/io5";
import PrimaryButton from "./PrimaryButton";
import logo from "../assets/WONO_LOGO_white _TP.png";
import SecondaryButton from "./SecondaryButton";

const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };
  const headerLinks = [
    // { id: 1, text: "ROI", to: "" },
    { id: 1, text: "CAREER", to: "nomad" },
    { id: 1, text: "CONTACT", to: "" },
    { id: 1, text: "SWITCH TO BUSINESS", to: "" },
  ];
  return (
    <div className="flex px-4 justify-between items-center md:py-4 md:px-10 lg:px-20  bg-black backdrop-blur-md ">
      <div
        onClick={() => navigate("/")}
        className="h-10 w-24 overflow-x-hidden rounded-lg flex justify-between items-center cursor-pointer">
        <img src={logo} alt={"logo"} className="w-full h-full object-contain" />
      </div>
      <div className="h-full px-2">
        <button
          onClick={() => setOpen(true)}
          className="hamburger-menu rounded-lg text-title text-white">
          ☰
        </button>
      </div>

      <ul className="hidden xl:flex sm:hidden gap-4 justify-center flex-1">
        {headerLinks.map((item, index) => (
          <li key={item.id} className="flex items-center">
            {!["Signup"].includes(item.text) ? (
              <>
                <div className="p-4 px-8 whitespace-nowrap">
                  <Link
                    to={item.to}
                    className="text-base font-medium text-white">
                    {item.text}
                  </Link>
                </div>
                {/* {index !== headerLinks.length - 1 && (
                  <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
                )} */}
              </>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="px-1 hidden xl:flex gap-2">
        <PrimaryButton title={"Sign In"} handleSubmit={() => navigate("")} />
      </div>
      <div className="px-1 hidden xl:flex gap-2">
        <SecondaryButton title={"Sign Up"} handleSubmit={() => navigate("")} />
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
