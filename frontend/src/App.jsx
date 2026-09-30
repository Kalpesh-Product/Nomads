import { useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  destroyActiveGuide,
  installGuideNavigationCleanup,
} from "./utils/driverGuide";

const App = () => {
  const location = useLocation();
  const previousRouteRef = useRef(`${location.pathname}${location.search}`);

  // ✅ Disable right-click globally (across all routes)
  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    window.addEventListener("contextmenu", disableContextMenu);
    return () => window.removeEventListener("contextmenu", disableContextMenu);
  }, []);

  useEffect(() => installGuideNavigationCleanup(), []);

  useLayoutEffect(() => {
    const currentRoute = `${location.pathname}${location.search}`;

    if (previousRouteRef.current !== currentRoute) {
      destroyActiveGuide();
      previousRouteRef.current = currentRoute;
    }

    return () => {
      destroyActiveGuide();
    };
  }, [location.pathname, location.search]);

  // Only hide header and footer on these routes
  const hideHeaderFooter = location.pathname === "/";

  return (
    <div className="flex flex-col h-screen overflow-auto justify-between relative bg-white custom-scrollbar-hide">
      <div
        // ref={contentRef}
        className={`${
          hideHeaderFooter ? "" : " "
        } flex flex-col gap-4 bg-white`}
      >
        <Outlet />
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default App;
