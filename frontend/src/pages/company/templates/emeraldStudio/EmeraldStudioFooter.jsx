import React from "react";
import { Link } from "react-router-dom";
import {
  getProductPath,
  getSectionPath,
  normalizePageNavItems,
  normalizeProductDropdownPages,
} from "../../utils/templateRouteUtils";
import { getEnabledFooterSocialsWithFallback } from "../../utils/footerSocialLinks";
import { SOCIAL_ICON } from "../freshStudio/FreshStudioShared";
import { HEADING_FONT, SOCIAL_LABEL } from "./EmeraldStudioShared";

// Site-level footer for Emerald Studio — same prop shape as the shared
// TempFooter (and FreshStudioFooter/WarmOrganicFooter) so TemplateSite.jsx
// can swap it in for `themeVariant === "emerald-studio"` with no other
// wiring changes. Visuals mirror HostPanel's EmeraldStudioTemplate footer
// 1:1 (dark emerald bg, amber logo mark, text-link social row, 4-column
// quick-links/services/contact layout).
const EmeraldStudioFooter = ({
  address,
  contact,
  email,
  phone,
  registeredCompany,
  companyName,
  logo,
  isPending,
  pageNavItems = [],
  productDropdownPages = [],
  pathname = "",
  socials,
  productsPageEnabled = true,
}) => {
  const quickLinks = normalizePageNavItems(pageNavItems)
    .filter((item) => item?.enabled !== false)
    .map((item) => ({ name: item.name, to: getSectionPath(item.slug, pathname), slug: item.slug }));

  const productLinks = normalizeProductDropdownPages(
    Array.isArray(productDropdownPages) ? productDropdownPages : [],
  )
    .slice(0, 4)
    .map((p) => ({ name: p.name || p.slug || "", to: getProductPath(p.slug, pathname) }));

  const socialLinks = getEnabledFooterSocialsWithFallback(socials);
  const displayName = registeredCompany || companyName || "";

  return (
    <footer className="border-t border-white/20 bg-[#4a6b96]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 text-center md:grid-cols-[1.35fr_1fr_1fr_1fr] md:text-left">
        <div className="col-span-1">
          <Link to={getSectionPath("home", pathname)} className="flex items-center gap-2 mb-4 md:justify-start justify-center">
            {logo ? (
              <img src={logo} alt={displayName || "Logo"} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <span className={`w-7 h-7 rounded-sm bg-white flex items-center justify-center text-slate-900 font-bold text-sm ${HEADING_FONT}`}>
                  {(displayName || "Y").charAt(0).toUpperCase()}
                </span>
                <span className={`font-semibold text-lg tracking-tight text-white ${HEADING_FONT}`}>{displayName || "Your Company"}</span>
              </>
            )}
          </Link>
          {!isPending && address ? <p className="text-white/90 text-sm leading-relaxed mt-1">{address}</p> : null}
          {socialLinks.length ? (
            <div className="flex gap-4 mt-4 md:justify-start justify-center">
              {socialLinks.map((social) => {
                const Tag = social.href ? "a" : "span";
                const linkProps = social.href ? { href: social.href, target: "_blank", rel: "noreferrer" } : { role: "img" };
                return (
                  <Tag
                    key={`footer-social-${social.key}`}
                    {...linkProps}
                    aria-label={SOCIAL_LABEL[social.key] || social.label}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/50 text-white transition-colors ${
                      social.href ? "hover:bg-white hover:text-slate-900" : "cursor-default"
                    }`}
                  >
                    {SOCIAL_ICON[social.key]}
                  </Tag>
                );
              })}
            </div>
          ) : null}
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-4 text-white">Quick Links</h4>
          <ul className="space-y-2.5">
            {quickLinks.map((link) => (
              <li key={`footer-${link.slug}`}>
                <Link to={link.to} className="text-white/90 text-sm hover:text-white transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {productsPageEnabled ? (
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">Services</h4>
            <ul className="space-y-2.5">
              {productLinks.length > 0 ? (
                productLinks.map((link, idx) => (
                  <li key={`footer-product-${idx}`}>
                    <Link to={link.to} className="text-white/90 text-sm hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <span className="text-white/90 text-sm">No products listed</span>
                </li>
              )}
            </ul>
          </div>
        ) : null}

        <div>
          <h4 className="font-semibold text-sm mb-4 text-white">Contact Us</h4>
          <ul className="space-y-2.5 text-white/90 text-sm">
            {phone ? <li>{phone}</li> : null}
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="hover:text-white">
                  {email}
                </a>
              </li>
            ) : null}
            {contact ? <li>{contact}</li> : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 pt-6 pb-6 px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-white/90 text-xs max-w-7xl mx-auto">
        <p>
          &copy; {new Date().getFullYear()} {displayName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default EmeraldStudioFooter;
