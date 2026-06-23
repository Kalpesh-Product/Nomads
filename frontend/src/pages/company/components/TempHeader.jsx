import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import { IoCloseSharp } from "react-icons/io5";
import { FiChevronDown, FiMenu } from "react-icons/fi";
import {
  getProductPath,
  getSectionPath,
  getTemplateRouteContext,
  normalizePageNavItems,
  normalizeProductDropdownPages,
  resolveSectionFromSlug,
} from "../utils/templateRouteUtils";

const TempHeader = forwardRef(
  (
    {
      logo,
      pageNavItems = [],
      navItems = [],
      productDropdownPages = [],
      productPages = [],
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const routeContext = useMemo(
      () => getTemplateRouteContext(location.pathname),
      [location.pathname],
    );

    const headerLinks = useMemo(
      () => {
        const orderedSlugs = [
          "home",
          "about",
          "products",
          "gallery",
          "testimonials",
          "contact",
        ];
        const normalizedItems = normalizePageNavItems(pageNavItems, navItems);

        return orderedSlugs
          .map((slug) =>
            normalizedItems.find((item) => resolveSectionFromSlug(item.slug) === slug),
          )
          .filter(Boolean)
          .map((item, index) => ({
            ...item,
            id: index + 1,
            text: item.name,
            to: getSectionPath(item.slug, location.pathname),
          }));
      },
      [location.pathname, navItems, pageNavItems],
    );

    const normalizedProductPages = useMemo(
      () =>
        normalizeProductDropdownPages(
          productDropdownPages.length > 0 ? productDropdownPages : productPages,
        ),
      [productDropdownPages, productPages],
    );

    const currentSection = routeContext.currentSection;
    const currentProductSlug = routeContext.currentProductSlug;

    useEffect(() => {
      setProductsOpen(false);
      setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
      if (!productsOpen) return undefined;

      const handlePointerDown = (event) => {
        const headerElement = ref && typeof ref === "object" ? ref.current : null;
        if (headerElement && !headerElement.contains(event.target)) {
          setProductsOpen(false);
        }
      };

      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);

      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("touchstart", handlePointerDown);
      };
    }, [productsOpen, ref]);

    const handleNavigate = (path) => {
      navigate(path);
      setProductsOpen(false);
      setOpen(false);
    };

    const navButtonClass = (isActive) =>
      [
        "whitespace-nowrap border-b-2 px-2 pb-1 text-[13px] transition md:text-[14px]",
        isActive
          ? "border-[#3b82f6] font-semibold text-[#111]"
          : "border-transparent font-medium text-[#222] hover:border-[#3b82f6] hover:text-[#000]",
      ].join(" ");

    const renderDesktopLink = (item) => {
      const section = resolveSectionFromSlug(item.slug || item.name);
      const isActive = currentSection === section;

      if (section === "products") {
        return (
          <li key={item.id || item.slug || item.name} className="relative">
            <button
              type="button"
              onClick={() => setProductsOpen((prev) => !prev)}
              className={navButtonClass(
                currentSection === "products" || productsOpen,
              )}
              aria-expanded={productsOpen}
            >
              <span className="inline-flex items-center gap-1">
                <span>Products</span>
                <FiChevronDown className="mt-[1px]" size={14} />
              </span>
            </button>

            {productsOpen ? (
              <div className="absolute left-1/2 top-9 z-30 min-w-56 -translate-x-1/2 rounded-md border border-slate-200 bg-white py-2 shadow-lg">
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate(getSectionPath("products", location.pathname))
                  }
                  className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 ${
                    currentSection === "products" && !currentProductSlug
                      ? "font-semibold text-black"
                      : ""
                  }`}
                >
                  All Products
                </button>

                {normalizedProductPages.map((product, index) => {
                  const isActiveProduct = currentProductSlug === product.slug;

                  return (
                    <button
                      key={product.slug || index}
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          getProductPath(product.slug, location.pathname),
                        )
                      }
                      className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 ${
                        isActiveProduct ? "font-semibold text-black" : ""
                      }`}
                    >
                      {product.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </li>
        );
      }

      return (
        <li key={item.id || item.slug || item.name}>
          <button
            type="button"
            onClick={() => handleNavigate(item.to)}
            className={navButtonClass(isActive)}
          >
            {item.text}
          </button>
        </li>
      );
    };

    return (
      <header
        ref={ref}
        className="sticky top-0 z-30 border-b border-slate-300 bg-[#ffffff] shadow-sm"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-4 px-4 py-3 md:px-0 md:py-3">
          <button
            type="button"
            onClick={() => handleNavigate(getSectionPath("home", location.pathname))}
            className="flex h-16 w-24 items-center justify-end overflow-hidden lg:w-36"
            aria-label="Go to home"
          >
            <img src={logo} alt="logo" className="h-full w-full object-contain" />
          </button>

          <nav className="ml-auto hidden items-center gap-6 xl:flex">
            <ul className="flex items-center gap-6">
              {headerLinks.map(renderDesktopLink)}
              <li>
                <button
                  type="button"
                  onClick={() => window.location.href = "https://wonofe.vercel.app/"}
                  className={navButtonClass(false)}
                >
                  Login
                </button>
              </li>
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg text-black xl:hidden"
            aria-label="Open navigation menu"
          >
            <FiMenu size={20} />
          </button>
        </div>

        <Drawer
          sx={{
            "& .MuiDrawer-paper": {
              width: {
                xs: "85%",
                sm: "400px",
              },
            },
          }}
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
        >
          <div className="flex h-full flex-col justify-between">
            <ul className="flex flex-col gap-4 p-4">
              <div className="flex w-full justify-end text-right">
                <button
                  type="button"
                  className="cursor-pointer text-title"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <IoCloseSharp />
                </button>
              </div>

              {headerLinks.map((item) => {
                const section = resolveSectionFromSlug(item.slug || item.text);
                const isActive = currentSection === section;

                if (section === "products") {
                  return (
                    <li key={item.id || item.slug || item.text} className="items-center py-2 text-center">
                      <button
                        type="button"
                        onClick={() => setProductsOpen((prev) => !prev)}
                        className={`text-lg ${
                          currentSection === "products" || productsOpen
                            ? "font-semibold text-black"
                            : "text-secondary-dark"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <span>Products</span>
                          <FiChevronDown size={14} />
                        </span>
                      </button>

                      {productsOpen
                        ? normalizedProductPages.map((product, index) => {
                            const isActiveProduct = currentProductSlug === product.slug;

                            return (
                              <li key={product.slug || index} className="items-center text-center">
                                <div
                                  onClick={() =>
                                    handleNavigate(
                                      getProductPath(product.slug, location.pathname),
                                    )
                                  }
                                  className="cursor-pointer py-3"
                                >
                                  <p
                                    className={`${
                                      isActiveProduct
                                        ? "font-semibold text-black"
                                        : "text-secondary-dark"
                                    }`}
                                  >
                                    {product.name}
                                  </p>
                                </div>
                                <div className="h-[0.2px] bg-gray-300" />
                              </li>
                            );
                          })
                        : null}
                    </li>
                  );
                }

                return (
                  <li key={item.id || item.slug || item.text} className="items-center text-center">
                    <div onClick={() => handleNavigate(item.to)} className="cursor-pointer py-4">
                      <p className={`text-lg ${isActive ? "font-semibold text-black" : "text-secondary-dark"}`}>
                        {item.text}
                      </p>
                    </div>
                    <div className="h-[0.2px] bg-gray-300" />
                  </li>
                );
              })}

              <li className="items-center py-2 text-center">
                <button
                  type="button"
                  onClick={() => handleNavigate("/login")}
                  className="text-lg text-secondary-dark"
                >
                  Login
                </button>
              </li>
            </ul>

            <div className="flex w-full flex-col items-center gap-4 py-4 text-center">
              <div className="flex w-full flex-col gap-2 text-small md:text-small">
                <hr />
                <span>
                  &copy; Copyright {new Date().getFullYear()} -{" "}
                  {(new Date().getFullYear() + 1).toString().slice(-2)}
                </span>
                <span>WoNo. All rights reserved</span>
              </div>
            </div>
          </div>
        </Drawer>
      </header>
    );
  },
);

TempHeader.displayName = "TempHeader";

export default TempHeader;
