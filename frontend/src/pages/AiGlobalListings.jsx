import { HiOutlineArrowLeft } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import GlobalListingsMap from "./GlobalListingsMap";
import GlobalListingsList from "./GlobalListingsList"; // Assuming you split list logic
import AiGlobalListingsMap from "./AiGlobalListingsMap";
import AiGlobalListingsList from "./AiGlobalListingsList";

const AiGlobalListings = () => {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const params = new URLSearchParams(search);
  const view = params.get("view");

  // 🪵 Debug logs
  console.log("Current pathname:", pathname);
  console.log("Full search string:", search);
  console.log("All query params:");
  for (let [key, value] of params.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  console.log("Resolved view param:", view === "map");

  const listingsView =
    view === "map" ? <AiGlobalListingsMap /> : <AiGlobalListingsList />;

  console.log(
    view === "map"
      ? "Rendering GlobalListingsMap"
      : "Rendering GlobalListingsList (default)",
  );

  return (
    <div className="pt-4 lg:pt-6">
      <div className="min-w-[75%] max-w-[80rem] lg:max-w-[80rem] mx-0 px-6 sm:px-6 lg:mx-auto lg:px-0">
        <button
          type="button"
          onClick={() => navigate("/search/results")}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-500 text-sky-500"
          aria-label="Go back to search results"
        >
          <HiOutlineArrowLeft size={18} />
        </button>
      </div>

      {listingsView}
    </div>
  );
};

export default AiGlobalListings;
