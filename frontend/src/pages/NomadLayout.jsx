import { Outlet, useLocation } from "react-router-dom";
import HostHeader from "../components/HostHeader";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NomadLayout = () => {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/";
  return (
    <div className="flex flex-col gap-4 h-screen overflow-auto custom-scrollbar-hide bg-white">
      <div className="sticky top-0 w-full z-50">
        <Header />
      </div>

      <Outlet />

      <Footer />
    </div>
  );
};

export default NomadLayout;
