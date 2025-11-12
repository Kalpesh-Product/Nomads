import { useNavigate, useLocation } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { Controller, useForm } from "react-hook-form";
import Container from "../components/Container";
import Amenities from "../components/Amenities";
import icons from "../assets/icons";
import { ReactFitty } from "react-fitty";
import { useDispatch, useSelector } from "react-redux";
import { setFormValues } from "../features/locationSlice";
import Image from "/images/homepage.jpeg";
import ReviewCard from "../components/ReviewCard";
import { useMutation, useQuery } from "@tanstack/react-query";

import { AiOutlineHeart } from "react-icons/ai";
import SearchBarCombobox from "../components/SearchBarCombobox";
import newIcons from "../assets/newIcons";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import coworking from "/images/coworking-img.webp";
import hostels from "/images/hostels-img.webp";
import cafes from "/images/meetingrooms-img.webp";
import privateStay from "/images/privatestay-img.webp";
import companyWorkation from "/images/workation-img.webp";
import MuiModal from "../components/Modal";
import renderStars from "../utils/renderStarts";
import axios from "../utils/axios";
import { Helmet } from "@dr.pogodin/react-helmet";
import useAuth from "../hooks/useAuth"; // ensure you already have this import at top (you do ✅)

const Home = () => {
  const destinationData = [
    { label: "Co-Working", image: coworking },
    { label: "Hostels", image: hostels },
    { label: "Cafe’s & Meeting Rooms", image: cafes },
    { label: "Private Stay", image: privateStay },
    { label: "Company Workation", image: companyWorkation },
  ];
  const location = useLocation();
  // const { companyId, type } = location.state;

  const { auth } = useAuth();
  const user = auth?.user || {};
  const userId = auth?.user?._id || auth?.user?.id;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState([]);
  const formData = useSelector((state) => state.location.formValues);
  const { handleSubmit, control, reset, register, watch, setValue } = useForm({
    defaultValues: {
      country: "",
      location: "",
      count: "",
    },
  });
  const selectedCountry = watch("country");
  const selectedState = watch("location");
  // Sample options

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

  // -------------------------------------
  // 🧠 Special users who can see all locations
  // -------------------------------------
  const specialUserEmails = [
    "allan.wono@gmail.com",
    "muskan.wono@gmail.com",
    "shawnsilveira.wono@gmail.com",
    "mehak.wono@gmail.com",
    "savita.wono@gmail.com",
    "k@k.k",
  ];

  // -------------------------------------
  // 📍 Fetch and filter locations
  // -------------------------------------
  const { data: locations = [], isLoading: isLocations } = useQuery({
    queryKey: ["locations", user?.email],
    queryFn: async () => {
      try {
        const response = await axios.get("company/company-locations");
        const rawData = Array.isArray(response.data) ? response.data : [];

        const userEmail = user?.email?.toLowerCase();
        const isSpecialUser = specialUserEmails.includes(userEmail);

        if (isSpecialUser) return rawData;

        // 1) keep only public states per country
        // 2) drop countries that now have zero states
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

  useEffect(() => {
    // Reset country if it no longer exists
    const countryExists = locations.some(
      (c) => c.country?.toLowerCase() === selectedCountry?.toLowerCase()
    );
    if (!countryExists) {
      setValue("country", "");
      setValue("location", "");
      return;
    }

    // Reset location if it no longer exists in the chosen country
    const current = locations.find(
      (c) => c.country?.toLowerCase() === selectedCountry?.toLowerCase()
    );
    const locationExists = current?.states?.some(
      (s) => s.name?.toLowerCase() === selectedState?.toLowerCase()
    );
    if (!locationExists) {
      setValue("location", "");
    }
  }, [locations, selectedCountry, selectedState, setValue]);

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

  // Emails that can see special countries
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

  // // Specific restricted locations within those countries
  // const specialLocationMap = {
  //   america: ["americal", "americani"], // lowercase names
  // };

  // Build all countries
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

  // Filter countries based on user email
  const countryOptions = React.useMemo(
    () => allCountryOptions,
    [allCountryOptions]
  );

  // Build locations with same filtering logic
  const filteredLocation = locations.find(
    (item) => item.country?.toLowerCase() === selectedCountry?.toLowerCase()
  );

  const locationOptions = React.useMemo(() => {
    const baseLocations =
      filteredLocation?.states?.map((item) => ({
        label: item.name,
        value: item.name?.toLowerCase(),
      })) || [];
    return baseLocations;
  }, [filteredLocation]);

  const countOptions = [
    { label: "1 - 5", value: "1-5" },
    { label: "5 - 10", value: "5-10" },
    { label: "10 - 25", value: "10-25" },
    { label: "25+", value: "25+" },
  ];

  const reviewData = [
    {
      name: "Neelam Mulla",
      location: "India",
      rating: 5,
      message:
        "This place provides a productive environment. Great amenities like high-speed internet, comfortable seating good location. Plus, it is a break from isolation and can boost creativity and motivation. Do consider this space if your on a workation or simply need a great space to work from. Very helpful staff as well!",
    },
    {
      name: "Shelton Rodrigues",
      location: "USA",
      rating: 5,
      message:
        "One of the best co-working spaces in goa, suitable for all workation and work related activities. The staff are friendly and helpful and overall an amazing experience.",
    },
    {
      name: "Sushil Pandey",
      location: "Dubai",
      rating: 5,
      message:
        "These guys have done a fantastic job with stay and food arrangements. They also provided an office area for us to work together. I appreciate a hard work the team has put to make our experience enjoyable. Highly recommended for teams planning workation in Goa! !",
    },
    {
      name: "Kamal Pandey",
      location: "USA",
      rating: 5,
      message:
        "BIZNest hosted our 4 days workation at artistry suites goa, the service and setup was awesome, and the team was also very helpful.",
    },
    {
      name: "Aastha Sangle",
      location: "Dubai",
      rating: 5,
      message:
        "I am extremely pleased with my workspace. It is exceptionally clean and comfortable, providing a perfect environment for productivity. The ambiance is pleasant, with ample light and well-designed interiors. The facilities, including the meeting rooms and common areas, are well-maintained and thoughtfully equipped. I genuinely enjoy being here and find it conducive to both focus and creativity. Overall, it is a great place to work and be around.",
    },

    {
      name: "Pawan Sharma",
      location: "India",
      rating: 5,
      message:
        "Biz Nest is a modern co-working space that offers a seamless working environment..with a great view, too! The founders, Abrar and Kashif, along with the team make working here a warm, friendly and productive experience. Kudos!",
    },
  ];

  const { mutate: locationData, isPending: isLocation } = useMutation({
    mutationFn: async (data) => {
      dispatch(setFormValues(data));
      navigate(`verticals?country=${data.country}&state=${data.location}`);
    },
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });
  const avatarConfigs = [
    {
      alt: "Consultant 1",
      src: "",
      transform: "scale(1.1)",
    },
    {
      alt: "Consultant 2",
      src: "",
      transform: "scale(1.5) translate(0px, 10px)",
    },
    {
      alt: "Consultant 3",
      src: "",
      transform: "scale(1.1) translate(3px, 2px)",
    },
  ];
  const amenities = [
    { image: icons.desk, title: "PRIVATE DESK", isAvailable: true },
    { image: icons.privatestorage, title: "Private Storage" },
    { image: icons.aircondition, title: "AC" },
    { image: icons.fastinternet, title: "High Speed Wi-Fi" },
    { image: icons.itsupport, title: "IT SUPPORT" },
    { image: icons.teacoffee, title: "Tea & Coffee" },
    { image: icons.receptionsupport, title: "RECEPTION" },
    { image: icons.adminsupport, title: "ADMIN SUPPORT" },
    { image: icons.housekeeping, title: "HOUSEKEEPING" },
    { image: icons.community, title: "COMMUNITY" },
    { image: icons.maintenance, title: "MAINTANANCE" },
    { image: icons.generator, title: "POWER BACKUP" },
    { image: icons.meetingrooms, title: "MEETING ROOM" },
    { image: icons.cafedining, title: "CAFETERIA" },
    { image: icons.printingservices, title: "PRINTING" },
    { image: icons.secure, title: "CCTV SECURE" },
    { image: icons.television, title: "SMART TV" },
    { image: icons.purifiedwater, title: "PURIFIED WATER" },
    { image: icons.pool, title: "SWIMMING POOL" },
    { image: icons.customsolutions, title: "SOLUTIONS" },
    // { image: icons.rentbikecar, title: "CAR / BIKE / BUS" },
    // { image: icons.television, title: "TELEVISION" },
    // { image: icons.stationery, title: "STATIONERY" },
    // { image: icons.laundry, title: "LAUNDRY" },
    // { image: icons.secure, title: "SECURE" },
    // { image: icons.personalised, title: "PERSONALISED" },
    // { image: icons.parking, title: "PARKING" },
    // { image: icons.yogazone, title: "YOGA ZONE" },
    // { image: icons.ergonomicenvironment, title: "Ergonomic Environment" },
    // { image: icons.officesupplies, title: "Office Supplies" },
    // { image: icons.access24x7, title: "Access 24 x 7" },
    // { image: icons.signboard, title: "Sign Board" },
  ];
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const onSubmit = (data) => {
    locationData(data);
  };

  return (
    <>
      <Helmet>
        <title>Nomads | Work, Stay & Connect Globally</title>
        <meta
          name="description"
          content="Join the largest global community of digital nomads. Find coworking spaces, hostels, cafes, and private stays designed for remote work and collaboration."
        />
        <meta
          name="keywords"
          content="digital nomads, coworking Goa, remote work, workation, global community"
        />
        <meta property="og:title" content="Nomads | Work, Stay & Connect" />
        <meta
          property="og:description"
          content="Work, stay, and connect with digital nomads worldwide."
        />
        <meta property="og:image" content="/images/homepage.jpeg" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://wono.co/" />
      </Helmet>
      <div className="flex flex-col w-full">
        <div className="min-w-[82%] max-w-[80rem] lg:max-w-[80rem] mx-0 lg:mx-auto px-6 sm:px-6 lg:px-0">
          <div className="py-12  hidden lg:block">
            <div className="flex flex-col  gap-4 justify-between items-center">
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
          <div className="lg:hidden flex w-full items-center justify-center my-4">
            <button
              onClick={() => setShowMobileSearch(true)}
              className="bg-white flex items-center w-full text-gray-400 font-medium border-2 px-6 py-3 rounded-full"
            >
              <IoSearch className="inline mr-2" />
              Start Search
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
              className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 p-4 rounded-t-3xl h-[100dvh] lg:hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <div>&nbsp;</div>
                <h2 className="text-xl font-semibold">Search</h2>
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="text-gray-500 text-xl"
                >
                  &times;
                </button>
              </div>

              <motion.div initial={{ y: "-100%" }} animate={{ y: "0%" }}>
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
          <section className="w-full   bg-white pb-12">
            <div className=" flex flex-col tab:flex-col lg:flex-row items-strech justify-between h-full gap-12">
              {/* Left: Text */}
              <div className="lg:w-1/2 flex flex-col h-full justify-between gap-5 text-center md:text-start">
                <div className=" font-light text-primary-blue text-center font-play leading-relaxed lg:space-y-6 lg:leading-normal">
                  <div className="text-center">
                    <h1 className="text-[clamp(1rem,13.71vw,6rem)] text-nowrap">
                      Building the
                    </h1>
                  </div>
                  <div className="text-title ">
                    <h1 className="text-[clamp(1.7rem,3.4vw,4rem)] text-nowrap">
                      <span className="font-medium"> Largest Community of</span>
                    </h1>
                  </div>
                  <div className="font-semibold">
                    <h1 className="text-[clamp(3.7rem,7.3vw,16rem)]">NOMADS</h1>
                  </div>
                </div>

                <div className="flex flex-col gap-4 text-start text-pretty lg:text-center">
                  <p className=" text-gray-700 text-base md:leading-7 md:text-[1.03rem]">
                    A global movement of remote workers, companies, creators,
                    entrepreneurs, hosts, investors who are redefining how the
                    world lives and works.
                  </p>
                  <p className=" text-gray-700 text-base md:leading-7 md:text-[1.03rem]">
                    Bound by freedom, flexibility, and connection, nomads are
                    building the future—one destination at a time.
                  </p>
                </div>
              </div>

              {/* Right: Image */}
              <div className="lg:w-1/2 h-[38rem]">
                <div className="rounded-md h-full overflow-hidden shadow-lg border border-purple-200">
                  <img
                    src={Image}
                    alt="Nomads working together"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        </Container>

        <section className="bg-black w-full flex flex-col gap-4 py-16 lg:py-16">
          <div className="lg:max-w-[80rem] lg:min-w-[85%] max-w-full lg:mx-auto flex flex-col text-primary-blue  justify-center items-center leading-none">
            <div className="flex flex-col text-center w-full font-hero px-4 md:px-0">
              <h1 className="text-giant uppercase">Introducing</h1>
              <h1 className="text-giant uppercase text-nowrap">N-COMMERCE</h1>
            </div>

            <p className="uppercase text-[clamp(2.5rem,7.3vw,7rem)] font-hero text-white pt-4 pb-20">
              ("nomad commerce")
            </p>
            {/* <div className="flex justify-center items-end w-full">
            <PrimaryButton title={"Partner now"} />
          </div> */}
            <div className="text-white w-full text-center px-4">
              <h2 className="text-clamp-heading font-normal">
                End-to-end Nomad solutions for working from aspiring
                destinations
              </h2>
            </div>
          </div>
        </section>
        {/*  */}
        <section className="w-full px-6 py-12 bg-gray-50">
          <div className="w-full min-w-[] max-w-[79rem] mx-auto lg:px-3">
            <h2 className="text-2xl md:text-3xl font-medium text-left mb-10 text-primary-blue uppercase">
              Solutions for your aspiring destinations.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 afterPro:grid-cols-5 gap-6">
              {destinationData.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-full sm:w-full md:w-full afterPro:w-60 flex flex-col items-center  ${
                    idx === destinationData.length - 1 &&
                    destinationData.length % 2 !== 0
                      ? "md:col-span-2 afterPro:col-span-1"
                      : ""
                  }`}
                >
                  <div className="relative w-full rounded-xl overflow-hidden shadow-md">
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-full h-96 object-cover"
                    />
                    {/* <div className="absolute top-2 left-2 bg-white text-xs font-medium text-gray-700 px-2 py-1 rounded-full shadow">
                    Guest favourite
                  </div> */}
                    {/* <div className="absolute top-2 right-2 shadow">
                    <AiOutlineHeart className="text-white text-xl" />
                  </div> */}
                  </div>
                  <p className="mt-6 text-sm md:text-base font-medium text-gray-800 text-center uppercase">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Container padding={false}>
          <div className="flex flex-col gap-8 w-full border-t-2 border-gray-300 py-8">
            <h2 className="text-2xl md:text-3xl font-medium text-left mb-10 text-primary-blue uppercase">
              Platform Inclusions.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-5 gap-x-16 md:gap-x-16 lg:gap-x-28 gap-y-10">
              {amenities.map((item, index) => (
                <Amenities
                  key={index}
                  image={item.image}
                  title={item.title}
                  isAvailable={true}
                />
              ))}
            </div>
          </div>
        </Container>
        <Container padding={false}>
          <div className="flex flex-col gap-8 w-full border-t-2 border-gray-300 py-8">
            <h1 className="text-title font-medium text-primary-blue uppercase">
              Happy customers.
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-0 lg:p-6">
              {reviewData.length > 0 ? (
                reviewData.map((review, index) => (
                  <ReviewCard
                    handleClick={() => {
                      setSelectedReview(review);
                      setOpen(true);
                    }}
                    key={index}
                    review={review}
                  />
                ))
              ) : (
                <div className="col-span-full border-2 border-dotted border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500 h-40 flex justify-center items-center">
                  No reviews yet.
                </div>
              )}
            </div>
          </div>
        </Container>
        <MuiModal open={open} onClose={() => setOpen(false)} title={"Review"}>
          <div className="flex flex-col gap-4">
            {/* Reviewer Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-blue flex items-center justify-center text-white font-semibold text-lg uppercase">
                {(
                  selectedReview?.reviewerName ||
                  selectedReview?.name ||
                  "Unknown"
                )
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-base">
                  {selectedReview?.reviewerName ||
                    selectedReview?.name ||
                    "Unknown"}
                </p>
                <p className="text-sm text-gray-500">{selectedReview?.date}</p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 text-black text-sm">
              {renderStars(selectedReview?.rating || selectedReview?.starCount)}
            </div>

            {/* Message */}
            <div className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">
              {selectedReview?.message ||
                selectedReview?.reviewText ||
                selectedReview?.description}
            </div>
          </div>
        </MuiModal>
      </div>
    </>
  );
};

export default Home;
