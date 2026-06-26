import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window to top (for pages that use window scroll)
    window.scrollTo(0, 0);
    
    // Also scroll all scrollable containers to top
    const scrollableContainers = document.querySelectorAll('[class*="overflow-y-auto"]');
    scrollableContainers.forEach((container) => {
      container.scrollTop = 0;
    });
    
    // Scroll document body and html to top as fallback
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [pathname]);

  return null;
}
