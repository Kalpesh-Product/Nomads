import React from "react";
import { Link } from "react-router-dom";

const TempFooter = () => {
  const quickLinks = [
    { name: "Home", path: "/home" },
    { name: "About", path: "/about" },
    { name: "Products", path: "/products" },
    { name: "Gallery", path: "/gallery" },
    { name: "Testimonial", path: "/testimonial" },
  ];

  const contactLinks = [
    { label: "+91 80071 26444", href: "tel:+918007126444" },
    { label: "response@biznest.co.in", href: "mailto:response@biznest.co.in" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Left - Company Info */}
        <div>
          <img
            src={"https://randomuser.me/api/portraits/men/15.jpg"}
            alt="BIZ Nest"
            className="h-10 mx-auto md:mx-0 mb-3"
          />
          <p className="font-semibold">MUSTARO TECHNOSERVE PVT LTD</p>
          <p className="mt-2 leading-relaxed text-sm">
            Sunteck Kanaka Corporate Park, <br />
            701 A, 701 B, 601 A, 601 B, 501 A &amp; 501 B, Patto Centre, <br />
            Panaji, Goa 403001
          </p>
        </div>

        {/* Middle - Quick Links */}
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-1">
            {quickLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.path} className="hover:underline">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right - Contact Info */}
        <div>
          <h4 className="font-semibold mb-3">Contact Us</h4>
          <ul className="space-y-1">
            {contactLinks.map((item, idx) => (
              <li key={idx}>
                <a href={item.href} className="hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © Copyright 2025-26 BIZ Nest - All rights reserved. Powered By{" "}
        <a href="https://wono.co" className="hover:underline">
          WoNo
        </a>
      </div>
    </footer>
  );
};

export default TempFooter;
