import { Link } from "react-router-dom";
import logo from "../assets/wono-logo-white.png";
import { FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";

import { FaGlobe, FaRupeeSign, FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const HostFooter = () => {
  const footerSections = [
    {
      links: [
        { name: "Sign In", link: "/hosts/login" },
        { name: "Sign Up", link: "/hosts/signup" },
        { name: "Contact", link: "/hosts/contact" },
      ],
    },
    {
      links: [
        { name: "Modules", link: "/hosts/modules" },
        { name: "Themes", link: "/hosts/themes" },
        { name: "Leads", link: "/hosts/leads" },
      ],
    },
    {
      links: [
        { name: "Capital", link: "/hosts/capital" },
        { name: "Career", link: "/hosts/career" },
        { name: "About", link: "/hosts/about" },
      ],
    },
    {
      links: [
        { name: "FAQs", link: "/hosts/faq" },
        { name: "Privacy", link: "/hosts/privacy" },
        { name: "T&C", link: "/hosts/terms-and-conditions" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-black text-white backdrop-blur-md  flex flex-col justify-center items-center gap-0  pb-0 md:pb-0   shadow-lg ">
      <div className="w-full flex flex-wrap md:flex-wrap lg:flex-nowrap justify-between items-center pt-12 pb-12 px-4 md:px-[7.5rem]">
        <div className="flex flex-col justify-center md:flex-1 md:justify-center md:items-center lg:justify-start lg:items-start mb-8 lg:mb-0">
          <div className="w-70 md:w-80 h-full">
            <img
              src={logo}
              onClick={() => {
                navigate("/home");
                window.scrollTo({ top: 0, behavior: "instant" });
                changeActiveTab("Home");
              }}
              className="w-36 cursor-pointer mb-4"
              alt="logo"
            />
            <p className="text-[0.95rem] leading-6 mb-4">
              WONOCO PRIVATE LIMITED <br />
              10 ANSON ROAD #33–10 <br />
              INTERNATIONAL PLAZA SINGAPORE – 079903 <br />
              <Link
                to="mailto:response@wono.co"
                className="text-primary-blue lowercase hover:underline">
                response@wono.co
              </Link>
            </p>
            <div className="flex gap-3 ">
              <FaTwitter className="bg-host p-1 rounded text-white text-2xl cursor-pointer hover:text-blue-400" />
              <FaFacebook className="bg-host p-1 rounded text-white text-2xl cursor-pointer hover:text-blue-500" />
              <FaInstagram className="bg-host p-1 rounded text-white text-2xl cursor-pointer hover:text-pink-400" />
              <FaLinkedin className="bg-host p-1 rounded text-white text-2xl cursor-pointer hover:text-blue-600" />
            </div>
          </div>
        </div>
        <div className=" ">
          <div className="w-full md:w-full lg:w-fit grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-x-8 lg:gap-y-0  lg:mr-5">
            {footerSections.map((section, idx) => (
              <div
                key={idx}
                className="flex flex-col  justify-center items-center text-start lg:justify-start lg:items-center">
                {/* <h3 className="font-semibold text-lg mb-2">
                {section.heading.toUpperCase()}
              </h3> */}
                {section.links.map((linkObj, i) => (
                  <Link
                    key={i}
                    to={linkObj.link}
                    className="text-sm  text-white opacity-80 hover:opacity-100 hover:text-gray-500 transition-all duration-200 cursor-pointer uppercase p-4">
                    {linkObj.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <div className="w-full h-[0.3px] bg-secondary border-t border-white" /> */}
      <div className="w-full text-center flex flex-col lg:mb-0 py-6 border-t-2 border-gray-700">
        <div className="flex justify-center items-center flex-col md:flex-row lg:flex-row gap-2 text-small md:text-base">
          <span>
            &copy; Copyright {new Date().getFullYear()} -{" "}
            {(new Date().getFullYear() + 1).toString().slice(-2)} <span></span>
          </span>{" "}
          <span> WONOCO PRIVATE LIMITED - SINGAPORE. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default HostFooter;
