import { MenuItem, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CiSearch } from "react-icons/ci";
import { AiFillStar } from "react-icons/ai";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import Container from "../components/Container";
import { useNavigate } from "react-router-dom";
import Map from "../components/Map";
import { useSelector } from "react-redux";
import axios from "../utils/axios.js";
import renderStars from "../utils/renderStarts.jsx";
import SkeletonCard from "../components/Skeletons/SkeletonCard.jsx";
import SkeletonMap from "../components/Skeletons/SkeletonMap.jsx";

const Listings = () => {
  const [favorites, setFavorites] = useState([]);
  const formData = useSelector((state) => state.location.formValues);
  console.log("formData", formData);
  const { data: listingsData, isPending: isLisitingLoading } = useQuery({
    queryKey: ["listings", formData], // ✅ ensures it refetches when formData changes
    queryFn: async () => {
      const { country, location, category } = formData || {};

      const response = await axios.get(
        `common/location-and-type-based-company-data?country=${country}&state=${location}&category=${category}`
      );

      return response.data;
    },
    enabled:
      !!formData?.country && !!formData?.location && !!formData?.category, // ✅ prevents fetching on empty state
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const navigate = useNavigate();

  const { handleSubmit, control, reset, setValue } = useForm({
    defaultValues: {
      country: "",
      location: "",
      category: "",
    },
  });
  useEffect(() => {
    setValue("country", formData.country);
    setValue("location", formData.location);
    setValue("category", formData.category);
  }, [formData]);
  const { mutate: locationData, isPending: isLocation } = useMutation({
    mutationFn: async (data) => {
      console.log("data", data);
    },
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });

  const forMapsData = isLisitingLoading
    ? []
    : listingsData.map((item) => ({
        ...item,
        id: item._id,
        lat: item.latitude,
        lng: item.longitude,
        name: item.companyName,
        location: item.city,
        reviews: item.reviews.length,
        rating: item.reviews?.length
          ? (() => {
              const avg =
                item.reviews.reduce((sum, r) => sum + r.starCount, 0) /
                item.reviews.length;
              return avg % 1 === 0 ? avg : avg.toFixed(1);
            })()
          : "0",
        image:
          "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
      }));

  return (
    <div className="flex flex-col gap-4 ">
      <div className="flex flex-col gap-4 justify-center items-center  w-full mt-10 lg:mt-0">
        <div className="flex flex-col gap-4 justify-between w-3/4 md:w-3/4 lg:w-1/2 h-full">
          <form
            onSubmit={handleSubmit((data) => locationData(data))}
            className="flex gap-2 items-center border-2 border-primary-blue rounded-full pl-4 overflow-hidden h-10 lg:h-16"
          >
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  variant="standard"
                  label="Select Country"
                  slotProps={{ input: { disableUnderline: true } }}
                >
                  <MenuItem value="" disabled>
                    Select A Country
                  </MenuItem>
                  <MenuItem value="india">India</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  variant="standard"
                  label="Select Location"
                  slotProps={{ input: { disableUnderline: true } }}
                >
                  <MenuItem value="" disabled>
                    Select A Location
                  </MenuItem>
                  <MenuItem value="goa">Goa</MenuItem>
                </TextField>
              )}
            />
            <div className="w-full border-l-2 border-l-primary-blue  flex h-full pl-4 ">
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    size="small"
                    variant="standard"
                    label="Select Category"
                    slotProps={{ input: { disableUnderline: true } }}
                  >
                    <MenuItem value="" disabled>
                      Select A Category
                    </MenuItem>
                    <MenuItem value="coworking">Co-Working</MenuItem>
                  </TextField>
                )}
              />
              <div className="bg-primary-blue w-72 h-full text-subtitle flex justify-center items-center text-white">
                <CiSearch /> &nbsp;&nbsp; Search
              </div>
            </div>
          </form>
        </div>
      </div>
      <hr />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
          <div className="  font-semibold text-lg ">
            <div className="pb-6">
              <p>Over 16 Co - Working Space</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[36rem] overflow-y-auto overflow-x-hidden">
              {isLisitingLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : listingsData?.length ? (
                listingsData.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      navigate(`${item.companyName}`, {
                        state: {
                          companyId: item._id,
                        },
                      })
                    }
                    className="flex flex-col gap-4 justify-between h-96 w-full bg-white p-4 rounded-lg shadow-md hover:scale-105 hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* ⬇️ Make image container relative to allow absolutely positioning the heart */}
                    <div className="h-3/4 w-full overflow-hidden rounded-xl border-2 relative">
                      <img
                        src={
                          "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp"
                        }
                        alt={item.companyName}
                        className="w-full h-full object-cover"
                      />

                      {/* ❤️ Heart icon positioned top-right over the image */}
                      <div
                        className="absolute top-2 right-2 cursor-pointer"
                        onClick={() => toggleFavorite(item._id)}
                      >
                        {favorites.includes(item._id) ? (
                          <AiFillHeart className="text-white" size={22} />
                        ) : (
                          <AiOutlineHeart className="text-white" size={22} />
                        )}
                      </div>
                    </div>

                    {/* 👇 Existing card content below the image stays untouched */}
                    <div className="h-[25%] flex flex-col gap-1">
                      <div className="flex w-full justify-between items-center">
                        <p className="text-sm font-semibold">
                          {item.companyName}
                        </p>
                        <div className="flex items-center gap-1 text-black">
                          <AiFillStar size={16} />
                          {/* {renderStars(
                          item.reviews?.length
                            ? item.reviews.reduce(
                                (sum, r) => sum + r.starCount,
                                0
                              ) / item.reviews.length
                            : 0
                        )} */}
                          <p className="text-sm font-semibold text-black">
                            (
                            {item.reviews?.length
                              ? (() => {
                                  const avg =
                                    item.reviews.reduce(
                                      (sum, r) => sum + r.starCount,
                                      0
                                    ) / item.reviews.length;
                                  return avg % 1 === 0 ? avg : avg.toFixed(1);
                                })()
                              : "0"}
                            )
                          </p>
                        </div>
                      </div>

                      <div className="flex w-full justify-between items-center">
                        <p className="text-sm text-gray-600 font-medium">
                          {item.city},{item.state}
                        </p>
                        <p className="text-sm font-semibold">
                          Reviews({item.reviews.length})
                        </p>
                      </div>

                      <div className="flex w-full justify-between items-center">
                        <p className="text-sm font-semibold">
                          Starting from {item.price || 125}
                        </p>
                      </div>

                      <div className="flex w-full justify-between items-center">
                        <p className="text-xs text-gray-600 font-normal">
                          {item.note || "*Also available on Monthly basis"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-sm text-gray-500 border border-dotted rounded-lg p-4">
                  No listings found.
                </div>
              )}
            </div>
          </div>
          <div className="w-full overflow-hidden rounded-xl h-[40rem]">
            {isLisitingLoading ? (
              <SkeletonMap />
            ) : forMapsData?.length ? (
              <Map locations={forMapsData} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm border border-dotted rounded-lg">
                Map data not available.
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Listings;
