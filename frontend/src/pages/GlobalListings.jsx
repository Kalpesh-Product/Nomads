import { useLocation } from "react-router-dom";
import GlobalListingsMap from "./GlobalListingsMap";
import GlobalListingsList from "./GlobalListingsList"; // Assuming you split list logic

const GlobalListings = () => {
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

  if (view === "map") {
    console.log("Rendering GlobalListingsMap");
    return <GlobalListingsMap />;
  }

  console.log("Rendering GlobalListingsList (default)");
  return <GlobalListingsList />;
};

export default GlobalListings;
