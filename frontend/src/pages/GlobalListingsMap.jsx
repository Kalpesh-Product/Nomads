import { Box, MenuItem, Skeleton, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import PaginatedGrid from "../components/PaginatedGrid.jsx";
import { Helmet } from "@dr.pogodin/react-helmet";
import useAuth from "../hooks/useAuth.js";

const HorizontalScrollWrapper = ({ children, title }) => {
  const scrollRef = React.useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8;

      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  return (
    <div className="relative group/scroll mb-6">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-sm sm:text-base md:text-subtitle text-secondary-dark font-semibold truncate leading-tight">
          {title}
        </h2>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous"
            type="button"
            disabled={!showLeft}
            className={`transition-all hover:scale-105 active:scale-95 flex items-center justify-center w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full border border-gray-200 shadow-sm ${showLeft ? "bg-white text-gray-800 opacity-100" : "bg-gray-50 text-gray-300 opacity-50 cursor-not-allowed"
              }`}
            style={{ boxShadow: showLeft ? "0 2px 4px rgba(0,0,0,0.1)" : "none" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              aria-hidden="true"
              role="presentation"
              focusable="false"
              style={{
                display: "block",
                fill: "none",
                height: "10px",
                width: "10px",
                stroke: "currentcolor",
                strokeWidth: 4,
                overflow: "visible",
              }}
            >
              <path fill="none" d="m20 28-11.3-11.3a1 1 0 0 1 0-1.4L20 4"></path>
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next"
            type="button"
            disabled={!showRight}
            className={`transition-all hover:scale-105 active:scale-95 flex items-center justify-center w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full border border-gray-200 shadow-sm ${showRight ? "bg-white text-gray-800 opacity-100" : "bg-gray-50 text-gray-300 opacity-50 cursor-not-allowed"
              }`}
            style={{ boxShadow: showRight ? "0 2px 4px rgba(0,0,0,0.1)" : "none" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              aria-hidden="true"
              role="presentation"
              focusable="false"
              style={{
                display: "block",
                fill: "none",
                height: "10px",
                width: "10px",
                stroke: "currentcolor",
                strokeWidth: 4,
                overflow: "visible",
              }}
            >
              <path fill="none" d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"></path>
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 md:gap-5 pb-2 custom-scrollbar-hide"
      >
        {children}
      </div>
    </div>
  );
};

const GlobalListingsMap = () => {
  const [favorites, setFavorites] = useState([]);
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.location.formValues);
  const { handleSubmit, control, reset, setValue, getValues, watch } = useForm({
    defaultValues: {
      country: "",
      location: "",
      category: "",
    },
  });
  const { auth } = useAuth();
  const [showListings, setShowListings] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Scroll lock for mobile map view
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      const mainContainer = document.querySelector(".h-screen.overflow-auto");
      if (mainContainer) {
        mainContainer.style.overflow = "hidden";
      }
      return () => {
        if (mainContainer) {
          mainContainer.style.overflow = "auto";
        }
      };
    }
  }, []);
  const user = auth?.user || {};
  const userId = auth?.user?._id || auth?.user?.id;

  const selectedCountry = watch("country");
  const selectedState = watch("location");

  // 🧠 Special users who can view all countries and states
  const specialUserEmails = [
    "allan.wono@gmail.com",
    "muskan.wono@gmail.com",
    "shawnsilveira.wono@gmail.com",
    "mehak.wono@gmail.com",
    "savita.wono@gmail.com",
    "k@k.k",
    "gourish.wono@gmail.com",
    "vishal.wono@gmail.com",
  ];

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
  //     label: item.country
  //       ? item.country.charAt(0).toUpperCase() + item.country.slice(1)
  //       : "",
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

  // Countries only visible to special users
  // const specialCountries = ["americac"]; // lowercase preferred

  // // Specific restricted locations within special countries
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
          item.continent?.toLowerCase() === selectedContinent?.toLowerCase(),
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

  const countryOptions = useMemo(() => allCountryOptions, [allCountryOptions]);

  // Build location options with same restriction logic
  const filteredLocation = locations.find(
    (item) => item.country?.toLowerCase() === selectedCountry?.toLowerCase(),
  );

  const locationOptions = useMemo(() => {
    return (
      filteredLocation?.states?.map((item) => ({
        label: item.name,
        value: item.name?.toLowerCase(),
      })) || []
    );
  }, [filteredLocation]);

  const skeletonArray = Array.from({ length: 6 });
  const countOptions = [
    { label: "1 - 5", value: "1-5" },
    { label: "5 - 10", value: "5-10" },
    { label: "10 - 25", value: "10-25" },
    { label: "25+", value: "25+" },
  ];
  const typeLabels = {
    coworking: "Co-Working Spaces",
    coliving: "Co-Living Spaces",
    hostel: "Hostels",
    // privatestay: "Private Stays",
    workation: "Workation",
    cafe: "Cafes",
    default: (type) => `${type[0].toUpperCase() + type.slice(1)} Spaces`,
  };
  // Removed handleShowMoreClick as it's replaced by horizontal scroll navigation
  const { data: listingsData, isPending: isLisitingLoading } = useQuery({
    queryKey: ["globallistings", formData], // ✅ ensures it refetches when formData changes
    queryFn: async () => {
      const { country, location, category } = formData || {};

      const response = await axios.get(
        `company/companiesn?country=${country}&state=${location}&userId=${userId || ""
        }`,
      );

      // return response.data;
      return Array.isArray(response.data)
        ? response.data?.filter((item) => item?.companyType !== "privatestay")
        : [];
    },
    enabled: !!formData?.country && !!formData?.location, // ✅ prevents fetching on empty state
    refetchOnMount: "always", // ✅ forces refetch on every mount
  });

  const sortedListings = useMemo(() => {
    if (!listingsData || listingsData.length === 0) return [];
    return [...listingsData].sort(
      (a, b) => (b.ratings || 0) - (a.ratings || 0),
    );
  }, [listingsData]);

  // derive categoryOptions from API response
  const categoryOptions = useMemo(() => {
    if (!listingsData || listingsData.length === 0) return [];

    const uniqueTypes = [
      ...new Set(
        listingsData
          .filter((item) => item.companyType !== "privatestay")
          .map((item) => item.companyType)
          .filter(Boolean),
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

    // define desired order
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

  const groupedListings = sortedListings?.reduce((acc, item) => {
    if (!acc[item.companyType]) acc[item.companyType] = [];
    acc[item.companyType].push(item);
    return acc;
  }, {});

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

  const navigate = useNavigate();
  const onSubmit = (data) => {
    locationData(data);
    setShowMobileSearch(false);
  };
  useEffect(() => {
    setValue("continent", formData.continent);
    setValue("country", formData.country);
    setValue("location", formData.location);
    setValue("count", formData.count);
  }, [formData]);
  const { mutate: locationData, isPending: isLocation } = useMutation({
    mutationFn: async (data) => {
      dispatch(setFormValues(data));
      // use data directly here, not formData from Redux
      navigate(`/verticals?country=${data.country}&location=${data.location}`);
      setShowMobileSearch(false);
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

    setShowMobileSearch(false);
    setShowListings(false);

    navigate(
      `/listings?country=${formData.country}&location=${formData.location}&category=${state.category}`,
      {
        state: {
          country: formData.country,
          location: formData.location,
          category: categoryValue,
        },
      },
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
      reviews: item.reviewCount,
      // rating: item.ratings
      //   ? (() => {
      //       const avg =
      //         item.reviews.reduce((sum, r) => sum + r.starCount, 0) /
      //         item.reviews.length;
      //       return avg % 1 === 0 ? avg : avg.toFixed(1);
      //     })()
      //   : "0",
      rating: item.ratings || 0,
      reviews: item.totalReviews || 0,

      image:
        item.images?.[0]?.url ||
        "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
    }));

  return (
    <>
      <Helmet>
        <title>Nomads | Explore Global Co-working & Stay Listings</title>
        <meta
          name="description"
          content="Discover top-rated coworking spaces, hostels, cafes, and workation stays across the world. Browse verified listings with reviews, maps, and amenities for digital nomads."
        />
        <meta
          name="keywords"
          content="digital nomads, coworking map, global listings, workation, hostels, cafes, coliving, remote work, Goa, stay and work"
        />
        <meta
          property="og:title"
          content="Nomads | Explore Global Co-working & Stay Listings"
        />
        <meta
          property="og:description"
          content="Explore the world’s best coworking and coliving spaces on the Nomads global map — find, compare, and connect instantly."
        />
        <meta property="og:image" content="/images/map-preview.jpeg" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://nomad.wono.co/verticals" />
      </Helmet>
      <div className="flex flex-col gap-2 lg:gap-6">
        <div className="flex flex-col gap-4 justify-center items-center  w-full lg:mt-0">
          <div className="w-full lg:min-w-[82%] max-w-[80rem] lg:max-w-[80rem] mx-0 md:mx-auto px-4 sm:px-6 lg:px-0">
            <div className="hidden lg:flex flex-col gap-4 justify-between items-center">
              {/* the 5 icons */}

              <div className=" w-3/4 pb-4">
                <div className="flex justify-between items-center">
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

              {/* Search Form */}
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

            <div className="lg:hidden w-full flex flex-col gap-4 mb-4">
              {/* Category Selection Row - HORIZONTAL SCROLL ON MOBILE */}
              <div className="flex overflow-x-auto snap-x snap-mandatory custom-scrollbar-hide gap-1 pb-2">
                {categoryOptions.map((cat) => {
                  const iconSrc = newIcons[cat.value];
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryClick(cat.value)}
                      className="flex-shrink-0 snap-start text-black px-2 py-2 hover:text-black transition flex items-center justify-center w-[30%]"
                    >
                      <div className="h-10 w-full flex flex-col items-center gap-1">
                        <img
                          src={iconSrc}
                          alt={cat.label}
                          className="h-full w-[90%] object-contain"
                        />
                        <span className="text-[10px] font-medium whitespace-nowrap">{cat.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowMobileSearch((prev) => !prev)}
                className="bg-white shadow-md flex items-center w-[92%] mx-auto text-center justify-center font-medium text-secondary-dark border-2 px-6 py-2 rounded-full flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  <IoSearch className="text-primary-red" />
                  <span className="text-sm">
                    Search Results in{" "}
                    {formData?.location?.charAt(0).toUpperCase() +
                      formData?.location?.slice(1) || "Unknown"}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500">
                  {formData?.count || "1-5"} Nomads
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
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-start justify-center lg:hidden"
              >
                <motion.div className="bg-white shadow-2xl overflow-auto p-4 rounded-b-3xl  h-screen  w-full">
                  <div className="flex justify-between items-center mb-10">
                    <div>&nbsp;</div>
                    <h3 className="text-xl font-semibold">Search</h3>
                    <button
                      onClick={() => {
                        setShowMobileSearch(false);
                      }}
                      className="text-gray-500 text-xl p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      &times;
                    </button>
                  </div>
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

          {/* Floating Search Button for Mobile */}
          {/* {!showMobileSearch && (
            <div className="lg:hidden fixed top-24 left-1/2 -translate-x-1/2 z-[40] w-[90%] max-w-[400px]">
              <button
                onClick={() => setShowMobileSearch(true)}
                className="w-full bg-white shadow-xl rounded-full py-3 px-4 flex items-center justify-between border border-gray-100 hover:scale-[1.02] transition-transform active:scale-95"
                style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}
              >
                <div className="flex flex-col items-start overflow-hidden flex-1">
                  <span className="text-xs font-semibold text-gray-800 truncate w-full text-left">
                    {formData?.location || "Anywhere"} • {formData?.category || "Any type"} • {formData?.count || "Any guests"}
                  </span>
                </div>
                <div className="bg-[#FF5757] p-2 rounded-full text-white ml-3 flex-shrink-0">
                  <IoSearch size={18} />
                </div>
              </button>
            </div>
          )} */}
        </div>
        <div className="lg:container lg:mx-auto lg:px-6">
          <div className="">
            <div className="font-semibold text-md  grid grid-cols-9 gap-4 pt-3">
              <div className="hidden lg:block custom-scrollbar-hide lg:col-span-5">
                {isLisitingLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                ) : (
                  <div className="col-span-full mb-6">
                    <PaginatedGrid
                      data={isLisitingLoading ? skeletonArray : sortedListings}
                      allowScroll={false}
                      entriesPerPage={9}
                      persistPage={true} // 👈 persists page number
                      persistKey="verticalsListingsPage"
                      columns={`grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-x-5`}
                      renderItem={(item, index) =>
                        isLisitingLoading ? (
                          <Box key={index} className="w-full h-full">
                            <Skeleton
                              variant="rectangular"
                              height={200}
                              sx={{ borderRadius: 2 }}
                            />
                            <Skeleton
                              variant="text"
                              width="80%"
                              sx={{ mt: 1 }}
                            />
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
                              showVertical={true}
                              handleNavigation={() =>
                                navigate(
                                  `/listings/${encodeURIComponent(
                                    item.companyName,
                                  )}`,
                                  {
                                    state: {
                                      companyId: item.companyId,
                                      type: item.companyType || "ss",
                                    },
                                  },
                                )
                              }
                            />
                          </motion.div>
                        )
                      }
                    />
                  </div>
                )}
              </div>
              <div className="col-span-full lg:col-span-4 fixed inset-0 lg:relative lg:inset-auto lg:h-[calc(100vh-100px)] lg:h-[68%] lg:pb-10 z-0">
                <div className="h-full w-full lg:rounded-xl overflow-hidden">
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
        </div>
        {/* Listings in the bottom */}
        <AnimatePresence>
          {!showMobileSearch && (
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.05}
              onDragEnd={(_, info) => {
                const isDraggingDown = info.offset.y > 60 || info.velocity.y > 600;
                const isDraggingUp = info.offset.y < -60 || info.velocity.y < -600;
                if (isDraggingDown) {
                  setShowListings(false);
                } else if (isDraggingUp) {
                  setShowListings(true);
                }
              }}
              initial={{ y: "100%" }}
              animate={{
                y: showListings ? "0%" : "65%",
              }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, velocity: 2 }}
              className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-50 px-6 rounded-t-[24px] lg:hidden h-[85vh]`}
            >
              <div
                className="flex justify-center py-4 sticky top-0 z-10 bg-white cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowListings((prev) => !prev);
                }}
              >
                <div className="w-12 h-1.5 rounded-full bg-gray-300"></div>
              </div>

              <div
                className={`custom-scrollbar-hide py-6 overscroll-contain transition-all duration-300 ${showListings ? "overflow-y-auto h-[calc(85vh-70px)]" : "overflow-hidden mb-10"
                  }`}
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                }}
              >
                {isLisitingLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                ) : groupedListings &&
                  Object.keys(groupedListings).length > 0 ? (
                  Object.entries(groupedListings).map(([type, items]) => {
                    const prioritizedCompanies = ["MeWo", "BIZ Nest"];
                    const sortedItems = items.sort((a, b) => {
                      const aPriority = prioritizedCompanies.includes(
                        a.companyName,
                      )
                        ? 0
                        : 1;
                      const bPriority = prioritizedCompanies.includes(
                        b.companyName,
                      )
                        ? 0
                        : 1;
                      return (
                        aPriority - bPriority ||
                        (b.ratings || 0) - (a.ratings || 0)
                      );
                    });

                    const hasMore = sortedItems.length > 5;
                    const itemsToShow = hasMore ? sortedItems.slice(0, 5) : sortedItems;
                    const location =
                      formData?.location?.charAt(0).toUpperCase() +
                      formData?.location?.slice(1);

                    const sectionTitle = `Popular ${typeLabels[type] || typeLabels.default(type)
                      } in ${location || ""}`;

                    return (
                      <HorizontalScrollWrapper title={sectionTitle}>
                        {itemsToShow.map((item) => (
                          <div
                            key={item._id}
                            className="w-[calc(85%-0.5rem)] md:w-[calc(33.33%-1.25rem)] lg:w-[calc(20%-1.5rem)] flex-shrink-0 snap-start"
                          >
                            <ListingCard
                              item={item}
                              handleNavigation={() =>
                                navigate(
                                  `/listings/${encodeURIComponent(
                                    item.companyName,
                                  )}`,
                                  {
                                    state: {
                                      companyId: item.companyId,
                                      type: item.companyType,
                                    },
                                  },
                                )
                              }
                            />
                          </div>
                        ))}
                        {hasMore && (
                          <div className="w-[calc(85%-0.5rem)] md:w-[calc(33.33%-1.25rem)] lg:w-[calc(20%-1.5rem)] flex-shrink-0 snap-start">
                            <button
                              onClick={() => handleCategoryClick(type)}
                              className="w-full aspect-square border-2 border-gray-100 rounded-3xl
               flex flex-col items-center justify-start pt-12 gap-3
               hover:border-primary-blue hover:shadow-md
               transition-all bg-gray-50/30 group"
                            >
                              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                  />
                                </svg>
                              </div>
                              <span className="text-lg font-medium text-gray-600 group-hover:text-gray-900">
                                View All
                              </span>
                            </button>
                          </div>
                        )}
                      </HorizontalScrollWrapper>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center text-sm text-gray-500 border border-dotted rounded-lg p-4">
                    No listings found.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating List Toggle Button */}
      < div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000]" >
        <button
          onClick={() =>
            navigate(
              `/verticals?country=${formData?.country}&location=${formData?.location}`,
            )
          }
          className="bg-[#222222] text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition-transform active:scale-95"
        >
          <span className="text-sm font-semibold tracking-wide">Show list</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            aria-hidden="true"
            role="presentation"
            focusable="false"
            style={{
              display: "block",
              height: "16px",
              width: "16px",
              fill: "white",
            }}
          >
            <path d="M7 10h18v2H7zm0 5h18v2H7zm0 5h18v2H7z"></path>
          </svg>
        </button>
      </div >
    </>
  );
};

export default GlobalListingsMap;
