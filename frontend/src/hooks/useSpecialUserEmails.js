import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axios.js";

// Emails that can view all countries/states/listings, even when isPublic is
// false. Managed dynamically from the Wono Master Panel's User Access module
// instead of being hardcoded here.
const useSpecialUserEmails = () => {
  const { data: specialUserEmails = [] } = useQuery({
    queryKey: ["special-access-emails"],
    queryFn: async () => {
      try {
        const response = await axios.get("special-access");
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error(error?.response?.data?.message);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return specialUserEmails;
};

export default useSpecialUserEmails;
