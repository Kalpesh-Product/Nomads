import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useRefresh from "../hooks/useRefresh";
import useAuth from "../hooks/useAuth";
import Loading from "../pages/Loading";
import GoogleAnalyticsPageView from "../components/GoogleAnalyticsPageView";

const PUBLIC_PATHS = new Set([
  "/",
  "/home-logged-in",
  "/login",
  "/signup",
  "/forgot-password",
  "/forgot-password/verify",
  "/forgot-password/reset",
  "/about",
  "/privacy",
  "/contact",
  "/career",
  "/faq",
  "/terms-and-conditions",
  "/content-and-copyright",
  "/content-use-removal",
  "/site-is-down",
  "/website-under-maintenance",
]);

const PUBLIC_PREFIXES = [
  "/login/",
  "/reset-password/",
  "/career/job/",
  "/blog",
  "/news",
  "/events/",
  "/places/",
  "/restaurants/",
  "/listings",
  "/manual-search",
  "/search",
  "/world-rankings",
  "/savings",
  "/career-search",
  "/compatible",
  "/verticals",
  "/visa-support",
  "/overall-activation-support",
  "/new-company-setup",
  "/consultation",
  "/workation",
  "/become-a-contributor",
];

const isPublicPath = (pathname) =>
  PUBLIC_PATHS.has(pathname) ||
  PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export default function PersistLogin() {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefresh();
  const { auth } = useAuth();
  const { pathname } = useLocation();
  const shouldBlockForRefresh = !isPublicPath(pathname);

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        if (!auth?.accessToken) {
          await refresh();
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (shouldBlockForRefresh) {
      verifyRefreshToken();
      return;
    }

    setIsLoading(false);
    if (!auth?.accessToken) {
      refresh();
    }
  }, [auth?.accessToken, refresh, shouldBlockForRefresh]);

  return (
    <>
      <GoogleAnalyticsPageView />
      {shouldBlockForRefresh && isLoading ? <Loading /> : <Outlet />}
    </>
  );
}
