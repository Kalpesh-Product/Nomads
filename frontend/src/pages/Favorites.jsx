import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import ListingCard from "../components/ListingCard";
import Container from "../components/Container";
import useAuth from "../hooks/useAuth";
import { AiFillHeart } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const { auth } = useAuth();
  const userId = auth?.user?._id || auth?.user?.id;
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate(); // ✅ consistent with Profile.jsx

  const {
    data: likedListings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userLikes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axiosPrivate.get(`/user/likes/${userId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 min cache (optional for performance)
    refetchOnMount: "always", // ✅ forces refetch on every mount
  });

  useEffect(() => {
    refetch(); // ✅ refresh favorites whenever this component mounts
  }, [refetch]);

  if (isError) {
    return (
      <Container padding={false}>
        <div className="py-8 min-h-screen text-center text-red-500">
          {error?.response?.data?.message || "Failed to load favorites."}
        </div>
      </Container>
    );
  }

  return (
    <Container padding={false}>
      <div className="p-6 min-h-screen bg-white rounded-xl ">
        <h1 className="text-xl font-semibold mb-6 text-secondary-dark">
          {/* My Favorites ❤️ */}
          <span className="flex gap-2">
            <span>My Favorites </span>
            <span>
              <AiFillHeart className="text-[#ff5757]" size={24} />
            </span>
          </span>
        </h1>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : likedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {likedListings.map((item) => (
              <ListingCard
                key={item._id}
                item={{ ...item, isLiked: true }} // ✅ mark as liked
                showVertical={true}
                handleNavigation={() =>
                  navigate(
                    `/listings/${encodeURIComponent(item.companyName)}`,
                    {
                      state: {
                        companyId: item.companyId,
                        type: item.companyType,
                      },
                    }
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 border border-dotted rounded-lg p-6">
            You haven’t liked any listings yet.
          </div>
        )}
      </div>
    </Container>
  );
};

export default Favorites;
