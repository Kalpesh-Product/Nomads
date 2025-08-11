import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/WONO_LOGO_Black_TP.png";
import PrimaryButton from "./PrimaryButton";

const HostHeader = () => {
  const links = [
    { name: "Modules", link: "/hosts/modules" },
    { name: "Themes", link: "/hosts/themes" },
    { name: "Leads", link: "/hosts/leads" },
    { name: "Capital", link: "/hosts/capital" },
    { name: "Career", link: "/hosts/career" },
  ];
  return (
    <div className="flex px-4 justify-between items-center md:py-3 md:px-[7.5rem] lg:px-[7.5rem]  bg-white/80 backdrop-blur-md ">
      <div
        onClick={() => navigate("/")}
        className=" w-36 overflow-x-hidden rounded-lg flex justify-between items-center cursor-pointer"
      >
        <img src={logo} alt={"logo"} className="w-full h-full object-contain" />
      </div>
      <ul className="hidden xl:flex sm:hidden gap-8 pl-20 justify-center flex-1">
        
        {links.map((link) => (
          
            <li>
              <Link to={`${link.link}`}>{link.name}</Link>
            </li>
          
        ))}
        
        
      </ul>
       <div className="px-1 hidden xl:flex   py-2">
          <PrimaryButton
            title={"Login"}
            padding={"py-2"}
            handleSubmit={() => navigate("/hosts/login")}
            className={
              "bg-[#FF5757]  flex text-white font-[500] capatilize hover:bg-[#E14C4C] w-[7rem] px-6"
            }
          />
        </div>
    </div>
  );
};

export default HostHeader;
