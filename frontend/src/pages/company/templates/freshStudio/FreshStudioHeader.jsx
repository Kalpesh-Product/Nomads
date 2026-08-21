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
import { ACCENT, FONT_IMPORT, focusStyle } from "./FreshStudioShared";

// Site-level header for Fresh Studio — mirrors HostPanel's FreshStudioTemplate
// header 1:1 visually (dark sticky bar, red active underline, pill "Login"
// button, product dropdown), but reads Nomads' shared TempHeader prop shape
// (logo, pageNavItems, navItems, productDropdownPages, productPages) and
// navigates with real react-router paths instead of HostPanel's in-memory
// section state. Rendered by TemplateSite.jsx in place of the shared
// TempHeader whenever `themeVariant === "fresh-studio"` — Fresh Studio's
// dark/red chrome can't be expressed by TempHeader's light/blue styling, so
// unlike Classic (and unlike the other 8 ported section files), the header
// is a genuine site-level swap rather than a per-route registry entry.
const FreshStudioHeader = forwardRef(
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
              className="inline-flex items-center gap-1.5 border-b-2 pb-1 text-[14px] font-medium transition duration-150"
              style={
                isActive || productsOpen
                  ? { color: ACCENT, borderColor: ACCENT }
                  : { color: "rgba(255,255,255,0.72)", borderColor: "transparent" }
              }
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
              <div className="absolute left-1/2 top-full z-50 mt-3 w-60 -translate-x-1/2 rounded-xl border border-white/10 bg-[#11111a] p-2 shadow-2xl">
                <button
                  type="button"
                  onClick={() => goTo(getSectionPath("products", location.pathname))}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-white/70 hover:bg-white/[0.07] hover:text-white"
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
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm"
                      style={isSelected ? { color: ACCENT, borderColor: ACCENT } : { color: "rgba(255,255,255,0.7)" }}
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
          className="border-b-2 pb-1 text-[14px] font-medium transition duration-150 focus-visible:outline focus-visible:outline-2"
          style={{ color: isActive ? ACCENT : "rgba(255,255,255,0.72)", borderColor: isActive ? ACCENT : "transparent", ...focusStyle }}
        >
          {item.name}
        </button>
      );
    };

    return (
      <header
        ref={ref}
        className="sticky top-0 z-30"
        style={{ backgroundColor: "rgba(10,10,18,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.10)" }}
      >
        <style>{FONT_IMPORT}</style>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
          <button
            type="button"
            onClick={() => goTo(getSectionPath("home", location.pathname))}
            className="flex h-12 w-auto max-w-[180px] items-center justify-start overflow-hidden md:h-14 focus-visible:outline focus-visible:outline-2"
            style={focusStyle}
            aria-label="Go to home"
          >
            {logo ? (
              <img src={logo} alt={companyName || "Logo"} className="h-full w-auto object-left object-contain" />
            ) : (
              <span className="text-[15px] font-bold text-white font-['Manrope',ui-sans-serif,system-ui,sans-serif]">{companyName}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] md:hidden focus-visible:outline focus-visible:outline-2"
            style={{ border: "1px solid rgba(255,255,255,0.18)", ...focusStyle }}
            aria-label="Toggle navigation"
          >
            <span className="flex flex-col gap-1">
              <span className="block h-px w-4 bg-white" />
              <span className="block h-px w-4 bg-white" />
            </span>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map(renderDesktopLink)}
            <button
              type="button"
              onClick={() => window.location.assign("https://hostpanel.wono.co/")}
              className="rounded-full border border-white/22 px-5 py-2 text-[13px] font-semibold text-white transition hover:border-[#D94B4B] hover:text-[#D94B4B] focus-visible:outline focus-visible:outline-2"
              style={focusStyle}
            >
              Login
            </button>
          </nav>
        </div>

        {mobileOpen ? (
          <div className="mx-auto w-full max-w-7xl px-6 py-3 md:hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            <div className="flex flex-col">
              {links.map((item) => {
                const section = resolveSectionFromSlug(item.slug || item.name);
                const isActive = currentSection === section;
                if (section === "products") {
                  return (
                    <div key={`m-${item.slug}`} className="border-b border-white/[0.08]">
                      <div className="flex items-center gap-2 py-3">
                        <button type="button" onClick={() => goTo(getSectionPath("products", location.pathname))} className="flex-1 text-left text-[14px] font-medium text-white/80">
                          {item.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileProductsOpen((prev) => !prev)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20"
                          aria-label="Toggle product pages"
                        >
                          <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${mobileProductsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 7.5l5 5 5-5" />
                          </svg>
                        </button>
                      </div>
                      {mobileProductsOpen && normalizedProductPages.length > 0 ? (
                        <div className="flex flex-col gap-1 border-t border-white/[0.08] bg-white/[0.03] p-2">
                          {normalizedProductPages.map((product, index) => (
                            <button
                              key={`m-product-${product.slug || index}`}
                              type="button"
                              onClick={() => goTo(getProductPath(product.slug, location.pathname))}
                              className="rounded px-3 py-2 text-left text-sm text-white/70 hover:bg-white/[0.07] hover:text-white"
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
                    className="py-3 text-left text-[14px] font-medium"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: isActive ? ACCENT : "rgba(255,255,255,0.72)" }}
                  >
                    {item.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => window.location.assign("https://hostpanel.wono.co/")}
                className="py-3 text-left text-[14px] font-semibold"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: ACCENT }}
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

FreshStudioHeader.displayName = "FreshStudioHeader";

export default FreshStudioHeader;
