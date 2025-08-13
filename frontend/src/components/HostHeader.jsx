import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/wono-logo-white.png";
import PrimaryButton from "./PrimaryButton";
import Container from "./Container";
import { Drawer } from "@mui/material";
import { IoCloseSharp } from "react-icons/io5";

const HostHeader = () => {
  const navigate = useNavigate();
    const [open, setOpen] = useState(false);
  const links = [
    { name: "Modules", link: "/hosts/modules" },
    { name: "Themes", link: "/hosts/themes" },
    { name: "Leads", link: "/hosts/leads" },
    { name: "Capital", link: "/hosts/capital" },
    { name: "Career", link: "/hosts/career" },
  ];
    const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <header className="bg-black text-white py-3 lg:py-0">
      <Container padding={false}>
        <div className="flex px-4 lg:px-0 justify-between items-center md:py-3  ">
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
          <ul className="hidden xl:flex sm:hidden gap-8 pl-20 justify-center flex-1 uppercase">
            {links.map((link) => (
              <li>
                <Link to={`${link.link}`}>{link.name}</Link>
              </li>
            ))}
          </ul>
          <div className="px-1 hidden xl:flex xl:gap-4 py-2">
            <PrimaryButton
              title={"Login"}
              padding={"py-2"}
              onClick={() => navigate("/hosts/login")}
              className={
                "bg-[#FF5757]  flex text-white font-[500] capatilize hover:bg-[#E14C4C] w-[7rem] px-6"
              }
            />
            <PrimaryButton
              title={"SIGN UP"}
              padding={"py-2"}
              handleSubmit={() => navigate("/hosts/signup")}
              className={
                "bg-primary-blue  flex text-white font-[500] capatilize hover:font-semibold hover:bg-primary-blue transition-all w-[7rem] px-4"
              }
            />
          </div>
          <div className="h-full px-2  lg:hidden">
            <button
              onClick={() => setOpen(true)}
              className=" rounded-lg text-subtitle text-white"
            >
              ☰
            </button>
          </div>
        </div>
      </Container>
            <Drawer
        sx={{
          "& .MuiDrawer-paper": {
            width: {
              xs: "85%",
              sm: "400px",
              backgroundColor : "black"
            },
          },
        }}
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}>
        <div className="flex flex-col h-full justify-between">
          <ul className="flex flex-col gap-4 p-4 ">
            <div className="flex justify-end w-full">
              <span
                className="text-title cursor-pointer text-secondary-light"
                onClick={() => setOpen(false)}>
                <IoCloseSharp />
              </span>
            </div>

   
            {links.map((item) => (
              <li key={item.id} className="items-center text-center">
                <div onClick={() => handleNavigation(item.link)} className="py-4">
                  <p className="text-white text-lg">{item.name}</p>
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
    </header>
  );
};

export default HostHeader;
