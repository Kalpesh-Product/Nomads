import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const NomadLayout = () => {
  const location = useLocation();
  const contentRef = useRef(null);
  const hideHeaderFooter = location.pathname === "/";
   const formData = useSelector((state) => state.location.formValues);
   console.log('formData from layout : ', formData)
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ behavior: "smooth", top: "0" });
    }
  }, [location.pathname]);
  return (
    <div ref={contentRef} className="flex flex-col gap-4 h-screen overflow-auto custom-scrollbar-hide bg-white">
      <div className="sticky top-0 w-full z-50">
        <Header />
      </div>
      <div >
        <Outlet />
        <Toaster />
      </div>
      <Footer />
    </div>
  );
};

export default NomadLayout;
