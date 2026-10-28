import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosPrivate from "./useAxiosPrivate";
import { showErrorAlert } from "../utils/alerts";

export default function useContentFavorites(enabled = true) {
  const { auth } = useAuth();
  const userId = auth?.user?._id || auth?.user?.id;
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const queryKey = ["contentFavorites", userId];
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await axiosPrivate.get("/user/content-favorites");
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: "always",
  });
  const mutation = useMutation({
    mutationKey: queryKey,
    mutationFn: async ({ kind, item, isFavorited }) => {
      await axiosPrivate.patch("/user/content-favorites", {
        kind, contentId: item._id, isFavorited,
      });
    },
    onSuccess: (_, { kind, item, isFavorited }) => {
      queryClient.setQueryData(queryKey, (previous = []) => {
        const others = previous.filter((favorite) =>
          favorite.kind !== kind || favorite.item._id !== item._id,
        );
        return isFavorited ? [...others, { kind, item }] : others;
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => showErrorAlert(
      error?.response?.data?.message || "Failed to update favorites.",
    ),
  });
  return { ...query, favorites: query.data || [], userId, mutation };
}
