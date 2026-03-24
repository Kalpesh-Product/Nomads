import { Outlet, useLocation } from "react-router-dom";

import Footer from "../components/Footer";
// import { Toaster } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import AiHeader from "../components/AiHeader";
import AiSidebar from "../components/AiSidebar";

const NomadAiLayout = () => {
  const location = useLocation();
  const contentRef = useRef(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const formData = useSelector((state) => state.location.formValues);
  console.log("formData from layout : ", formData);
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ behavior: "smooth", top: "0" });
    }
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className="flex h-screen bg-white">
      <div className="hidden sm:block">
        <AiSidebar />
      </div>

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/35 sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        >
          <AiSidebar
            isMobileOverlay
            onClose={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-50 w-full">
          <AiHeader
            onMobileSidebarToggle={() => setIsMobileSidebarOpen(true)}
          />
        </div>

        <div
          ref={contentRef}
          className="flex-1 overflow-auto custom-scrollbar-hide"
        >
          <div className="px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 min-h-[calc(100vh-100px)]">
            <Outlet />
          </div>
          {/* <Toaster /> */}
          {(location.pathname !== "/verticals" ||
            window.innerWidth >= 1024) && <Footer />}
        </div>
      </div>
    </div>
  );
};

export default NomadAiLayout;
