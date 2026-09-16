import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "./useAxiosPrivate";
import useAuth from "./useAuth";

// Shares its query key with MyVerification.jsx's own fetch, so whichever of
// the two mounts first (this hook in the header/sidebar, or the page itself)
// serves the other from cache instead of firing a second request.
export default function useHasVerificationRequest() {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const userId = auth?.user?._id || auth?.user?.id;

  const { data: requests = [] } = useQuery({
    queryKey: ["my-verification-requests"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/verification/my-requests");
      return response.data?.data || [];
    },
    enabled: !!userId,
  });

  return requests.length > 0;
}
