import React from "react";
import { Link } from "react-router-dom";
import {
  getProductPath,
  getSectionPath,
  normalizePageNavItems,
  normalizeProductDropdownPages,
} from "../../utils/templateRouteUtils";
import { getEnabledFooterSocials } from "../../utils/footerSocialLinks";
import { BROWN, RUST, SERIF, SOCIAL_ICON, SOCIAL_LABEL } from "./WarmOrganicShared";

// Site-level footer for Warm Organic — same prop shape as the shared
// TempFooter (and FreshStudioFooter) so TemplateSite.jsx can swap it in for
// `themeVariant === "warm-organic"` with no other wiring changes. Visuals
// mirror HostPanel's WarmOrganicTemplate footer 1:1 (white bg, border-t
// black/5, serif company name, rust social pills, quick-links columns).
const WarmOrganicFooter = ({
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
    <footer className="bg-white border-t border-black/5" style={{ color: BROWN }}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 text-center md:grid-cols-[1.35fr_1fr_1fr_1fr] md:text-left">
        <div className="flex flex-col items-center md:items-start">
          {logo ? (
            <img src={logo} alt={registeredCompany || "Company"} className="h-12 w-auto object-contain md:h-14" />
          ) : null}
          {!isPending && registeredCompany ? (
            <p className={`mt-3 text-[15px] font-normal ${SERIF}`}>{registeredCompany}</p>
          ) : null}
          {!isPending && address ? <p className="mt-1 text-[13px] opacity-70">{address}</p> : null}
          {socialLinks.length ? (
            <div className="mt-4 flex items-center justify-center gap-3 md:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={`footer-social-${social.key}`}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={SOCIAL_LABEL[social.key] || social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:opacity-75"
                  style={{ backgroundColor: `${RUST}15`, color: RUST }}
                >
                  {SOCIAL_ICON[social.key]}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] opacity-80">Quick Links</h3>
          <div className="mt-3 flex flex-col gap-2 text-[13.5px] opacity-75 items-start">
            {quickLinks.map((link) => (
              <Link key={`footer-${link.slug}`} to={link.to} className="hover:opacity-100">
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {productsPageEnabled ? (
          <div>
            <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] opacity-80">Services</h3>
            <div className="mt-3 flex flex-col gap-2 text-[13.5px] opacity-75 items-start">
              {productLinks.length > 0 ? (
                productLinks.map((link, idx) => (
                  <Link key={`footer-product-${idx}`} to={link.to} className="hover:opacity-100">
                    {link.name}
                  </Link>
                ))
              ) : (
                <p className="opacity-50">No products listed</p>
              )}
            </div>
          </div>
        ) : null}

        <div>
          <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] opacity-80">Contact Us</h3>
          <div className="mt-3 flex flex-col gap-2 text-[13.5px] opacity-75">
            {phone ? <p>{phone}</p> : null}
            {email ? (
              <a href={`mailto:${email}`} className="hover:opacity-100">
                {email}
              </a>
            ) : null}
            {contact ? <p>{contact}</p> : null}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 text-center text-[11.5px] opacity-60" style={{ borderTop: `1px solid ${BROWN}15` }}>
        &copy; {new Date().getFullYear()} {registeredCompany || ""}. All rights reserved.
      </div>
    </footer>
  );
};

export default WarmOrganicFooter;
