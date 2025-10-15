import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import ListingCard from "../components/ListingCard";
import Container from "../components/Container";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const { auth } = useAuth();
  const userId = auth?.user?._id;
  const navigate = useNavigate();

  const { data: likedListings = [], isLoading } = useQuery({
    queryKey: ["userLikes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axiosInstance.get(`/user/likes/${userId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!userId,
  });

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
