import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const App = () => {
  const location = useLocation();
  const contentRef = useRef(null);

  // Only hide header and footer on these routes
  const hideHeaderFooter = location.pathname === "/";
  const isNomad = location.pathname.includes("/nomad");
  const isHost = location.pathname.includes("/hosts");

  return (
    <div className="flex flex-col h-screen overflow-auto justify-between relative bg-white custom-scrollbar-hide">
      <div
        // ref={contentRef}
        className={`${
          hideHeaderFooter ? "" : " "
        } flex flex-col gap-4 bg-white`}>
        <Outlet />
        <Toaster />
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default App;
