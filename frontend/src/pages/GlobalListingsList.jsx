import { MenuItem, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
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

const GlobalListingsList = () => {
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
  const user = auth?.user || {};
  const userId = auth?.user?._id || auth?.user?.id;
  const selectedCountry = watch("country");
  const selectedState = watch("location");

  // 🧠 Special users who can see all locations
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

  // const { data: locations = [], isLoading: isLocations } = useQuery({
  //   queryKey: ["locations"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get("company/company-locations");
  //       return Array.isArray(response.data) ? response.data : [];
  //     } catch (error) {
  //       console.error(error?.response?.data?.message);
  //     }
  //   },
  // });
  const { data: locations = [], isLoading: isLocations } = useQuery({
    queryKey: ["locations", user?.email],
    queryFn: async () => {
      try {
        const response = await axios.get("company/company-locations");
        const rawData = Array.isArray(response.data) ? response.data : [];

        const userEmail = user?.email?.toLowerCase();
        const isSpecialUser = specialUserEmails.includes(userEmail);

        // 🧠 Special users can see everything
        if (isSpecialUser) return rawData;

        // 🚫 For regular users:
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
  // -------------------------------------
  // 🔒 Country filtering based on user email
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

  // const specialLocationMap = {
  //   america: ["americal", "americani"], // lowercase names
  // };

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

  const selectedLocationLabel = useMemo(() => {
    if (!formData?.location) return "";
    const normalizedLocation = formData.location.toLowerCase();
    return (
      locationOptions.find(
        (option) => option.value?.toLowerCase() === normalizedLocation,
      )?.label || formData.location
    );
  }, [formData?.location, locationOptions]);

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
  //   { label: "Meetings", value: "meetingRoom" },
  //   { label: "Cafe’s", value: "cafe" },
  // ];
  const typeOrder = [
    "coworking",
    "hostel",
    "workation",
    "privateStay",
    "coliving",
    "meetingRoom",
    "cafe",
  ];
  console.log("formData", formData);
  // Removed handleShowMoreClick as it's replaced by horizontal scroll

  const { data: listingsData, isPending: isLisitingLoading } = useQuery({
    queryKey: ["globallistings", formData], // ✅ ensures it refetches when formData changes
    queryFn: async () => {
      const { country, location, category } = formData || {};

      const response = await axios.get(
        `company/companiesn?country=${country}&state=${location}&userId=${userId || ""
        }`,
      );

      // return response.data;
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!formData?.country && !!formData?.location, // ✅ prevents fetching on empty state
    refetchOnMount: "always", // ✅ forces refetch on every mount
  });

  console.log("location data :", listingsData);

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

  const groupedListings = listingsData?.reduce((acc, item) => {
    if (item.companyType === "privatestay") return acc;
    if (!acc[item.companyType]) acc[item.companyType] = [];
    acc[item.companyType].push(item);
    return acc;
  }, {});

  console.log("frou[ed ", groupedListings);

  const typeLabels = {
    coworking: "Co-Working Spaces",
    coliving: "Co-Living Spaces",
    hostel: "Hostels",
    privatestay: "Private Stays",
    meetingroom: "Meeting Rooms",
    cafe: "Cafes",
    // fallback for unknown types
    default: (type) => `${type[0].toUpperCase() + type.slice(1)} Spaces`,
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

  const navigate = useNavigate();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const onSubmit = (data) => {
    locationData(data);
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
      setShowMobileSearch(false);
      navigate(`/verticals?country=${data.country}&location=${data.location}`);
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
  // Prioritize BIZ Nest and MeWo first, then sort the rest by rating descending
  const prioritizedCompanies = ["BIZ Nest", "MeWo"];
  const sortedListings = [...(listingsData || [])].sort((a, b) => {
    const aIsPriority = prioritizedCompanies.includes(a.companyName);
    const bIsPriority = prioritizedCompanies.includes(b.companyName);

    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;

    // If both are priority or both are not, then sort by average rating descending
    // const aRating =
    //   a.reviews?.length > 0
    //     ? a.reviews.reduce((sum, r) => sum + r.starCount, 0) / a.reviews.length
    //     : 0;
    // const bRating =
    //   b.reviews?.length > 0
    //     ? b.reviews.reduce((sum, r) => sum + r.starCount, 0) / b.reviews.length
    //     : 0;

    const aRating = Number(a.ratings || 0);
    const bRating = Number(b.ratings || 0);

    return bRating - aRating;
  });

  return (
    <>
      <Helmet>
        <title>Explore Work, Stay & Cafe Spaces | Nomads</title>
        <meta
          name="description"
          content="Discover top coworking spaces, hostels, cafes, and private stays in your chosen destination. Work, live, and connect with global nomads."
        />
        <meta
          name="keywords"
          content="digital nomads, coworking spaces, hostels, workation, cafes, private stays, remote work Goa"
        />
        <meta property="og:title" content="Explore Nomad Spaces | Nomads" />
        <meta
          property="og:description"
          content="Find inspiring spaces to work, stay, and connect with other digital nomads across the globe."
        />
        <meta property="og:image" content="/images/homepage.jpeg" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://wono.co/verticals" />
      </Helmet>
      <div className="flex flex-col gap-2 lg:gap-6">
        <div className="flex flex-col gap-4 justify-center items-center  w-full lg:mt-0">
          <div className="w-full lg:min-w-[82%] max-w-[80rem] lg:max-w-[80rem] mx-0 md:mx-auto px-4 sm:px-6 lg:px-0">
            <div className="hidden lg:flex flex-col gap-4 justify-between items-center w-full h-full">
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
            {/* div change */}
            <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory custom-scrollbar-hide gap-1 pb-4 flex md:justify-center">
              {categoryOptions.map((cat) => {
                const iconSrc = newIcons[cat.value];
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryClick(cat.value)}
                    className="flex-shrink-0 snap-start text-black px-2 py-2 hover:text-black transition flex items-center justify-center w-[28%] sm:w-[20%] md:w-[15%] lg:w-[10%]"
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
          </div>
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                // initial={{ y: "-100%" }}
                // animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl overflow-auto z-50 p-4 rounded-t-3xl lg:hidden h-[100dvh]"
              >
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
            )}
          </AnimatePresence>
        </div>
        {/* <hr /> */}
        <Container padding={false}>
          <div className="">
            <div className="font-semibold text-md">
              <div className=" custom-scrollbar-hide">
                {/* Popular section */}
                {isLisitingLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                ) : groupedListings &&
                  Object.keys(groupedListings).length > 0 ? (
                  Object.entries(groupedListings)
                    .sort(([typeA], [typeB]) => {
                      const typeOrder = [
                        "coworking",
                        "hostel",
                        "workation",
                        "privatestay",
                        "coliving",
                        "meetingroom",
                        "cafe",
                      ];
                      const indexA = typeOrder.indexOf(typeA);
                      const indexB = typeOrder.indexOf(typeB);
                      return (
                        (indexA === -1 ? 999 : indexA) -
                        (indexB === -1 ? 999 : indexB)
                      );
                    })
                    .map(([type, items]) => {
                      const prioritizedCompanies = ["BIZ Nest", "MeWo"];

                      const sortedItems = [...items].sort((a, b) => {
                        const aPriorityIndex = prioritizedCompanies.indexOf(
                          a.companyName,
                        );
                        const bPriorityIndex = prioritizedCompanies.indexOf(
                          b.companyName,
                        );

                        // Both are priority companies
                        if (aPriorityIndex !== -1 && bPriorityIndex !== -1) {
                          return aPriorityIndex - bPriorityIndex; // BIZ Nest (0) before MeWo (1)
                        }

                        // Only a is priority
                        if (aPriorityIndex !== -1) return -1;

                        // Only b is priority
                        if (bPriorityIndex !== -1) return 1;

                        // Fallback: sort by rating
                        // const aRating =
                        //   a.reviews?.length > 0
                        //     ? a.reviews.reduce(
                        //         (sum, r) => sum + r.starCount,
                        //         0,
                        //       ) / a.reviews.length
                        //     : 0;
                        // const bRating =
                        //   b.reviews?.length > 0
                        //     ? b.reviews.reduce(
                        //         (sum, r) => sum + r.starCount,
                        //         0,
                        //       ) / b.reviews.length
                        //     : 0;

                        const aRating = Number(a.ratings || 0);
                        const bRating = Number(b.ratings || 0);

                        return bRating - aRating;
                      });

                      const displayItems = sortedItems;
                      const hasMore = displayItems.length > 5;
                      const itemsToShow = hasMore ? displayItems.slice(0, 5) : displayItems;

                      // We now use horizontal scroll navigation instead of View More
                      const sectionTitle = `Popular ${typeLabels[type] || typeLabels.default(type)
                        } in ${selectedLocationLabel}`;

                      return (
                        <HorizontalScrollWrapper title={sectionTitle}>
                          {itemsToShow.map((item) => (
                            <div
                              key={item._id}
                              className="w-[calc(85%-0.5rem)] md:w-[calc(33.33%-1.825rem)] lg:w-[calc(20%-1.5rem)] flex-shrink-0 snap-start"
                            >
                              <ListingCard
                                item={item}
                                showVertical={false}
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
                            <div className="w-[calc(85%-0.5rem)] md:w-[calc(33.33%-1.825rem)] lg:w-[calc(20%-1.5rem)] flex-shrink-0 snap-start">
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
            </div>
          </div>
        </Container>
      </div>

      {/* Floating Map Toggle Button */}
      < div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000]" >
        <button
          onClick={() =>
            navigate(
              `/verticals?country=${formData?.country}&location=${formData?.location}&view=map`,
            )
          }
          className="bg-[#222222] text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition-transform active:scale-95"
        >
          <span className="text-sm font-semibold tracking-wide">Show map</span>
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
            <path d="M31.25 3.75a2.29 2.29 0 0 0-1.01-1.44A2.29 2.29 0 0 0 28.5 2L21 3.67l-10-2L2.5 3.56A2.29 2.29 0 0 0 .7 5.8v21.95a2.28 2.28 0 0 0 1.06 1.94A2.29 2.29 0 0 0 3.5 30L11 28.33l10 2 8.49-1.89a2.29 2.29 0 0 0 1.8-2.24V4.25a2.3 2.3 0 0 0-.06-.5zM12.5 25.98l-1.51-.3L9.5 26H9.5V4.66l1.51-.33 1.49.3v21.34zm10 1.36-1.51.33-1.49-.3V6.02l1.51.3L22.5 6h.01v21.34z"></path>
          </svg>
        </button>
      </div >
    </>
  );
};

export default GlobalListingsList;
