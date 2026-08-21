import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getProductPath,
  getSectionPath,
  getTemplateRouteContext,
  normalizePageNavItems,
  normalizeProductDropdownPages,
  resolveSectionFromSlug,
} from "../../utils/templateRouteUtils";
import { BROWN, FONT_IMPORT, RUST, SANS, SERIF } from "./WarmOrganicShared";

// Site-level header for Warm Organic — mirrors HostPanel's
// WarmOrganicTemplate header 1:1 visually (sticky white bar, rust
// active underline, rust-outlined "Login" pill, serif logo wordmark,
// products dropdown), but reads Nomads' shared TempHeader prop shape (logo,
// pageNavItems, navItems, productDropdownPages, productPages) and navigates
// with real react-router paths instead of HostPanel's in-memory section
// state — same approach FreshStudioHeader.jsx used. Rendered by
// TemplateSite.jsx in place of the shared TempHeader whenever `themeVariant
// === "warm-organic"`.
const WarmOrganicHeader = forwardRef(
  ({ logo, companyName = "", pageNavItems = [], navItems = [], productDropdownPages = [], productPages = [] }, ref) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const routeContext = useMemo(() => getTemplateRouteContext(location.pathname), [location.pathname]);
    const currentSection = routeContext.currentSection;
    const currentProductSlug = routeContext.currentProductSlug;

    const links = useMemo(() => {
      const orderedSlugs = ["home", "about", "products", "gallery", "partner", "careers", "testimonials", "contact"];
      const normalizedItems = normalizePageNavItems(pageNavItems, navItems);
      return orderedSlugs
        .map((slug) => normalizedItems.find((item) => resolveSectionFromSlug(item.slug) === slug))
        .filter(Boolean)
        .map((item) => ({ ...item, to: getSectionPath(item.slug, location.pathname) }));
    }, [location.pathname, navItems, pageNavItems]);

    const normalizedProductPages = useMemo(
      () => normalizeProductDropdownPages(productDropdownPages.length > 0 ? productDropdownPages : productPages),
      [productDropdownPages, productPages],
    );

    useEffect(() => {
      setMobileOpen(false);
      setMobileProductsOpen(false);
      setProductsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
      if (!productsOpen) return undefined;
      const handlePointerDown = (event) => {
        const headerEl = ref && typeof ref === "object" ? ref.current : null;
        if (headerEl && !headerEl.contains(event.target)) setProductsOpen(false);
      };
      document.addEventListener("pointerdown", handlePointerDown);
      return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [productsOpen, ref]);

    const goTo = (path) => {
      navigate(path);
      setMobileOpen(false);
      setProductsOpen(false);
      setMobileProductsOpen(false);
    };

    const renderDesktopLink = (item) => {
      const section = resolveSectionFromSlug(item.slug || item.name);
      const isActive = currentSection === section;

      if (section === "products") {
        return (
          <div key={item.slug} className="relative inline-flex items-center">
            <div
              className={`inline-flex items-center gap-1.5 border-b-2 pb-1 text-[13px] transition-colors duration-150 ${SANS}`}
              style={isActive || productsOpen ? { color: RUST, borderColor: RUST, fontWeight: 600 } : { color: "#5A4A3C", borderColor: "transparent" }}
            >
              <button type="button" onClick={() => goTo(getSectionPath("products", location.pathname))}>
                {item.name}
              </button>
              <button
                type="button"
                onClick={() => setProductsOpen((prev) => !prev)}
                aria-label="Toggle products menu"
                aria-expanded={productsOpen}
                className="inline-flex items-center justify-center"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${productsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 7.5l5 5 5-5" />
                </svg>
              </button>
            </div>
            {productsOpen && normalizedProductPages.length > 0 ? (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-60 -translate-x-1/2 rounded-2xl bg-white p-2 shadow-2xl" style={{ border: `1px solid ${BROWN}22` }}>
                <button
                  type="button"
                  onClick={() => goTo(getSectionPath("products", location.pathname))}
                  className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-black/[0.03]"
                  style={{ color: "#5A4A3C" }}
                >
                  All Services
                </button>
                {normalizedProductPages.map((product, index) => {
                  const isSelected = isActive && currentProductSlug === product.slug;
                  return (
                    <button
                      key={product.slug || index}
                      type="button"
                      onClick={() => goTo(getProductPath(product.slug, location.pathname))}
                      className="block w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-black/[0.03]"
                      style={isSelected ? { color: RUST, fontWeight: 600 } : { color: "#5A4A3C" }}
                    >
                      {product.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      }

      return (
        <button
          key={item.slug}
          type="button"
          onClick={() => goTo(item.to)}
          className={`text-[13px] border-b-2 pb-1 transition-colors duration-150 ${SANS} ${isActive ? "font-semibold" : "font-normal"}`}
          style={{ color: isActive ? RUST : "#5A4A3C", borderColor: isActive ? RUST : "transparent" }}
        >
          {item.name}
        </button>
      );
    };

    return (
      <header
        ref={ref}
        className="sticky top-0 z-30 bg-white border-b border-black/5"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <style>{FONT_IMPORT}</style>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5 md:px-11">
          <button
            type="button"
            onClick={() => goTo(getSectionPath("home", location.pathname))}
            className={`flex h-12 w-auto max-w-[180px] items-center justify-start overflow-hidden text-[19px] italic md:h-14 ${SERIF}`}
            aria-label="Go to home"
          >
            {logo ? (
              <img src={logo} alt={companyName || "Logo"} className="h-full w-auto object-left object-contain not-italic" />
            ) : (
              companyName || ""
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full md:hidden"
            style={{ border: `1px solid ${BROWN}33` }}
            aria-label="Toggle navigation"
          >
            <span className="flex flex-col gap-1">
              <span className="block h-px w-4" style={{ backgroundColor: BROWN }} />
              <span className="block h-px w-4" style={{ backgroundColor: BROWN }} />
            </span>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map(renderDesktopLink)}
            <button
              type="button"
              onClick={() => window.location.assign("https://hostpanel.wono.co/")}
              className="rounded-full px-5 py-2 text-[13px] font-semibold"
              style={{ border: `1px solid ${RUST}`, color: RUST }}
            >
              Login
            </button>
          </nav>
        </div>

        {mobileOpen ? (
          <div className="px-6 py-3 md:hidden" style={{ borderTop: `1px solid ${BROWN}22` }}>
            <div className="flex flex-col">
              {links.map((item) => {
                const section = resolveSectionFromSlug(item.slug || item.name);
                const isActive = currentSection === section;
                if (section === "products") {
                  return (
                    <div key={`m-${item.slug}`} style={{ borderBottom: `1px solid ${BROWN}15` }}>
                      <div className="flex items-center gap-2 py-3">
                        <button type="button" onClick={() => goTo(getSectionPath("products", location.pathname))} className="flex-1 text-left text-[14px]">
                          {item.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileProductsOpen((prev) => !prev)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ border: `1px solid ${BROWN}33` }}
                          aria-label="Toggle product pages"
                        >
                          <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${mobileProductsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 7.5l5 5 5-5" />
                          </svg>
                        </button>
                      </div>
                      {mobileProductsOpen && normalizedProductPages.length > 0 ? (
                        <div className="flex flex-col gap-1 pb-2" style={{ borderTop: `1px solid ${BROWN}15` }}>
                          {normalizedProductPages.map((product, index) => (
                            <button
                              key={`m-product-${product.slug || index}`}
                              type="button"
                              onClick={() => goTo(getProductPath(product.slug, location.pathname))}
                              className="rounded px-3 py-2 text-left text-sm hover:bg-black/[0.03]"
                              style={{ color: "#5A4A3C" }}
                            >
                              {product.name}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                }
                return (
                  <button
                    key={`m-${item.slug}`}
                    type="button"
                    onClick={() => goTo(item.to)}
                    className="py-3 text-left text-[14px]"
                    style={{ borderBottom: `1px solid ${BROWN}15` }}
                  >
                    {item.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => window.location.assign("https://hostpanel.wono.co/")}
                className="py-3 text-left text-[14px] font-semibold"
                style={{ borderBottom: `1px solid ${BROWN}15`, color: RUST }}
              >
                Login
              </button>
            </div>
          </div>
        ) : null}
      </header>
    );
  },
);

WarmOrganicHeader.displayName = "WarmOrganicHeader";

export default WarmOrganicHeader;
