import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Container from "../components/Container";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import ListingCard from "../components/ListingCard";

const Reviews = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  const userId = auth?.user?._id || auth?.user?.id;

  const {
    data: reviews = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userReviews", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axiosPrivate.get("/review/reviews");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });

  const reviewedListings = reviews.reduce((acc, review) => {
    const company = review?.company;

    if (!company?._id || acc.some((item) => item._id === company._id)) {
      return acc;
    }

    acc.push(company);
    return acc;
  }, []);

  if (isError) {
    return (
      <Container padding={false}>
        <div className="py-8 min-h-screen text-center text-red-500">
          {error?.response?.data?.message || "Failed to load your reviews."}
        </div>
      </Container>
    );
  }

  return (
    <Container padding={false}>
      <div className="p-6 min-h-screen bg-white rounded-xl ">
        <h1 className="text-xl font-semibold mb-6 text-secondary-dark">
          My Reviews
        </h1>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : reviewedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {reviewedListings.map((item) => (
              <ListingCard
                key={item._id}
                item={item}
                showVertical={true}
                handleNavigation={() =>
                  navigate(
                    `/listings/${encodeURIComponent(item.companyName)}`,
                    {
                      state: {
                        companyId: item.companyId,
                        type: item.companyType,
                      },
                    },
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 border border-dotted rounded-lg p-6">
            You haven’t reviewed any listings yet.
          </div>
        )}
      </div>
    </Container>
  );
};

export default Reviews;
