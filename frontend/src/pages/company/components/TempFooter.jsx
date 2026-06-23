import React from "react";
import { Link } from "react-router-dom";
import { getSectionPath, normalizePageNavItems } from "../utils/templateRouteUtils";

const TempFooter = ({
  address,
  contact,
  email,
  phone,
  registeredCompany,
  logo,
  isPending,
  pageNavItems = [],
  pathname = "",
}) => {
  const quickLinks =
    Array.isArray(pageNavItems) && pageNavItems.length > 0
      ? normalizePageNavItems(pageNavItems)
          .filter((item) => item?.enabled !== false)
          .map((item, idx) => ({
            name: item.name || "Home",
            to: getSectionPath(item.slug, pathname),
            id: idx + 1,
          }))
      : [
          { name: "Home", to: getSectionPath("home", pathname) },
          { name: "About Us", to: getSectionPath("about", pathname) },
          { name: "Products", to: getSectionPath("products", pathname) },
          { name: "Gallery", to: getSectionPath("gallery", pathname) },
          { name: "Testimonials", to: getSectionPath("testimonials", pathname) },
          { name: "Contact Us", to: getSectionPath("contact", pathname) },
        ];

  return (
    <footer className="border-t border-gray-200 bg-white text-sm text-gray-700">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 text-center md:grid-cols-[1.35fr_0.8fr_0.9fr] md:text-left">
        <div>
          <img src={logo} alt="logo" className="mx-auto mb-3 h-10 md:mx-0" />
          <p className="font-semibold">{!isPending && registeredCompany}</p>
          <p className="mt-2 text-sm leading-relaxed">{!isPending && address}</p>
        </div>

        <div className="mx-auto">
          <h4 className="mb-3 font-semibold">Quick Links</h4>
          <ul className="space-y-1">
            {quickLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.to} className="hover:underline">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Contact Us</h4>
          <ul className="space-y-1">
            <li>{phone}</li>
            <li>
              <a href={`mailto:${email}`} className="hover:underline">
                {email}
              </a>
            </li>
            {contact ? <li>{contact}</li> : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        &copy; Copyright {new Date().getFullYear()}-{String(
          new Date().getFullYear() + 1,
        ).slice(-2)} - All Rights Reserved. Privacy Policy | Terms & Conditions Powered by WoNo
      </div>
    </footer>
  );
};

export default TempFooter;
