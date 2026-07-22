import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AiFillHeart } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import Container from "../components/Container";
import ListingCard from "../components/ListingCard";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { showErrorAlert } from "../utils/alerts";

const INITIAL_PREVIEW_COUNT = 4;

const Favorites = ({
  showDestinationFavorites = false,
  useAiListingsRoute = false,
  showRemoveFavoriteIcons = false,
}) => {
  const { auth } = useAuth();
  const userId = auth?.user?._id || auth?.user?.id;
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [showAllListings, setShowAllListings] = useState(false);
  const [showAllDestinations, setShowAllDestinations] = useState(false);

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
    staleTime: 1000 * 60 * 2,
    refetchOnMount: "always",
  });

  const {
    data: favoriteDestinations = [],
    isLoading: isDestinationLoading,
    isError: isDestinationError,
    error: destinationError,
    refetch: refetchDestinations,
  } = useQuery({
    queryKey: ["favoriteDestinations", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axiosPrivate.get(`/user/favorite-destination/${userId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!userId && showDestinationFavorites,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: "always",
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (showDestinationFavorites) {
      refetchDestinations();
    }
  }, [refetchDestinations, showDestinationFavorites]);

  const confirmRemoveDestination = async (destinationId) => {
    const result = await Swal.fire({
      title: "Remove from favorites?",
      text: "Are you sure you want to delete this favorite destination?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#111827",
    });

    if (result.isConfirmed) {
      toggleFavoriteDestination({
        destinationId,
        isFavorited: false,
      });
    }
  };

  const { mutate: toggleFavoriteDestination } = useMutation({
    mutationFn: async ({ destinationId, isFavorited }) => {
      const response = await axiosPrivate.patch("/user/favorite-destination", {
        destinationId,
        isFavorited,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        ["favoriteDestinations", userId],
        (previous = []) => {
          if (!Array.isArray(previous)) {
            return previous;
          }

          return variables.isFavorited
            ? previous
            : previous.filter(
                (destination) => destination?._id !== variables.destinationId,
              );
        },
      );
      refetchDestinations();
    },
    onError: (error) => {
      showErrorAlert(
        error?.response?.data?.message ||
          "Failed to update favorite destination.",
      );
    },
  });

  const favoriteDestinationCards = useMemo(
    () =>
      favoriteDestinations.map((destination) => {
        const imageFromMap =
          destination?.images && typeof destination.images === "object"
            ? Object.values(destination.images)
                .map((image) =>
                  typeof image === "string"
                    ? image
                    : image?.url || image?.imageUrl,
                )
                .filter(Boolean)
            : [];
        const imageUrls = Array.isArray(destination?.imageUrls)
          ? destination.imageUrls.filter(Boolean)
          : [];
        const directImageUrl =
          typeof destination?.imageUrl === "string" &&
          destination.imageUrl.trim()
            ? destination.imageUrl.trim()
            : "";
        const availableImages = imageFromMap.length ? imageFromMap : imageUrls;
        const destinationImage = availableImages.length
          ? availableImages[Math.floor(Math.random() * availableImages.length)]
          : directImageUrl;

        return {
          ...destination,
          destinationImage,
        };
      }),
    [favoriteDestinations],
  );

  const visibleListings = showAllListings
    ? likedListings
    : likedListings.slice(0, INITIAL_PREVIEW_COUNT);
  const visibleDestinations = showAllDestinations
    ? favoriteDestinationCards
    : favoriteDestinationCards.slice(0, INITIAL_PREVIEW_COUNT);

  if (isError) {
    return (
      <Container padding={false}>
        <div className="min-h-screen py-8 text-center text-red-500">
          {error?.response?.data?.message || "Failed to load favorites."}
        </div>
      </Container>
    );
  }

  if (isDestinationError) {
    return (
      <Container padding={false}>
        <div className="min-h-screen py-8 text-center text-red-500">
          {destinationError?.response?.data?.message ||
            "Failed to load favorite destinations."}
        </div>
      </Container>
    );
  }

  return (
    <Container padding={false}>
      <div className="min-h-screen rounded-xl bg-white p-6">
      

        {showDestinationFavorites && (
          <>
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-secondary-dark">
                <span>Favorite Destinations</span>
                    <AiFillHeart className="text-[#ff5757]" size={24} />
              </h2>

              {isDestinationLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : visibleDestinations.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleDestinations.map((destination) => {
                    return (
                      <article
                        key={destination._id}
                        className="overflow-hidden rounded-2xl bg-white text-left transition-all hover:-translate-y-1"
                        onClick={() =>
                          navigate(
                            `/verticals?country=${encodeURIComponent(
                              (destination.country || "").toLowerCase(),
                            )}&state=${encodeURIComponent(
                              (destination.state || "").toLowerCase(),
                            )}`,
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            navigate(
                              `/verticals?country=${encodeURIComponent(
                                (destination.country || "").toLowerCase(),
                              )}&state=${encodeURIComponent(
                                (destination.state || "").toLowerCase(),
                              )}`,
                            );
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-2xl">
                          <img
                            src={
                              destination.destinationImage ||
                              "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp"
                            }
                            alt={`${destination.state}, ${destination.country}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          <button
                            type="button"
                            className="absolute right-3 top-3 z-20 cursor-pointer"
                            aria-label="Remove from favorites"
                            onClick={(event) => {
                              event.stopPropagation();
                              event.preventDefault();
                              confirmRemoveDestination(destination._id);
                            }}
                          >
                            {showRemoveFavoriteIcons ? (
                              <IoClose
                                className="rounded-full bg-white p-1 text-black"
                                size={28}
                              />
                            ) : (
                              <AiFillHeart
                                className="text-[#ff5757]"
                                size={22}
                              />
                            )}
                          </button>
                          <div className="pointer-events-none absolute inset-x-4 bottom-4 text-white">
                            <p className="text-lg font-semibold uppercase tracking-wide">
                              {destination.state || "Unknown"}
                            </p>
                            <p className="text-sm font-medium text-white/85">
                              {destination.country || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dotted p-6 text-center text-gray-500">
                  You haven't liked any destinations yet.
                </div>
              )}

              {favoriteDestinationCards.length > INITIAL_PREVIEW_COUNT && (
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="text-sm font-semibold text-black"
                    onClick={() =>
                      setShowAllDestinations((previous) => !previous)
                    }
                  >
                    {showAllDestinations ? "Show less" : "View more →"}
                  </button>
                </div>
              )}
            </div>

            <hr className="my-10 border-gray-200" />
          </>
        )}

        <div>
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-secondary-dark">
            <span>Favorite Listings</span>
            <AiFillHeart className="text-[#ff5757]" size={24} />
          </h2>

          {isLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : visibleListings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {visibleListings.map((item) => (
                <ListingCard
                  key={item._id}
                  item={{ ...item, isLiked: true }}
                  showVertical
                  showRemoveFavoriteIcon={showRemoveFavoriteIcons}
                  handleNavigation={() =>
                    navigate(
                      `${
                        useAiListingsRoute ? "/listings" : "/listings"
                      }/${encodeURIComponent(item.companyName)}`,
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
            <div className="rounded-lg border border-dotted p-6 text-center text-gray-500">
              You haven't liked any listings yet.
            </div>
          )}

          {likedListings.length > INITIAL_PREVIEW_COUNT && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="text-sm font-semibold text-black"
                onClick={() => setShowAllListings((previous) => !previous)}
              >
                {showAllListings ? "Show less" : "View more →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Favorites;
