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
import { useState } from "react";
import coworking from "/images/coworking-img.webp";
import hostels from "/images/hostels-img.webp";
import cafes from "/images/meetingrooms-img.webp";
import privateStay from "/images/privatestay-img.webp";
import companyWorkation from "/images/workation-img.webp";

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

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.location.formValues);
  const { handleSubmit, control, reset, register, watch } = useForm({
    defaultValues: {
      country: "",
      location: "",
      count: "",
    },
  });
  const selectedCountry = watch("country");
  const selectedState = watch("location");
  // Sample options
  const countryOptions = [
    { label: "India", value: "india" },
    // { label: "Bali", value: "bali" },
  ];
  const locationOptions = [{ label: "Goa", value: "goa" }];
  const countOptions = [
    { label: "1 - 5", value: "1-5" },
    { label: "5 - 10", value: "5-10" },
    { label: "10 - 25", value: "10-25" },
    { label: "25+", value: "25+" },
  ];

  // const { data: companyDetails, isPending: isCompanyDetails } = useQuery({
  //   queryKey: ["companyDetails", companyId],
  //   queryFn: async () => {
  //     const response = await axios.get(
  //       `common/individual-company?companyId=${companyId}&&type=${type}`
  //     );
  //     return response.data;
  //   },
  //   enabled: !!companyId && !!type,
  // });

  // Reviews
  // const reviewData = isCompanyDetails
  //   ? []
  //   : companyDetails?.reviews.map((item) => ({
  //       ...item,
  //       stars: item.starCount,
  //       message: item.description,
  //       date: dayjs(item.createdAt).fromNow(),
  //     }));

  const reviewData = [
    {
      name: "Aayushi",
      avatar: "https://i.pravatar.cc/50?img=1",
      duration: "3 years on Airbnb",
      stars: 5,
      date: "2 days ago",
      message:
        "One of the best Airbnbs I’ve stayed at. Loved everything about it, from the stay, to the helpful staff at the place, Bhaskar, to the thoughtfulness they’ve put behind...",
    },
    {
      name: "Vinay",
      avatar: "https://i.pravatar.cc/50?img=2",
      duration: "3 years on Airbnb",
      stars: 5,
      date: "2 weeks ago",
      message:
        "Our caretaker Bhaskar was really responsive and helped a lot. The stay itself is quite good and peaceful. It’s quite secured and we loved the views as well. Good neighborhood...",
    },
    {
      name: "Ankush",
      avatar: "https://i.pravatar.cc/50?img=3",
      duration: "New to Airbnb",
      stars: 5,
      date: "2 weeks ago",
      message:
        "My recent Airbnb stay was absolutely wonderful, thanks to the incredibly helpful host and staff. They were always available and went above and beyond to assist with anything...",
    },
    {
      name: "Irine",
      avatar: "https://i.pravatar.cc/50?img=4",
      duration: "2 years on Airbnb",
      stars: 5,
      date: "April 2025",
      message:
        "The stay was comfortable and had everything we needed. The kitchen was well-equipped with all utensils, making things very convenient. We also received room service...",
    },
    {
      name: "Aayushi",
      avatar: "https://i.pravatar.cc/50?img=1",
      duration: "3 years on Airbnb",
      stars: 5,
      date: "2 days ago",
      message:
        "One of the best Airbnbs I’ve stayed at. Loved everything about it, from the stay, to the helpful staff at the place, Bhaskar, to the thoughtfulness they’ve put behind...",
    },

    {
      name: "Ankush",
      avatar: "https://i.pravatar.cc/50?img=3",
      duration: "New to Airbnb",
      stars: 5,
      date: "2 weeks ago",
      message:
        "My recent Airbnb stay was absolutely wonderful, thanks to the incredibly helpful host and staff. They were always available and went above and beyond to assist with anything...",
    },
  ];

  const { mutate: locationData, isPending: isLocation } = useMutation({
    mutationFn: async (data) => {
      dispatch(setFormValues(data));
      navigate(`${data.country}/${data.location}`);
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
    { image: icons.workspace, title: "WORKSPACE" },
    { image: icons.livingspace, title: "LIVING SPACE" },
    { image: icons.aircondition, title: "AIR CONDITION" },
    { image: icons.fastinternet, title: "FAST INTERNET" },
    { image: icons.cafedining, title: "CAFE / DINING" },
    { image: icons.receptionist, title: "RECEPTIONIST" },
    { image: icons.meetingrooms, title: "MEETING ROOMS" },
    { image: icons.trainingrooms, title: "TRAINING ROOMS" },
    { image: icons.itsupport, title: "IT SUPPORT" },
    { image: icons.teacoffee, title: "TEA & COFFEE" },
    { image: icons.assist, title: "ASSIST" },
    { image: icons.community, title: "COMMUNITY" },
    { image: icons.ondemand, title: "ON DEMAND" },
    { image: icons.maintenance, title: "MAINTANANCE" },
    { image: icons.generator, title: "GENERATOR" },
    { image: icons.pickupdrop, title: "PICKUP & DROP" },
    { image: icons.rentbikecar, title: "CAR / BIKE / BUS" },
    { image: icons.housekeeping, title: "HOUSEKEEPING" },
    { image: icons.pool, title: "SWIMMING POOL" },
    { image: icons.television, title: "TELEVISION" },
    { image: icons.gas, title: "GAS" },
    { image: icons.laundry, title: "LAUNDRY" },
    { image: icons.secure, title: "SECURE" },
    { image: icons.personalised, title: "PERSONALISED" },
    { image: icons.parking, title: "PARKING" },
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
    <div className="flex flex-col w-full">
      <Container padding={false}>
        <div className="py-8  hidden lg:block">
          <div className="flex flex-col  gap-4 justify-between items-center">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className=" flex justify-around md:w-full lg:w-3/4 border-2 bg-gray-50 rounded-full p-0 items-center">
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
        <div className="lg:hidden flex w-full items-center justify-center my-4">
          <button
            onClick={() => setShowMobileSearch(true)}
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
            className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 p-4 rounded-t-3xl h-[50vh] lg:hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Search</h3>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="text-gray-500 text-xl">
                &times;
              </button>
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

      <Container padding={false}>
        <section className="w-full   bg-white pb-12">
          <div className=" flex flex-col lg:flex-row items-strech justify-between h-full gap-12">
            {/* Left: Text */}
            <div className="lg:w-1/2 flex flex-col h-full justify-between gap-10 text-center md:text-start">
              <div className="text-3xl md:text-7xl lg:text-7xl font-light text-primary-blue text-center font-play leading-relaxed lg:space-y-6 lg:leading-normal">
                <div className="text-center">
                  <span className="text-[4rem] font-medium">Building the</span>
                </div>
                <div className="text-title font-medium">
                  <ReactFitty>Largets Community of</ReactFitty>
                </div>
                <div className="font-semibold">
                  <ReactFitty>NOMADS</ReactFitty>
                </div>
              </div>

              <div className="flex flex-col gap-4 text-start text-pretty lg:text-center">
                <p className=" text-gray-700 text-base md:text-lg">
                  A global movement of remote workers, companies, creators,
                  entrepreneurs, hosts, investors who are redefining how the
                  world lives and works.
                </p>
                <p className=" text-gray-700 text-base md:text-lg">
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
          <div className="flex flex-col w-full font-hero px-4 md:px-0">
            <ReactFitty>INTRODUCING</ReactFitty>
            <ReactFitty>N-COMMERCE</ReactFitty>
          </div>

          <p className="uppercase text-mobile-main-header lg:text-9xl font-hero text-white pt-4 pb-20">
            ("nomad commerce")
          </p>
          {/* <div className="flex justify-center items-end w-full">
            <PrimaryButton title={"Partner now"} />
          </div> */}
          <div className="text-white w-full text-center">
            <ReactFitty className="text-mobile-header font-medium">
              End-to-end Nomad solutions for working from aspiring destinations
            </ReactFitty>
          </div>
        </div>
      </section>
      {/*  */}
      <section className="w-full px-6 py-12 bg-gray-50">
        {/* <div className="max-w-7xl mx-auto"> */}
        {/* <div className="min-w-[85%] max-w-[80rem] lg:max-w-[80rem] mx-0 md:mx-auto px-6 sm:px-6 lg:px-0 lg:py-0 py-0"> */}
        {/* <div className="min-w-[90%] max-w-[91rem] lg:max-w-[91rem] mx-0 md:mx-auto px-6 sm:px-6 lg:px-0 lg:py-0 py-0"> */}
        <div className="w-[90%] max-w-[91rem] mx-auto lg:px-3 2xlplus:w-[88%] 2xlplus:max-w-[95rem] ">
          {/* <div className="w-[90%] max-w-[91rem] mx-auto px-4 sm:w-[95%] xs:w-[97%]"> */}
          <h2 className="text-2xl md:text-3xl font-medium text-left mb-10 text-gray-700">
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
                }`}>
                <div className="relative w-full rounded-xl overflow-hidden shadow-md ">
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
                <p className="mt-2 text-sm md:text-base font-medium text-gray-800 text-center uppercase">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Container padding={false}>
        <div className="flex flex-col gap-8 w-full border-t-2 border-gray-300 py-8">
          <h2 className="text-2xl md:text-3xl font-medium text-left mb-10 text-gray-700">
            Platform Inclusions.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-5 gap-x-16 md:gap-x-16 lg:gap-x-28 gap-y-10">
            {amenities.map((item, index) => (
              <Amenities key={index} image={item.image} title={item.title} />
            ))}
          </div>
        </div>
      </Container>
      <Container padding={false}>
        <div className="flex flex-col gap-8 w-full border-t-2 border-gray-300 py-8">
          <h1 className="text-title font-semibold ">Happy customers.</h1>
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
    </div>
  );
};

export default Home;
