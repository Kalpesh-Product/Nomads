import { api } from "./axios";

const COMPANY_LOCATIONS_STORAGE_KEY = "wono-classic-search-locations";

const readStoredLocations = () => {
  if (typeof window === "undefined") return null;

  try {
    const storedValue = window.localStorage.getItem(
      COMPANY_LOCATIONS_STORAGE_KEY,
    );
    if (!storedValue) return null;

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue?.data) ? parsedValue : null;
  } catch {
    return null;
  }
};

const storedLocations = readStoredLocations();

export const companyLocationsQueryOptions = {
  queryKey: ["classic-search-company-locations"],
  queryFn: async () => {
    const response = await api.get("company/company-locations");
    const locations = Array.isArray(response.data) ? response.data : [];

    if (typeof window !== "undefined" && locations.length) {
      try {
        window.localStorage.setItem(
          COMPANY_LOCATIONS_STORAGE_KEY,
          JSON.stringify({ data: locations, updatedAt: Date.now() }),
        );
      } catch {
        // The in-memory query cache still keeps the dropdowns fast.
      }
    }

    return locations;
  },
  initialData: storedLocations?.data,
  initialDataUpdatedAt: storedLocations?.updatedAt,
  staleTime: 30 * 60 * 1000,
  gcTime: 2 * 60 * 60 * 1000,
  refetchOnWindowFocus: false,
};