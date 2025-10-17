import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import ListingCard from "../components/ListingCard";
import Container from "../components/Container";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const { auth } = useAuth();
  const userId = auth?.user?._id;
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate(); // ✅ consistent with Profile.jsx

  const {
    data: likedListings = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userLikes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axiosPrivate.get(`/user/likes/${userId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 min cache (optional for performance)
  });

  if (isError) {
    return (
      <Container>
        <div className="py-8 min-h-screen text-center text-red-500">
          {error?.response?.data?.message || "Failed to load favorites."}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8 min-h-screen">
        <h1 className="text-xl font-semibold mb-6 text-secondary-dark">
          My Favorites ❤️
        </h1>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : likedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {likedListings.map((item) => (
              <ListingCard
                key={item._id}
                item={item}
                showVertical={false}
                handleNavigation={() =>
                  navigate(`/listings/${item.companyName}`, {
                    state: {
                      companyId: item.companyId,
                      type: item.companyType,
                    },
                  })
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
