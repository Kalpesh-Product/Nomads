import { Link } from "react-router-dom";

const Footer = () => {
  const footerSections = [
    {
      heading: "Corporate",
      links: [
        { name: "About", link: "/contact" },
        { name: "Real Estate Stats", link: "/real-estate" },
        { name: "How It Works", link: "/how-it-works" },
        { name: "Investor Login", link: "/login" },
      ],
    },
    {
      heading: "Services",
      links: [
        { name: "Property ROI", link: "/roi" },
        { name: "Property Curation", link: "/roi" },
        { name: "Partnership", link: "/partnership" },
        { name: "Mortgage", link: "/mortgages" },
      ],
    },
    {
      heading: "Support",
      links: [
        { name: "Contact Us", link: "/contact" },
        { name: "FAQ", link: "/faq" },
        { name: "Privacy Policy", link: "privacy-policy" },
        { name: "T & C", link: "terms-conditions" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-white text-secondary backdrop-blur-md border-t flex flex-col justify-center items-center gap-0 pt-12 pb-0 md:pb-0 md:pt-14 md:px-10 lg:px-20 border-[0.5px] shadow-lg border-gray-300">
      <div className="w-full flex flex-wrap md:flex-wrap lg:flex-nowrap justify-between items-end pb-14">
        <div className="flex flex-col md:flex-1 md:justify-center md:items-center lg:justify-start lg:items-start mb-8 lg:mb-0">
          <div className="w-70 md:w-80 h-full ">
            <img
              src={''}
              alt="logo"
              className="h-full w-full object-contain mb-3"
            />
            {/* <p className="text-center">
              Axis 2, Dubai Silicon Oasis, Dubai, Dubai
            </p> */}
          </div>
        </div>
        <div className="w-full md:w-full lg:w-fit grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-10 lg:gap-32">
          {footerSections.map((section, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-4 justify-center items-center text-start lg:justify-start lg:items-center">
              <h3 className="font-semibold text-lg mb-2">
                {section.heading.toUpperCase()}
              </h3>
              {section.links.map((linkObj, i) => (
                <Link
                  key={i}
                  to={linkObj.link}
                  className="text-sm  text-secondary opacity-80 hover:opacity-100 hover:text-black transition-all duration-200 cursor-pointer">
                  {linkObj.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full h-[0.3px] bg-secondary" />
      <div className="w-full text-center flex flex-col lg:mb-0 py-4">
        <div className="flex justify-center items-center flex-col md:flex-row lg:flex-row gap-2 text-small md:text-base">
          <span>
            &copy; Copyright {new Date().getFullYear()} -{" "}
            {(new Date().getFullYear() + 1).toString().slice(-2)} <span></span>
          </span>{" "}
          <span>Test</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
