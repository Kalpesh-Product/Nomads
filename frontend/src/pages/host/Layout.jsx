import { Outlet, useLocation } from "react-router-dom";
import HostHeader from "../../components/HostHeader";
import HostFooter from "../../components/HostFooter";
import Footer from "../../components/Footer";
import { Toaster } from "react-hot-toast";
import { useEffect, useRef } from "react";

const HostLayout = () => {
  const contentRef = useRef(null);
  const location = useLocation()
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ behavior: "smooth", top: "0" });
    }
  }, [location.pathname]);
  return (
    <div
      ref={contentRef}
      className="flex flex-col h-screen overflow-auto custom-scrollbar-hide bg-white"
    >
      <div className="sticky top-0 w-full z-50">
        <HostHeader />
      </div>

      <div className="">
        <Outlet />
        <Toaster />
      </div>
      <HostFooter />
    </div>
  );
};

export default HostLayout;
