import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/WONO_LOGO_Black_TP.png";
import { FaGlobe, FaRupeeSign, FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { AiOutlineClose } from "react-icons/ai";

const languages = [
  { code: "en-US", name: "English (US)" },
  { code: "en-IN", name: "English (IN)" },
  { code: "en-SG", name: "English (Singapore)" },
  { code: "hi-IN", name: "हिन्दी (India)" },
  { code: "es-ES", name: "Español (Spain)" },
  { code: "fr-FR", name: "Français (France)" },
  { code: "de-DE", name: "Deutsch (Germany)" },
];

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$" },
];

const HostFooter = () => {
  const [showLangModal, setShowLangModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const footerSections = [
    {
      links: [
        { name: "About", link: "/about" },
        { name: "Career", link: "career" },
        { name: "FAQs", link: "faq" },
        // { name: "Content and Copyright Policy", link: "content-and-copyright" },
      ],
    },
    {
      links: [
        { name: "Privacy", link: "privacy" },
        { name: "T&C", link: "terms-and-conditions" },
        { name: "Contact", link: "contact" },
        // { name: "Content Use & Removal Policy", link: "content-use-removal" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-gray-100 text-black flex flex-col justify-center items-center pb-0 shadow-lg">
      <div className="w-full flex flex-wrap lg:flex-nowrap justify-between items-center pt-12 pb-8 px-4 md:px-[7.5rem]">
        {/* Left Section */}
        <div className="flex flex-col w-full lg:w-fit justify-center items-center md:flex-1 md:items-center lg:items-start mb-8 lg:mb-0">
          <div className="w-full md:w-80 h-full flex flex-col items-center lg:items-start">
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
            <p className="text-sm leading-6 text-center lg:text-left">
              WONOCO PRIVATE LIMITED - SINGAPORE <br />
              <Link
                to="mailto:response@wono.co"
                className="text-primary-blue lowercase hover:underline"
              >
                response@wono.co
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section (Links) */}
        <div className="lg:w-fit w-full">
          <div className="w-full grid grid-cols-2 md:grid-cols-2 gap-10 lg:gap-x-8 lg:mr-5">
            {footerSections.map((section, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-center items-center lg:items-center"
              >
                {section.links.map((linkObj, i) => (
                  <Link
                    key={i}
                    to={linkObj.link}
                    className="text-sm text-black opacity-80 hover:opacity-100 hover:text-gray-500 transition-all duration-200 cursor-pointer uppercase p-4"
                  >
                    {linkObj.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      {/* <div className="w-full text-center flex flex-col py-6 border-t-2 border-white">
        <div className="flex justify-center items-center flex-col md:flex-row gap-2 text-small md:text-base">
          <span>
            &copy; Copyright {new Date().getFullYear()} -{" "}
            {(new Date().getFullYear() + 1).toString().slice(-2)}
          </span>{" "}
          <span className="text-tiny lg:text-content">
            WONOCO PRIVATE LIMITED - SINGAPORE. All Rights Reserved.
          </span>
        </div>
      </div> */}
      {/* Copyright */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center text-center md:text-left py-6 border-t-2 border-white px-4 md:px-[7.5rem]">
        {/* Left side — Copyright */}
        <div className="flex flex-col md:flex-row justify-center md:justify-start items-center gap-1 text-[10px] md:text-xs font-semibold text-gray-800 mb-3 md:mb-0">
          <span>
            &copy; Copyright {new Date().getFullYear()} -{" "}
            {(new Date().getFullYear() + 1).toString().slice(-2)}
          </span>
          <span className="text-[10px] md:text-xs font-semibold md:ml-2">
            WONOCO PRIVATE LIMITED - SINGAPORE. All Rights Reserved.
          </span>
        </div>

        {/* Right side — Policy Links */}
        <div className="flex flex-col md:flex-row justify-center md:justify-end items-center gap-4 text-[10px] md:text-xs text-gray-800 ">
          <Link
            to="/content-and-copyright"
            className="hover:opacity-100 hover:text-gray-500 uppercase text-center md:text-right"
          >
            Content and Copyright Policy
          </Link>
          <Link
            to="/content-use-removal"
            className="hover:opacity-100 hover:text-gray-500 uppercase text-center md:text-right"
          >
            Content Use & Removal Policy
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full flex flex-col md:flex-row justify-center items-center text-[10px] md:text-xs px-4 py-4 text-gray-800 bg-gray-50 font-semibold border-t border-gray-200">
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div
            // onClick={() => setShowLangModal(true)}
            className="flex items-center gap-1 cursor-pointer hover:underline"
          >
            <FaGlobe className="text-[12px]" />
            <span>{selectedLang.name}</span>
          </div>

          {/* Currency Selector */}
          <div
            onClick={() => setShowCurrencyModal(true)}
            className="px-2 py-[2px] border border-gray-700 rounded-md text-[12px] flex items-center gap-1 cursor-pointer hover:underline"
          >
            {/* <FaRupeeSign className="text-[12px]" /> */}
            <span>{selectedCurrency.symbol}</span>
            <span>{selectedCurrency.code}</span>
          </div>

          <FaFacebookF className="text-[12px]" />
          <FaXTwitter className="text-[12px]" />
          <FaInstagram className="text-[12px]" />
        </div>
      </div>

      {/* Language Modal */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-[80vh]">
            <button
              onClick={() => setShowLangModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <AiOutlineClose size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              Choose a language and region
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang);
                    setShowLangModal(false);
                  }}
                  className={`border rounded-md px-3 py-2 cursor-pointer hover:border-black ${
                    selectedLang.code === lang.code
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                >
                  {lang.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-[80vh]">
            <button
              onClick={() => setShowCurrencyModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <AiOutlineClose size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Choose a currency</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currencies.map((cur) => (
                <div
                  key={cur.code}
                  onClick={() => {
                    setSelectedCurrency(cur);
                    setShowCurrencyModal(false);
                  }}
                  className={`border rounded-md px-3 py-2 cursor-pointer hover:border-black ${
                    selectedCurrency.code === cur.code
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                >
                  <div className="font-medium">{cur.name}</div>
                  <div className="text-sm text-gray-500">
                    {cur.code} — {cur.symbol}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default HostFooter;
