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
import { AnimatePresence, motion } from "motion/react";

const GlobalListingsList = () => {
  const [favorites, setFavorites] = useState([]);
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.location.formValues);
  const countryOptions = [{ label: "India", value: "india" }];
  const locationOptions = [{ label: "Goa", value: "goa" }];
  const countOptions = [
    { label: "1 - 5", value: "1-5" },
    { label: "5 - 10", value: "5-10" },
    { label: "10 - 25", value: "10-25" },
    { label: "25+", value: "25+" },
  ];
  const categoryOptions = [
    { label: "Co-Working", value: "coworking" },
    { label: "Hostels", value: "hostel" },
    { label: "Cafe’s", value: "cafes" },
    { label: "Meeting Rooms", value: "meetingRoom" },
    { label: "Private Stay", value: "privateStay" },
    { label: "Co-Living", value: "coliving" },
    { label: "Company Workation", value: "companyWorkation" },
  ];
  console.log("formData", formData);
  const handleShowMoreClick = (type) => {
    const updatedForm = {
      ...formData,
      category: type,
    };

    dispatch(setFormValues(updatedForm));

    navigate(
      `/nomad/listings?country=${formData.country}&location=${formData.location}&category=${type}`,
      {
        state: updatedForm,
      }
    );
  };

  const { data: listingsData, isPending: isLisitingLoading } = useQuery({
    queryKey: ["listings", formData], // ✅ ensures it refetches when formData changes
    queryFn: async () => {
      const { country, location, category } = formData || {};

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

  console.log("frou[ed ", groupedListings);

  const typeLabels = {
    coworking: "Co-Working Spaces",
    coliving: "Co-Living Spaces",
    hostel: "Hostel",
    privateStay: "Private Stay",
    cafe: "Cafe",
    // fallback for unknown types
    default: (type) => `${type[0].toUpperCase() + type.slice(1)} Spaces`,
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const navigate = useNavigate();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const onSubmit = (data) => {
    locationData(data);
  };
  const { handleSubmit, control, reset, setValue, getValues, watch } = useForm({
    defaultValues: {
      country: "",
      location: "",
      category: "",
    },
  });
  const selectedCountry = watch("country");
  const selectedState = watch("location");
  useEffect(() => {
    setValue("country", formData.country);
    setValue("location", formData.location);
    setValue("count", formData.count);
  }, [formData]);
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

  const handleCategoryClick = (categoryValue) => {
    const formData = getValues(); // from react-hook-form

    if (!formData.country || !formData.location) {
      alert("Please select Country and Location first.");
      return;
    }
    dispatch(setFormValues({ ...formData, category: categoryValue }));

    // const url = `/nomads/${formData.country}.${formData.location}/${categoryValue}`;
    const state = {
      ...formData,
      category: categoryValue,
    };

    // console.log("Generated URL:", url);
    console.log("State to be passed:", state);

    navigate(
      `/nomad/listings?country=${formData.country}&location=${formData.location}&category=${state.category}`,
      {
        state: {
          country: formData.country,
          location: formData.location,
          category: categoryValue,
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 ">
      <div className="flex flex-col gap-4 justify-center items-center  w-full lg:mt-0">
        <Container padding={false}>
          <div className="hidden lg:flex flex-col gap-4 justify-between items-center w-full h-full">
            {/* the 5 icons */}

            <div className=" w-full flex justify-center items-center">
              <div className="grid grid-cols-5 md:grid-cols-7 gap-0 pb-4">
                {categoryOptions.map((cat) => {
                  const iconSrc = newIcons[cat.value];

                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryClick(cat.value)}
                      className=" text-black  px-4 py-2   hover:text-black transition flex items-center justify-center w-full"
                    >
                      {iconSrc ? (
                        <div className="h-10 w-full flex flex-col gap-0">
                          <img
                            src={iconSrc}
                            alt={cat.label}
                            className="h-full w-full object-contain"
                          />
                          <span className="text-sm">{cat.label}</span>
                          <div></div>
                        </div>
                      ) : (
                        cat.label // fallback if no icon found
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className=" flex justify-around w-3/4 border-2 bg-gray-50 rounded-full p-0 items-center"
            >
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
                className="w-fit h-full  bg-[#FF5757] text-white p-5 text-subtitle rounded-full"
              >
                <IoSearch />
              </button>
            </form>
          </div>
          <div className="flex lg:hidden w-full items-center justify-center my-4">
            <button
              onClick={() => setShowMobileSearch((prev) => !prev)}
              className="bg-white flex items-center w-full text-black border-2 px-6 py-3 rounded-full"
            >
              <IoSearch className="inline mr-2" />
              Start Search
            </button>
          </div>
        </Container>
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl overflow-auto z-50 p-4 rounded-t-3xl lg:hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Search</h3>
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="text-gray-500 text-xl"
                >
                  &times;
                </button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-10">
                {categoryOptions.map((cat) => {
                  const iconSrc = newIcons[cat.value];

                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryClick(cat.value)}
                      className=" text-black  px-4 py-2   hover:text-black transition flex items-center justify-center w-full"
                    >
                      {iconSrc ? (
                        <div className="h-10 w-full flex flex-col gap-0">
                          <img
                            src={iconSrc}
                            alt={cat.label}
                            className="h-full w-full object-contain"
                          />
                          <span className="text-sm">{cat.label}</span>
                          <div></div>
                        </div>
                      ) : (
                        cat.label // fallback if no icon found
                      )}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                      className="w-full"
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
                      className="w-full"
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
                      className="w-full"
                    />
                  )}
                />
                <button
                  type="submit"
                  className="w-full bg-[#FF5757] text-white py-3 rounded-full"
                >
                  <IoSearch className="inline mr-2" />
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <hr />
      <Container padding={false}>
        <div className="">
          <div className="font-semibold text-md">
            <div className=" custom-scrollbar-hide">
              {isLisitingLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : groupedListings && Object.keys(groupedListings).length > 0 ? (
                Object.entries(groupedListings).map(([type, items]) => {
                  console.log("typoe ", type);
                  const prioritizedCompanies = ["MeWo", "BIZ Nest"];
                  const sortedItems = items.sort((a, b) => {
                    const aPriority = prioritizedCompanies.includes(
                      a.companyName
                    )
                      ? 0
                      : 1;
                    const bPriority = prioritizedCompanies.includes(
                      b.companyName
                    )
                      ? 0
                      : 1;

                    // If both have same priority, keep original order
                    if (aPriority === bPriority) return 0;

                    // Prioritize a if it's in the list
                    return aPriority - bPriority;
                  });

                  const displayItems = sortedItems.slice(0, 5);

                  const showViewMore = items.length > 5;
                  const sectionTitle = `Popular ${
                    typeLabels[type] || typeLabels.default(type)
                  } in ${formData?.location}`;

                  return (
                    <div key={type} className="col-span-full mb-6">
                      <h2 className="text-subtitle font-semibold mb-5">
                        {sectionTitle}
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-0">
                        {displayItems.map((item) => (
                          <ListingCard
                            key={item._id}
                            item={item}
                            handleNavigation={() =>
                              navigate(`/nomad/listings/${item.companyName}`, {
                                state: { companyId: item._id, type: item.type },
                              })
                            }
                          />
                        ))}
                      </div>

                      {showViewMore && (
                        <div className="mt-3 text-right">
                          <button
                            onClick={() => handleShowMoreClick(type)}
                            className="text-primary-blue text-sm font-semibold hover:underline"
                          >
                            Show More →
                          </button>
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
          </div>
        </div>
      </Container>
    </div>
  );
};

export default GlobalListingsList;
