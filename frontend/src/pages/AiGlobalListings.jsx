import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { destroyActiveGuide } from "../utils/driverGuide";

const AiGlobalListingsMap = lazy(() => import("./AiGlobalListingsMap"));
const AiGlobalListingsList = lazy(() => import("./AiGlobalListingsList"));

const AiGlobalListings = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const view = params.get("view");
  const previousViewRef = useRef(view);

  useLayoutEffect(() => {
    if (previousViewRef.current !== view) {
      destroyActiveGuide();
      previousViewRef.current = view;
    }
  }, [view]);

  return (
    // <div className="pt-4 lg:pt-6">
    <div className="">
      <Suspense fallback={null}>
        {view === "map" ? <AiGlobalListingsMap /> : <AiGlobalListingsList />}
      </Suspense>
    </div>
  );
};

export default AiGlobalListings;
