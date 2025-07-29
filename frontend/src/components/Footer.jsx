import { Link } from "react-router-dom";
import logo from "../assets/WONO_LOGO_white _TP.png";
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  const footerSections = [
    {
      heading: "Corporate",
      links: [
        { name: "Sign In", link: "/contact" },
        { name: "Sign Up", link: "/real-estate" },
        { name: "Contact", link: "/how-it-works" },
        // { name: "Investor Login", link: "/login" },
      ],
    },
    {
      heading: "Services",
      links: [
        { name: "Switch TO Nomads", link: "/roi" },
        { name: "Career", link: "/roi" },
        { name: "About", link: "/partnership" },
        // { name: "Mortgage", link: "/mortgages" },
      ],
    },
    {
      heading: "Support",
      links: [
        { name: "FAQs", link: "/contact" },
        { name: "Privacy", link: "/faq" },
        { name: "T&C", link: "privacy-policy" },
        // { name: "T & C", link: "terms-conditions" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-black text-primary backdrop-blur-md border-t flex flex-col justify-center items-center gap-0 pt-12 pb-0 md:pb-0 md:pt-14 md:px-10 lg:px-20 border-[0.5px] shadow-lg border-gray-300">
      <div className="w-full flex flex-wrap md:flex-wrap lg:flex-nowrap justify-between items-center pb-14">
        <div className="flex flex-col md:flex-1 md:justify-center md:items-center lg:justify-start lg:items-start mb-8 lg:mb-0">
          <div className="w-70 md:w-80 h-full ">
            {/* <img
              src={logo}
              alt="logo"
              className="h-full w-full object-contain mb-3"
            /> */}
            <img
              src={logo}
              onClick={() => {
                navigate("/home");
                window.scrollTo({ top: 0, behavior: "instant" });
                changeActiveTab("Home");
              }}
              className="w-48 cursor-pointer mb-4"
              alt="logo"
            />
            <p className="text-sm leading-6">
              WONOCO PRIVATE LIMITED <br />
              10 ANSON ROAD #33–10 <br />
              INTERNATIONAL PLAZA SINGAPORE – 079903 <br />
              <Link
                to="mailto:response@wono.co"
                className="text-primary-blue lowercase hover:underline">
                response@wono.co
              </Link>
            </p>
            <div className="flex gap-3 mt-4">
              <FaTwitter className="bg-gray-800 p-1 rounded text-white text-xl cursor-pointer hover:text-blue-400" />
              <FaFacebookF className="bg-gray-800 p-1 rounded text-white text-xl cursor-pointer hover:text-blue-500" />
              <FaInstagram className="bg-gray-800 p-1 rounded text-white text-xl cursor-pointer hover:text-pink-400" />
              <FaLinkedinIn className="bg-gray-800 p-1 rounded text-white text-xl cursor-pointer hover:text-blue-600" />
            </div>
          </div>
        </div>
        <div className=" ">
          <div className="w-full md:w-full lg:w-fit grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-10 lg:gap-32">
            {footerSections.map((section, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 justify-center items-center text-start lg:justify-start lg:items-center">
                {/* <h3 className="font-semibold text-lg mb-2">
                {section.heading.toUpperCase()}
              </h3> */}
                {section.links.map((linkObj, i) => (
                  <Link
                    key={i}
                    to={linkObj.link}
                    className="text-sm  text-primary opacity-80 hover:opacity-100 hover:text-gray-500 transition-all duration-200 cursor-pointer uppercase">
                    {linkObj.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full h-[0.3px] bg-secondary" />
      <div className="w-full text-center flex flex-col lg:mb-0 py-4">
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

export default Footer;
