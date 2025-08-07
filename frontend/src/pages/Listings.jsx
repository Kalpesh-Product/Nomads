import { MenuItem, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CiSearch } from "react-icons/ci";
import { AiFillStar } from "react-icons/ai";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import Container from "../components/Container";
import { useNavigate, useParams } from "react-router-dom";
import Map from "../components/Map";
import { useDispatch, useSelector } from "react-redux";
import axios from "../utils/axios.js";
import renderStars from "../utils/renderStarts.jsx";
import SkeletonCard from "../components/Skeletons/SkeletonCard.jsx";
import SkeletonMap from "../components/Skeletons/SkeletonMap.jsx";
import Select from "react-dropdown-select";
import { setFormValues } from "../features/locationSlice.js";
import { useSearchParams } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
import PaginatedGrid from "../components/PaginatedGrid.jsx";
import newIcons from "../assets/newIcons.js";
import SearchBarCombobox from "../components/SearchBarCombobox.jsx";
import { IoSearch } from "react-icons/io5";
import { AnimatePresence, motion } from "motion/react";

const Listings = () => {
  const [favorites, setFavorites] = useState([]);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
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
    { label: "Hostel", value: "hostel" },
    { label: "Cafe’s", value: "cafe" },
    { label: "Meeting Rooms", value: "meetingRoom" },
    { label: "Private Stay", value: "privateStay" },
    { label: "Co-Living", value: "coliving" },
    { label: " Workation", value: "workation" },
  ];
  const activeCategory = searchParams.get("category");

  console.log("formData", formData);
  const { data: listingsData, isPending: isLisitingLoading } = useQuery({
    queryKey: ["listings", formData], // ✅ ensures it refetches when formData changes
    queryFn: async () => {
      const { country, location, category } = formData || {};

      const response = await axios.get(
        `common/location-and-type-based-company-data?country=${country}&state=${location}&category=${category}`
      );

      // return response.data;
      return Array.isArray(response.data) ? response.data : [];
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

  const { handleSubmit, control, reset, setValue, watch, getValues } = useForm({
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
    setValue("category", formData.category);
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

  const forMapsData = isLisitingLoading
    ? []
    : listingsData.map((item) => ({
        ...item,
        id: item._id,
        lat: item.latitude,
        lng: item.longitude,
        name: item.companyName,
        location: item.city,
        reviews: item.reviews?.length,
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

  const onSubmit = (data) => {
    locationData(data);
  };

  return (
    <div className="flex flex-col gap-6 ">
      <Container padding={false}>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-4 justify-center items-center  w-full mt-10 lg:mt-0">
            <div className="hidden lg:flex flex-col gap-4 justify-between items-center w-full h-full">
              {/* the 5 icons */}

              <div className=" w-3/4 flex justify-center items-center pb-4">
                <div className="grid grid-cols-5 md:grid-cols-7 gap-0">
                  {categoryOptions.map((cat) => {
                    const iconSrc = newIcons[cat.value];
                    const isActive = activeCategory === cat.value;

                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategoryClick(cat.value)}
                        className="text-black px-4 py-2 hover:text-black transition flex items-center justify-center w-full">
                        {iconSrc ? (
                          <div className="h-10 w-full flex flex-col gap-0 items-center">
                            <img
                              src={iconSrc}
                              alt={cat.label}
                              className="h-full w-full object-contain"
                            />
                            <span
                              className={`text-sm border-b-4 ${
                                isActive
                                  ? "border-primary-blue"
                                  : "border-transparent"
                              }`}>
                              {cat.label}
                            </span>
                          </div>
                        ) : (
                          cat.label
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

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
        </div>
        <div className="flex lg:hidden w-full items-center justify-center my-4">
          <button
            onClick={() => setShowMobileSearch((prev) => !prev)}
            className="bg-white flex items-center w-full text-black border-2 px-6 py-3 rounded-full">
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
            className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl overflow-auto z-50 p-4 rounded-t-3xl lg:hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Search</h3>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="text-gray-500 text-xl">
                &times;
              </button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-10">
              {categoryOptions.map((cat) => {
                const iconSrc = newIcons[cat.value];
                const isActive = activeCategory === cat.value;

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryClick(cat.value)}
                    className="text-black px-4 py-2 hover:text-black transition flex items-center justify-center w-full">
                    {iconSrc ? (
                      <div className="h-10 w-full flex flex-col gap-0 items-center">
                        <img
                          src={iconSrc}
                          alt={cat.label}
                          className="h-full w-full object-contain"
                        />
                        <span
                          className={`text-sm border-b-2 ${
                            isActive ? "border-[#FF5757]" : "border-transparent"
                          }`}>
                          {cat.label}
                        </span>
                      </div>
                    ) : (
                      cat.label
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
                className="w-full bg-[#FF5757] text-white py-3 rounded-full">
                <IoSearch className="inline mr-2" />
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <hr />
      <Container padding={false}>
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
          <div className="col-span-5  font-semibold text-lg ">
            <div className="pb-6">
              <p>
                Over {listingsData?.length - 1}{" "}
                {formData.category?.charAt(0).toUpperCase() +
                  formData.category?.slice(1)}{" "}
                Spaces
              </p>
            </div>

            <div>
              <PaginatedGrid
                data={listingsData}
                entriesPerPage={6}
                columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5"
                renderItem={(item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1, // delay each card slightly
                      ease: "easeOut",
                    }}>
                    <ListingCard
                      item={item}
                      handleNavigation={() =>
                        navigate(`${item.companyName}`, {
                          state: { companyId: item._id, type: item.type },
                        })
                      }
                    />
                  </motion.div>
                )}
              />
            </div>
          </div>
          <div className="w-full overflow-hidden rounded-xl h-full col-span-4">
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
