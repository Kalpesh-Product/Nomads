import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";

const NomadLayout = () => {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/";
  return (
    <div className="flex flex-col gap-4 h-screen overflow-auto custom-scrollbar-hide bg-white">
      <div className="sticky top-0 w-full z-50">
        <Header />
      </div>

      <Outlet />
      <Toaster />
      <Footer />
    </div>
  );
};

export default NomadLayout;
