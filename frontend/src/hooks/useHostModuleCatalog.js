import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/axios";
import {
  hostModuleCategories,
  hydrateHostModuleCatalog,
} from "../data/hostModulesCatalog";

export const useHostModuleCatalog = ({ liveRefresh = false } = {}) => {
  const query = useQuery({
    queryKey: ["public-host-module-catalog"],
    queryFn: async () => {
      const response = await api.get("host-modules");
      return Array.isArray(response.data?.categories)
        ? response.data.categories
        : [];
    },
    staleTime: liveRefresh ? 0 : 60 * 1000,
    retry: 1,
    refetchOnMount: liveRefresh ? "always" : true,
    refetchOnWindowFocus: true,
    refetchInterval: liveRefresh ? 5000 : false,
  });

  const hasRemoteCatalog = Array.isArray(query.data) && query.data.length > 0;

  return {
    ...query,
    categories: hasRemoteCatalog
      ? hydrateHostModuleCatalog(query.data)
      : hostModuleCategories,
    isUsingFallback: query.isError || (query.isSuccess && !hasRemoteCatalog),
  };
};

export default useHostModuleCatalog;
