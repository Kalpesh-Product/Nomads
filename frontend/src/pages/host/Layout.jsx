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
      className="flex flex-col gap-4 h-screen overflow-auto custom-scrollbar-hide"
    >
      <div className="sticky top-0 w-full z-50">
        <HostHeader />
      </div>

      <div className="bg-white">
        <Outlet />
        <Toaster />
      </div>
      <HostFooter />
    </div>
  );
};

export default HostLayout;
