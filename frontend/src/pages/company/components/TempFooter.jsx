import React from "react";
import { Link } from "react-router-dom";
import {
  getProductPath,
  getSectionPath,
  normalizePageNavItems,
  normalizeProductDropdownPages,
} from "../utils/templateRouteUtils";
import { getEnabledFooterSocials } from "../utils/footerSocialLinks";

const SOCIAL_ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v1.5A6 6 0 0 1 16 8z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  ),
};

const TempFooter = ({
  address,
  contact,
  email,
  phone,
  registeredCompany,
  logo,
  isPending,
  pageNavItems = [],
  productDropdownPages = [],
  pathname = "",
  socials,
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
          { name: "Partner", to: getSectionPath("partner", pathname) },
          { name: "Careers", to: getSectionPath("careers", pathname) },
          { name: "Testimonials", to: getSectionPath("testimonials", pathname) },
          { name: "Contact Us", to: getSectionPath("contact", pathname) },
        ];

  const productLinks = normalizeProductDropdownPages(
    Array.isArray(productDropdownPages) ? productDropdownPages : [],
  ).map((p) => ({
    name: p.name || p.slug || "",
    to: getProductPath(p.slug, pathname),
  }));
  const socialLinks = getEnabledFooterSocials(socials);

  return (
    <footer className="border-t border-gray-200 bg-white text-sm text-gray-700">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 text-center md:grid-cols-[1.35fr_1fr_1fr_1fr] md:text-left">
        <div>
          <img src={logo} alt="logo" className="mx-auto mb-3 h-10 md:mx-0" />
          <p className="font-semibold">{!isPending && registeredCompany}</p>
          <p className="mt-2 text-sm leading-relaxed">{!isPending && address}</p>
          {socialLinks.length > 0 ? (
            <div className="mt-4 flex items-center justify-center gap-3 md:justify-start">
              {socialLinks.map((item) => (
                <a
                  key={`footer-social-${item.key}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-[#111827] transition hover:bg-[#111827] hover:text-white"
                >
                  {SOCIAL_ICONS[item.key]}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
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

        {productLinks.length > 0 ? (
          <div>
            <h4 className="mb-3 font-semibold">Products</h4>
            <ul className="space-y-1">
              {productLinks.map((p, idx) => (
                <li key={idx}>
                  <Link to={p.to} className="hover:underline">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

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
