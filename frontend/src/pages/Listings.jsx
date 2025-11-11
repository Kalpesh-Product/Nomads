import { Box, MenuItem, Skeleton, TextField } from "@mui/material";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
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
import useAuth from "../hooks/useAuth.js";

const Listings = () => {
  const [resetPageKey, setResetPageKey] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const formData = useSelector((state) => state.location.formValues);
  const { handleSubmit, control, reset, setValue, getValues, watch } = useForm({
    defaultValues: {
      country: "",
      location: "",
      category: "",
    },
  });

  const { auth } = useAuth();
  const user = auth?.user || {};
  const userId = auth?.user?._id || auth?.user?.id;

  // 🧠 Special users who can view all countries and states
  const specialUserEmails = [
    "allan.wono@gmail.com",
    "muskan.wono@gmail.com",
    "shawnsilveira.wono@gmail.com",
    "mehak.wono@gmail.com",
    "savita.wono@gmail.com",
    "k@k.k",
  ];

  const selectedCountry = watch("country");
  const selectedState = watch("location");
  const { data: locations = [], isLoading: isLocations } = useQuery({
    queryKey: ["locations", user?.email],
    queryFn: async () => {
      try {
        const response = await axios.get("company/company-locations");
        const rawData = Array.isArray(response.data) ? response.data : [];

        const userEmail = user?.email?.toLowerCase();
        const isSpecialUser = specialUserEmails.includes(userEmail);

        // 🧠 Special users see everything
        if (isSpecialUser) return rawData;

        // 🚫 Regular users:
        // 1️⃣ Keep only public states
        // 2️⃣ Drop countries that have zero public states
        return rawData
          .map((country) => ({
            ...country,
            states: (country.states || []).filter((s) => s?.isPublic),
          }))
          .filter((country) => (country.states?.length || 0) > 0);
      } catch (error) {
        console.error(error?.response?.data?.message);
        return [];
      }
    },
  });

  const continentOptions = React.useMemo(() => {
    const uniqueContinents = [
      ...new Set(locations.map((item) => item.continent).filter(Boolean)),
    ];
    return uniqueContinents
      .map((cont) => ({
        label: cont.charAt(0).toUpperCase() + cont.slice(1),
        value: cont.toLowerCase(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [locations]);

  // const countryOptions = locations
  //   .map((item) => ({
  //     label: item.country?.charAt(0).toUpperCase() + item.country?.slice(1),
  //     value: item.country?.toLowerCase(),
  //   }))
  //   .sort((a, b) => a.label.localeCompare(b.label));

  // const filteredLocation = locations.find(
  //   (item) => item.country?.toLowerCase() === selectedCountry?.toLowerCase()
  // );
  // const locationOptions = filteredLocation?.states?.map((item) => ({
  //   label: item,
  //   value: item?.toLowerCase(),
  // }));

  // -------------------------------------
  // 🔒 Country & location filtering based on user email
  // -------------------------------------
  // const specialUserEmails = [
  //   "allan.wono@gmail.com",
  //   "muskan.wono@gmail.com",
  //   "shawnsilveira.wono@gmail.com",
  //   "mehak.wono@gmail.com",
  //   "k@k.k",
  //   "savita.wono@gmail.com",
  // ]; // add more if needed
  // const specialCountries = ["americac"]; // lowercase preferred
  // const specialLocationMap = {
  //   america: ["americal", "americani"], // lowercase names
  // };

  // 👇 Add this line before building countries
  const selectedContinent = watch("continent");

  // Build countries based on selected continent
  const allCountryOptions = React.useMemo(() => {
    let filtered = locations;
    if (selectedContinent) {
      filtered = locations.filter(
        (item) =>
          item.continent?.toLowerCase() === selectedContinent?.toLowerCase()
      );
    }

    return filtered
      .map((item) => ({
        label: item.country
          ? item.country.charAt(0).toUpperCase() + item.country.slice(1)
          : "",
        value: item.country?.toLowerCase(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [locations, selectedContinent]);

  const countryOptions = React.useMemo(
    () => allCountryOptions,
    [allCountryOptions]
  );

  const filteredLocation = locations.find(
    (item) => item.country?.toLowerCase() === selectedCountry?.toLowerCase()
  );

  const locationOptions = React.useMemo(() => {
    return (
      filteredLocation?.states?.map((item) => ({
        label: item.name,
        value: item.name?.toLowerCase(),
      })) || []
    );
  }, [filteredLocation]);

  const countOptions = [
    { label: "1 - 5", value: "1-5" },
    { label: "5 - 10", value: "5-10" },
    { label: "10 - 25", value: "10-25" },
    { label: "25+", value: "25+" },
  ];
  // const categoryOptions = [
  //   { label: "Co-Working", value: "coworking" },
  //   // { label: "Co-Living", value: "coliving" },
  //   { label: "Hostels", value: "hostel" },
  //   { label: "Workation", value: "workation" },
  //   { label: "Private Stay", value: "privatestay" },
  //   { label: "Meetings", value: "meetingroom" },
  //   { label: "Cafe’s", value: "cafe" },
  // ];

  const activeCategory = searchParams.get("category");

  const skeletonArray = Array.from({ length: 6 });

  const { data: listingsData = [], isPending: isLisitingLoading } = useQuery({
    queryKey: ["listings", formData],
    queryFn: async () => {
      const { country, location } = formData || {};
      const response = await axios.get(
        `company/companies?country=${country}&state=${location}&userId=${
          userId || ""
        }`
      );

      return Array.isArray(response.data)
        ? response.data.filter((item) => item?.companyType !== "privatestay")
        : [];
    },
    enabled: !!formData?.country && !!formData?.location,
    refetchOnMount: "always", // ✅ forces refetch on every mount
  });

  const categoryOptions = React.useMemo(() => {
    if (!listingsData || listingsData.length === 0) return [];

    const uniqueTypes = [
      ...new Set(
        listingsData
          .filter((item) => item.companyType !== "privatestay")
          .map((item) => item.companyType)
          .filter(Boolean)
      ),
    ];

    const labelMap = {
      coworking: "Co-Working",
      coliving: "Co-Living",
      hostel: "Hostels",
      workation: "Workation",
      // privatestay: "Private Stay",
      meetingroom: "Meetings",
      cafe: "Cafe’s",
    };

    const typeOrder = [
      "coworking",
      "hostel",
      "workation",
      // "privatestay",
      "coliving",
      "meetingroom",
      "cafe",
    ];

    return uniqueTypes
      .map((type) => ({ label: labelMap[type] || type, value: type }))
      .sort((a, b) => typeOrder.indexOf(a.value) - typeOrder.indexOf(b.value));
  }, [listingsData]);

  const filteredListings = React.useMemo(() => {
    if (!listingsData) return [];

    if (!formData?.category) return listingsData;

    const categoryResults = listingsData.filter(
      (item) => item.companyType === formData.category
    );

    // ✅ If no listings match the selected category, fallback to all listings
    return categoryResults.length > 0 ? categoryResults : listingsData;
  }, [listingsData, formData?.category]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const navigate = useNavigate();

  useEffect(() => {
    setValue("continent", formData.continent);
    setValue("country", formData.country);
    setValue("location", formData.location);
    setValue("category", formData.category);
  }, [formData]);
  useEffect(() => {
    if (formData?.category && listingsData?.length > 0) {
      const hasCategory = listingsData.some(
        (item) => item.companyType === formData.category
      );

      if (!hasCategory) {
        // Reset category in Redux + URL
        dispatch(setFormValues({ ...formData, category: "" }));
        setSearchParams({
          country: formData.country,
          location: formData.location,
        });
      }
    }
  }, [listingsData, formData, dispatch, setSearchParams]);

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
        image: item.images?.[0]?.url,
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
    setShowMobileSearch(false);
    navigate(
      `/listings?country=${formData.country}&location=${formData.location}&category=${state.category}`,
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
    setResetPageKey((prev) => prev + 1); // ensures a new value every time
  };
  const [mapOpen, setMapOpen] = useState(true);

  // Prioritize BIZ Nest and MeWo first, then sort the rest by rating descending
  const prioritizedCompanies = ["BIZ Nest", "MeWo"];
  const sortedListings = [...(listingsData || [])].sort((a, b) => {
    const aIsPriority = prioritizedCompanies.includes(a.companyName);
    const bIsPriority = prioritizedCompanies.includes(b.companyName);

    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;

    // If both are priority or both are not, then sort by average rating descending
    const aRating =
      a.reviews?.length > 0
        ? a.reviews.reduce((sum, r) => sum + r.starCount, 0) / a.reviews.length
        : 0;
    const bRating =
      b.reviews?.length > 0
        ? b.reviews.reduce((sum, r) => sum + r.starCount, 0) / b.reviews.length
        : 0;

    return bRating - aRating;
  });

  return (
    <div className="flex flex-col gap:2 lg:gap-6 ">
      <div className="min-w-[80%] max-w-[80rem] lg:max-w-[80rem] mx-0 md:mx-auto px-6 sm:px-6 lg:px-0">
        <div className="lg:flex w-full items-center justify-between hidden">
          <div className="flex flex-col gap-4 justify-center items-center  w-full mt-10 lg:mt-0">
            <div className="hidden lg:flex flex-col gap-4 justify-between items-center w-full h-full">
              {/* the 5 icons */}

              <div className=" w-3/4 pb-4">
                <div className="flex justify-between items-center">
                  {categoryOptions.map((cat) => {
                    const iconSrc = newIcons[cat.value];
                    const isActive = activeCategory === cat.value;

                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategoryClick(cat.value)}
                        className="text-black px-4 py-2 hover:text-black transition flex items-center justify-center w-full"
                      >
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
                              }`}
                            >
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
                className=" flex justify-around md:w-full lg:w-full border-2 bg-gray-50 rounded-full p-0 items-center"
                // className=" flex justify-around md:w-full lg:w-3/4 border-2 bg-gray-50 rounded-full p-0 items-center"
              >
                <Controller
                  name="continent"
                  control={control}
                  render={({ field }) => (
                    <SearchBarCombobox
                      value={field.value}
                      onChange={field.onChange}
                      options={continentOptions}
                      label="Select Continent"
                      placeholder="Select continent"
                      className="w-full "
                    />
                  )}
                />
                <div className="w-px h-10 bg-gray-300 mx-2 my-auto" />
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
                      disabled={!selectedContinent}
                      className="w-full "
                    />
                  )}
                />
                <div className="w-px h-10 bg-gray-300 mx-2 my-auto" />
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
                <div className="w-px h-10 bg-gray-300 mx-2 my-auto" />
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
                      className="w-full "
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
          </div>
        </div>
        <div className="flex lg:hidden w-full items-center justify-center my-4">
          <button
            onClick={() => setShowMobileSearch((prev) => !prev)}
            className="bg-white shadow-md flex items-center w-full text-center justify-center font-medium text-secondary-dark border-2 px-6 py-2 rounded-full flex-col gap-2"
          >
            <span>
              Search Results in{" "}
              {formData?.location?.charAt(0).toUpperCase() +
                formData?.location?.slice(1) || "Unknown"}
            </span>
            <span className="text-tiny text-gray-500">
              {formData?.count || "N/A"} Nomads
            </span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl overflow-auto z-50 p-0 rounded-t-3xl lg:hidden"
          >
            <motion.div className="bg-white shadow-2xl overflow-auto p-4 rounded-b-3xl  h-screen  w-full">
              <div className="flex justify-between items-center mb-10">
                <div>&nbsp;</div>
                <h3 className="text-xl font-semibold">Search</h3>
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="text-gray-500 text-xl"
                >
                  &times;
                </button>
              </div>
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`grid ${
                  categoryOptions.length === 4
                    ? "grid-cols-2" // 2 icons per row for 4 total
                    : "grid-cols-3 md:grid-cols-5" // default layout for 6 or more
                } gap-4 gap-y-10 mb-16 justify-items-center`}
              >
                {categoryOptions.map((cat) => {
                  const iconSrc = newIcons[cat.value];
                  const isActive = activeCategory === cat.value;

                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryClick(cat.value)}
                      className="text-black px-4 py-2 hover:text-black transition flex items-center justify-center w-full"
                    >
                      {iconSrc ? (
                        <div className="h-10 w-full flex flex-col gap-0 items-center">
                          <img
                            src={iconSrc}
                            alt={cat.label}
                            className="h-full w-full object-contain"
                          />
                          <span
                            className={`text-sm border-b-2 ${
                              isActive
                                ? "border-[#FF5757]"
                                : "border-transparent"
                            }`}
                          >
                            {cat.label}
                          </span>
                        </div>
                      ) : (
                        cat.label
                      )}
                    </button>
                  );
                })}
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Controller
                  name="continent"
                  control={control}
                  render={({ field }) => (
                    <SearchBarCombobox
                      value={field.value}
                      onChange={field.onChange}
                      options={continentOptions}
                      label="Select Continent"
                      placeholder="Select continent"
                      className="w-full "
                    />
                  )}
                />

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
                      disabled={!selectedContinent}
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
                  className="w-full bg-[#FF5757] text-white py-5 rounded-full"
                >
                  <IoSearch className="inline mr-2" />
                  Search
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Container padding={false}>
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
          {/* LIST VIEW */}
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${
              mapOpen ? "col-span-5" : "col-span-9"
            } font-semibold text-lg`}
          >
            <PaginatedGrid
              // data={isLisitingLoading ? skeletonArray : sortedListings}
              data={isLisitingLoading ? skeletonArray : filteredListings}
              entriesPerPage={!mapOpen ? 10 : 9}
              persistPage={true}
              resetPageKey={resetPageKey}
              columns={`grid-cols-1 md:grid-cols-2 ${
                mapOpen ? "lg:grid-cols-3" : "lg:grid-cols-5"
              } gap-x-5`}
              renderItem={(item, index) =>
                isLisitingLoading ? (
                  <Box key={index} className="w-full h-full">
                    <Skeleton
                      variant="rectangular"
                      height={200}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                ) : (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                  >
                    <ListingCard
                      item={item}
                      showVertical={false}
                      handleNavigation={() => {
                        navigate(`/listings/${item.companyName}`, {
                          state: {
                            companyId: item.companyId,
                            type: item.companyType,
                          },
                        });
                      }}
                    />
                  </motion.div>
                )
              }
            />
          </motion.div>

          {/* MAP VIEW */}
          <AnimatePresence>
            {mapOpen && (
              <motion.div
                key="map-view"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="col-span-4 w-full overflow-hidden rounded-xl h-full"
              >
                {isLisitingLoading ? (
                  <SkeletonMap />
                ) : forMapsData?.length ? (
                  <Map locations={forMapsData} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm border border-dotted rounded-lg">
                    Map data not available.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </div>
  );
};

export default Listings;
