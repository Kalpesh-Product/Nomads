import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

const AiGlobalListingsMap = lazy(() => import("./AiGlobalListingsMap"));
const AiGlobalListingsList = lazy(() => import("./AiGlobalListingsList"));

const AiGlobalListings = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const view = params.get("view");

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
