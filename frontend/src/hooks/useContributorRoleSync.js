import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosPrivate from "./useAxiosPrivate";

const roleFields = ["isBlogger", "isNewsWriter", "isEventWriter", "isPlaceWriter"];

export default function useContributorRoleSync() {
  const { auth, setAuth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const userId = auth?.user?._id || auth?.user?.id;
  const { data } = useQuery({
    queryKey: ["contributorRoles", userId],
    enabled: Boolean(userId && auth?.accessToken),
    queryFn: async () => (await axiosPrivate.get("/user/contributor-roles")).data.user,
    refetchInterval: 30000,
    refetchOnWindowFocus: "always",
    retry: false,
  });

  useEffect(() => {
    if (!data) return;
    setAuth((previous) => {
      if (String(previous?.user?._id || previous?.user?.id) !== String(userId)) return previous;
      if (roleFields.every((role) => Boolean(previous.user[role]) === Boolean(data[role]))) return previous;
      return {
        ...previous,
        user: { ...previous.user, ...Object.fromEntries(roleFields.map((role) => [role, data[role] === true])) },
      };
    });
  }, [data, setAuth, userId]);
}
