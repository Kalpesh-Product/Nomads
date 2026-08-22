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
import { AMBER, FONT_IMPORT, HEADING_FONT } from "./EmeraldStudioShared";

// Site-level header for Emerald Studio — mirrors HostPanel's
// EmeraldStudioTemplate header 1:1 visually (dark emerald bar, amber active
// underline, amber-outlined "Login" pill, Fraunces logo wordmark, products
// dropdown), but reads Nomads' shared TempHeader prop shape (logo,
// pageNavItems, navItems, productDropdownPages, productPages) and navigates
// with real react-router paths instead of HostPanel's in-memory section
// state — same approach FreshStudioHeader.jsx / WarmOrganicHeader.jsx used.
// HostPanel's source uses `fixed inset-x-0 top-0` (compensated by a pt-36
// spacer on its hero, since it's an in-app single-page preview); Nomads
// renders the header once at the real site level above a routed <Outlet>,
// so — like Fresh Studio and Warm Organic before it — this uses `sticky
// top-0` instead, which needs no compensating top padding on any page.
// Rendered by TemplateSite.jsx in place of the shared TempHeader whenever
// `themeVariant === "emerald-studio"`.
const EmeraldStudioHeader = forwardRef(
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
              className={`inline-flex items-center gap-1.5 border-b-2 pb-1 text-sm transition-colors duration-150 ${
                isActive || productsOpen ? "border-amber-400 text-amber-400" : "border-transparent text-stone-400"
              }`}
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
              <div className="absolute left-1/2 top-full z-50 mt-3 w-60 -translate-x-1/2 rounded-xl border border-emerald-800/60 bg-emerald-950 p-2 shadow-2xl">
                <button
                  type="button"
                  onClick={() => goTo(getSectionPath("products", location.pathname))}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-stone-300 hover:bg-emerald-900/60 hover:text-stone-100"
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
                      className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-emerald-900/60 ${
                        isSelected ? "font-semibold text-amber-400" : "text-stone-400"
                      }`}
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
          className={`border-b-2 pb-1 text-sm transition-colors duration-150 ${
            isActive ? "border-amber-400 text-amber-400" : "border-transparent text-stone-400 hover:border-amber-400/60 hover:text-stone-100"
          }`}
        >
          {item.name}
        </button>
      );
    };

    return (
      <header ref={ref} className="sticky top-0 z-30 bg-[#002c22]/[0.92] backdrop-blur border-b border-[#006045]/40">
        <style>{FONT_IMPORT}</style>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-6">
          <button
            type="button"
            onClick={() => goTo(getSectionPath("home", location.pathname))}
            className="flex items-center gap-2"
            aria-label="Go to home"
          >
            {logo ? (
              <img src={logo} alt={companyName || "Logo"} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <span className={`w-7 h-7 rounded-sm bg-amber-400 flex items-center justify-center text-emerald-950 font-bold text-sm ${HEADING_FONT}`}>
                  {(companyName || "Y").charAt(0).toUpperCase()}
                </span>
                <span className={`font-semibold text-lg tracking-tight text-stone-100 ${HEADING_FONT}`}>{companyName || "Your Company"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-700 md:hidden"
            aria-label="Toggle navigation"
          >
            <span className="flex flex-col gap-1">
              <span className="block h-px w-4 bg-stone-300" />
              <span className="block h-px w-4 bg-stone-300" />
            </span>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map(renderDesktopLink)}
            <button
              type="button"
              onClick={() => window.location.assign("https://hostpanel.wono.co/")}
              className="text-sm font-semibold text-stone-200 px-4 py-2 rounded border border-[#007a55] hover:border-[#ffb900] hover:text-[#ffb900] transition-colors"
            >
              Login
            </button>
          </nav>
        </div>

        {mobileOpen ? (
          <div className="md:hidden bg-emerald-950 border-t border-emerald-800/40 px-6 py-4 flex flex-col gap-4">
            {links.map((item) => {
              const section = resolveSectionFromSlug(item.slug || item.name);
              const isActive = currentSection === section;
              if (section === "products") {
                return (
                  <div key={`m-${item.slug}`}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => goTo(getSectionPath("products", location.pathname))}
                        className={`flex-1 text-left text-sm font-medium ${isActive ? "text-amber-400" : "text-stone-400"}`}
                      >
                        {item.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileProductsOpen((prev) => !prev)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-700"
                        aria-label="Toggle product pages"
                      >
                        <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${mobileProductsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 7.5l5 5 5-5" />
                        </svg>
                      </button>
                    </div>
                    {mobileProductsOpen && normalizedProductPages.length > 0 ? (
                      <div className="mt-2 flex flex-col gap-1 border-t border-emerald-800/40 pt-2">
                        {normalizedProductPages.map((product, index) => (
                          <button
                            key={`m-product-${product.slug || index}`}
                            type="button"
                            onClick={() => goTo(getProductPath(product.slug, location.pathname))}
                            className="rounded px-2 py-2 text-left text-sm text-stone-400 hover:text-stone-100"
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
                  className={`w-fit border-b-2 pb-1 text-sm font-medium text-left transition-colors duration-150 ${
                    isActive ? "border-amber-400 text-amber-400" : "border-transparent text-stone-400"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => window.location.assign("https://hostpanel.wono.co/")}
              className="text-sm font-semibold text-left text-[#ffb900] py-2"
            >
              Login
            </button>
          </div>
        ) : null}
      </header>
    );
  },
);

EmeraldStudioHeader.displayName = "EmeraldStudioHeader";

export default EmeraldStudioHeader;
