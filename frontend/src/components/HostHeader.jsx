import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/wono-logo-white.png";
import PrimaryButton from "./PrimaryButton";
import Container from "./Container";

const HostHeader = () => {
  const links = [
    { name: "Modules", link: "/hosts/modules" },
    { name: "Themes", link: "/hosts/themes" },
    { name: "Leads", link: "/hosts/leads" },
    { name: "Capital", link: "/hosts/capital" },
    { name: "Career", link: "/hosts/career" },
  ];
  return (
    <header className="bg-black text-white">
      <Container padding={false}>
        <div className="flex px-4 lg:px-0 justify-between items-center md:py-3  ">
          <div
            onClick={() => navigate("/")}
            className=" w-36 overflow-x-hidden rounded-lg flex justify-between items-center cursor-pointer">
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
          <div className="px-1 hidden xl:flex   py-2">
            <PrimaryButton
              title={"Login"}
              padding={"py-2"}
              onClick={() => navigate("/hosts/login")}
              className={
                "bg-[#FF5757]  flex text-white font-[500] capatilize hover:bg-[#E14C4C] w-[7rem] px-6"
              }
            />
          </div>
        </div>
      </Container>
    </header>
  );
};

export default HostHeader;
