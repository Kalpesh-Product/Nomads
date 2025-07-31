import React, { useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";

const App = () => {
  const location = useLocation();
  const contentRef = useRef(null);

  // Only hide header and footer on these routes
  const hideHeaderFooter = location.pathname === "/";

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen justify-between">
      {!hideHeaderFooter && (
        <div className="fixed w-full z-50">
          <div className="md:block">
            <Header />
          </div>
        </div>
      )}

      <div
        ref={contentRef}
        className={`${
          hideHeaderFooter
            ? ""
            : "pt-16 pb-16 px-0 xs:pt-16 xs:pb-20 md:pt-20 md:pb-40 lg:pt-36 lg:pb-0 md:px-0 lg:px-0 sm:px-4"
        } flex flex-col gap-4 bg-white`}>
        <Outlet />
        <Toaster />
      </div>

      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

export default App;
