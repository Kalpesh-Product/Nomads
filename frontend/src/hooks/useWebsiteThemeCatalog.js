import { useQuery } from "@tanstack/react-query";
import { VERTICAL_TEMPLATE_CATALOG } from "../constants/verticalTemplateCatalog";

const masterPanelBaseUrl = String(
  import.meta.env.DEV
    ? "http://localhost:5007"
    : import.meta.env.VITE_MASTER_PANEL_BE_URL || "https://masterpanel.wono.co",
).replace(/\/+$/, "");

export const useWebsiteThemeCatalog = () => {
  const query = useQuery({
    queryKey: ["public-website-theme-catalog"],
    queryFn: async () => {
      const response = await fetch(`${masterPanelBaseUrl}/api/public/website-themes`);
      if (!response.ok) throw new Error("Unable to load the theme catalog");
      const payload = await response.json();
      return Array.isArray(payload?.themes) ? payload.themes : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    themes: query.data?.length ? query.data : VERTICAL_TEMPLATE_CATALOG,
    isUsingFallback: query.isError || (query.isSuccess && !query.data?.length),
  };
};
