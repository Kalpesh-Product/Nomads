import React from "react";
import { Link } from "react-router-dom";

const TempFooter = ({
  address,
  contact,
  email,
  phone,
  registeredCompany,
  logo,
  isPending,
}) => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const quickLinks = [
    { name: "Home", id: "hero" },
    { name: "About", id: "about" },
    { name: "Products", id: "products" },
    { name: "Gallery", id: "gallery" },
    { name: "Testimonials", id: "testimonials" },
  ];

  const contactLinks = !isPending
    ? [
        { label: phone, href: `tel:${phone}` },
        { label: email, href: `mailto:${email}` },
      ]
    : [];

  return (
    <footer className="bg-white border-t border-gray-200 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Left - Company Info */}
        <div>
          <img src={logo} alt="logo" className="h-10 mx-auto md:mx-0 mb-3" />
          <p className="font-semibold">{!isPending && registeredCompany}</p>
          <p className="mt-2 leading-relaxed text-sm">
            {!isPending && address}
          </p>
        </div>

        {/* Middle - Quick Links */}
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-1">
            {quickLinks.map((link, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="hover:underline"
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right - Contact Info */}
        <div>
          <h4 className="font-semibold mb-3">Contact Us</h4>
          <ul className="space-y-1">
            {/* {contactLinks.map((item, idx) => (
              <li key={idx}>
                <a href={item.href} className="hover:underline">
                  {item.label}
                </a>
              </li>
            ))} */}
            <li >{phone}</li>
            <li >
              <a href={`mailto:${email}`} className="hover:underline">
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © Copyright 2025-26 {registeredCompany || "Unknown"} - All rights reserved. Powered By{" "}
        <a href="https://wono.co" className="hover:underline">
          WoNo
        </a>
      </div>
    </footer>
  );
};

export default TempFooter;
