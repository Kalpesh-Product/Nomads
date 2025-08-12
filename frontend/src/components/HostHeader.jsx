import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/WONO_LOGO_Black_TP.png";
import PrimaryButton from "./PrimaryButton";
import Container from "./Container";

const HostHeader = () => {
  const navigate = useNavigate()
  const links = [
    { name: "Modules", link: "/hosts/modules" },
    { name: "Themes", link: "/hosts/themes" },
    { name: "Leads", link: "/hosts/leads" },
    { name: "Capital", link: "/hosts/capital" },
    { name: "Career", link: "/hosts/career" },
  ];
  return (
    <header className="bg-white/80 backdrop-blur-md py-3 md:py-0">
      <Container padding={false}>
        <div className="flex px-4 lg:px-0 justify-between items-center md:py-3  ">
          <div
            onClick={() => navigate("/")}
            className=" w-36 overflow-x-hidden rounded-lg flex justify-between items-center cursor-pointer"
          >
            <img
              src={logo}
              alt={"logo"}
              className="w-full h-full object-contain"
            />
          </div>
          <ul className="hidden xl:flex sm:hidden gap-8 pl-20 justify-center flex-1">
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
              handleSubmit={() => navigate("/hosts/login")}
              className={
                "bg-[#FF5757]  flex text-white font-[500] capatilize hover:bg-[#E14C4C] w-[7rem] px-6"
              }
            />
            <PrimaryButton
              title={"SIGN UP"}
              padding={"py-2"}
              handleSubmit={() => navigate("/hosts/login")}
              className={
                "bg-primary-blue  flex text-white font-[500] capatilize hover:font-semibold hover:bg-primary-blue transition-all w-[7rem] px-4"
              }
            />
          </div>
        </div>
      </Container>
    </header>
  );
};

export default HostHeader;
