import { useQuery } from "@tanstack/react-query";
import { VERTICAL_TEMPLATE_CATALOG } from "../constants/verticalTemplateCatalog";

const masterPanelBaseUrl = String(
  import.meta.env.DEV
    ? "http://localhost:5007"
    : import.meta.env.VITE_MASTER_PANEL_BE_URL || "https://masterpanel.wono.co",
).replace(/\/+$/, "");

export const useWebsiteThemeCatalog = ({ liveRefresh = false } = {}) => {
  const query = useQuery({
    queryKey: ["public-website-theme-catalog"],
    queryFn: async () => {
      const response = await fetch(`${masterPanelBaseUrl}/api/public/website-themes`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Unable to load the theme catalog");
      const payload = await response.json();
      return Array.isArray(payload?.themes) ? payload.themes : [];
    },
    staleTime: liveRefresh ? 0 : 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: liveRefresh ? "always" : true,
    refetchOnWindowFocus: liveRefresh ? "always" : false,
    refetchInterval: liveRefresh ? 5000 : false,
  });

  return {
    ...query,
    themes: query.data?.length ? query.data : VERTICAL_TEMPLATE_CATALOG,
    isUsingFallback: query.isError || (query.isSuccess && !query.data?.length),
  };
};
