import React from "react";
import { Link } from "react-router-dom";
import {
  getProductPath,
  getSectionPath,
  normalizePageNavItems,
  normalizeProductDropdownPages,
} from "../../utils/templateRouteUtils";
import { getEnabledFooterSocials } from "../../utils/footerSocialLinks";
import { HEADING, MUTED, PAGE_BG, SOCIAL_ICON, SOCIAL_LABEL, focusStyle } from "./FreshStudioShared";

// Site-level footer for Fresh Studio — same prop shape as the shared
// TempFooter so TemplateSite.jsx can swap it in for `themeVariant ===
// "fresh-studio"` with no other wiring changes. Visuals mirror HostPanel's
// FreshStudioTemplate footer 1:1.
const FreshStudioFooter = ({
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
  productsPageEnabled = true,
}) => {
  const quickLinks = normalizePageNavItems(pageNavItems)
    .filter((item) => item?.enabled !== false)
    .map((item) => ({ name: item.name, to: getSectionPath(item.slug, pathname), slug: item.slug }));

  const productLinks = normalizeProductDropdownPages(
    Array.isArray(productDropdownPages) ? productDropdownPages : [],
  ).map((p) => ({ name: p.name || p.slug || "", to: getProductPath(p.slug, pathname) }));

  const socialLinks = getEnabledFooterSocials(socials);

  return (
    // Unlike HostPanel's Fresh Studio (where the footer is a direct child of
    // one root div already painted PAGE_BG), Nomads renders this footer as a
    // sibling of <main> at the TemplateSite.jsx level with nothing dark
    // behind it — it needs its own explicit background or the page's light
    // body background bleeds through underneath it.
    <footer style={{ backgroundColor: PAGE_BG, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 text-center md:grid-cols-[1.35fr_1fr_1fr_1fr] md:px-10 md:text-left">
        <div>
          {logo ? (
            <img src={logo} alt={registeredCompany || "Company"} className="mx-auto h-10 w-auto object-contain md:mx-0 md:h-12" />
          ) : null}
          {!isPending && registeredCompany ? (
            <p className="mt-3 text-[15px] font-semibold" style={{ color: HEADING }}>
              {registeredCompany}
            </p>
          ) : null}
          {!isPending && address ? (
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: MUTED }}>
              {address}
            </p>
          ) : null}
          {socialLinks.length > 0 ? (
            <div className="mt-4 flex items-center justify-center gap-3 md:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={`footer-social-${social.key}`}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={SOCIAL_LABEL[social.key] || social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:bg-white hover:text-[#0A0A12] focus-visible:outline focus-visible:outline-2"
                  style={{ borderColor: "rgba(255,255,255,0.18)", color: "#ffffff", ...focusStyle }}
                >
                  {SOCIAL_ICON[social.key]}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: HEADING }}>
            Quick Links
          </h3>
          <div className="mt-3 flex flex-col items-center gap-2 text-[13.5px] md:items-start" style={{ color: MUTED }}>
            {quickLinks.map((link) => (
              <Link key={`footer-${link.slug}`} to={link.to} className="hover:opacity-70">
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {productsPageEnabled ? (
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: HEADING }}>
              Services
            </h3>
            <div className="mt-3 flex flex-col items-center gap-2 text-[13.5px] md:items-start" style={{ color: MUTED }}>
              {productLinks.length > 0 ? (
                productLinks.map((link, idx) => (
                  <Link key={`footer-product-${idx}`} to={link.to} className="hover:opacity-70">
                    {link.name}
                  </Link>
                ))
              ) : (
                <p style={{ color: "rgba(255,255,255,0.35)" }}>No products listed</p>
              )}
            </div>
          </div>
        ) : null}

        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: HEADING }}>
            Contact Us
          </h3>
          <div className="mt-3 flex flex-col gap-2 text-[13.5px]" style={{ color: MUTED }}>
            {phone ? <p>{phone}</p> : null}
            {email ? (
              <a href={`mailto:${email}`} className="hover:opacity-70">
                {email}
              </a>
            ) : null}
            {contact ? <p>{contact}</p> : null}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 text-center text-[12px]" style={{ borderTop: "1px solid rgba(255,255,255,0.10)", color: MUTED }}>
        &copy; {new Date().getFullYear()} {registeredCompany || ""}. All rights reserved.
      </div>
    </footer>
  );
};

export default FreshStudioFooter;
