import { MenuItem, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CiSearch } from "react-icons/ci";
import { AiFillStar } from "react-icons/ai";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import Container from "../components/Container";
import { NavLink, useNavigate } from "react-router-dom";
import Map from "../components/Map";
import { useDispatch, useSelector } from "react-redux";
import axios from "../utils/axios.js";
import renderStars from "../utils/renderStarts.jsx";
import SkeletonCard from "../components/Skeletons/SkeletonCard.jsx";
import SkeletonMap from "../components/Skeletons/SkeletonMap.jsx";
import Select from "react-dropdown-select";
import { setFormValues } from "../features/locationSlice.js";
import ListingCard from "../components/ListingCard.jsx";
import newIcons from "../assets/newIcons.js";
import { IoSearch } from "react-icons/io5";
import SearchBarCombobox from "../components/SearchBarCombobox.jsx";

const GlobalListingsMap = () => {
  const [favorites, setFavorites] = useState([]);
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.location.formValues);
  const countryOptions = [{ label: "India", value: "india" }];
  const locationOptions = [{ label: "Goa", value: "goa" }];
  const countOptions = [
    { label: "0 - 10", value: "0 - 10" },
    { label: "10 - 20", value: "10 - 20" },
  ];
  console.log("formData", formData);
  const { data: listingsData, isPending: isLisitingLoading } = useQuery({
    queryKey: ["listings", formData], // ✅ ensures it refetches when formData changes
    queryFn: async () => {
      const { country, location, count } = formData || {};

      const response = await axios.get(
        `common/location-and-type-based-company-data?country=${country}&state=${location}`
      );

      // return response.data;
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!formData?.country && !!formData?.location, // ✅ prevents fetching on empty state
  });

  const groupedListings = listingsData?.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const typeLabels = {
    coworking: "Co-Working Spaces",
    coliving: "Co-Living Spaces",
    // fallback for unknown types
    default: (type) => `${type[0].toUpperCase() + type.slice(1)} Spaces`,
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const navigate = useNavigate();

  const { handleSubmit, control, reset, register, watch } = useForm({
    defaultValues: {
      country: "",
      location: "",
      count: "",
    },
  });

  const selectedCountry = watch("country");
  const selectedState = watch("location");

  // useEffect(() => {
  //   setValue("country", formData.country);
  //   setValue("location", formData.location);
  //   setValue("count", formData.count);
  // }, [formData]);

  const { mutate: locationData, isPending: isLocation } = useMutation({
    mutationFn: async (data) => {
      dispatch(setFormValues(data));
    },
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });

  const handlecountClick = (countValue) => {
    const formData = getValues(); // from react-hook-form

    if (!formData.country || !formData.location) {
      alert("Please select Country and Location first.");
      return;
    }
    dispatch(setFormValues({ ...formData, count: countValue }));

    // const url = `/nomads/${formData.country}.${formData.location}/${countValue}`;
    const state = {
      ...formData,
      count: countValue,
    };

    // console.log("Generated URL:", url);
    console.log("State to be passed:", state);

    navigate(
      `/nomad/listings?country=${formData.country}&location=${formData.location}&count=${state.count}`,
      {
        state: {
          country: formData.country,
          location: formData.location,
          count: countValue,
        },
      }
    );
  };

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

  const onSubmit = (data) => {
    locationData(data);
  };

  return (
    <div className="flex flex-col gap-8 ">
      <div className="flex flex-col gap-4 justify-center items-center  w-full mt-10 lg:mt-0">
        <Container>
          <div className="py-4">
            <div className="flex flex-col gap-4 justify-between items-center">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className=" flex justify-around w-3/4 border-2 bg-gray-50 rounded-full p-0 items-center">
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <SearchBarCombobox
                      value={field.value}
                      onChange={field.onChange}
                      options={countryOptions}
                      label="Select Country"
                      placeholder="Select aspiring destination"
                      className="w-full z-10"
                    />
                  )}
                />
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <SearchBarCombobox
                      value={field.value}
                      onChange={field.onChange}
                      label="Select Location"
                      options={locationOptions}
                      placeholder="Select area within country"
                      disabled={!selectedCountry}
                      className="-ml-12 w-full z-20"
                    />
                  )}
                />
                <Controller
                  name="count"
                  control={control}
                  render={({ field }) => (
                    <SearchBarCombobox
                      value={field.value}
                      onChange={field.onChange}
                      options={countOptions}
                      label="Select Count"
                      placeholder="Booking for no. of Nomads"
                      disabled={!selectedState}
                      className="-ml-12 w-full z-30"
                    />
                  )}
                />
                <button
                  type="submit"
                  className="w-fit h-full  bg-[#FF5757] text-white p-5 text-subtitle rounded-full">
                  <IoSearch />
                </button>
              </form>
            </div>
          </div>
        </Container>
      </div>
      <hr />
      <Container padding={false}>
        <div className="">
          <div className="font-semibold text-lg  flex">
            <div className="pr-10 h-[36rem] overflow-auto custom-scrollbar-hide   w-1/2">
              {isLisitingLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : groupedListings && Object.keys(groupedListings).length > 0 ? (
                Object.entries(groupedListings).map(([type, items]) => {
                  const displayItems = items.slice(0, 5);
                  const showViewMore = items.length > 5;
                  const sectionTitle = `Popular ${
                    typeLabels[type] || typeLabels.default(type)
                  } in ${formData?.location}`;

                  return (
                    <div key={type} className="col-span-full mb-6 ">
                      <h2 className="text-subtitle font-semibold mb-5">
                        {sectionTitle}
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ">
                        {displayItems.map((item) => (
                          <ListingCard key={item._id} item={item} />
                        ))}
                      </div>

                      {showViewMore && (
                        <div className="mt-3 text-right">
                          <NavLink
                            to={`/nomads/${formData.country}.${formData.location}/${type}`}
                            state={{ ...formData, count: type }}
                            className="text-primary-blue text-sm font-semibold hover:underline ">
                            View More{" "}
                            {typeLabels[type] || typeLabels.default(type)} →
                          </NavLink>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-sm text-gray-500 border border-dotted rounded-lg p-4">
                  No listings found.
                </div>
              )}
            </div>
            <div className="">
              <div className="w-[40rem] rounded-xl h-[40rem]">
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
          </div>
        </div>
      </Container>
    </div>
  );
};

export default GlobalListingsMap;
