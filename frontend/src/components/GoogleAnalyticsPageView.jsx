import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_MEASUREMENT_ID = "G-6F7YK18TQK";

const GoogleAnalyticsPageView = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }

    const pagePath = `${location.pathname}${location.search}${location.hash}`;

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
      send_to: GA_MEASUREMENT_ID,
    });
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default GoogleAnalyticsPageView;
