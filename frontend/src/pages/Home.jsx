import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { IoSearch } from "react-icons/io5";

import { Controller, useForm } from "react-hook-form";
import { FaSearch } from "react-icons/fa";

import Container from "../components/Container";
import { FaRegListAlt } from "react-icons/fa";
import Amenities from "../components/Amenities";
import Carousel from "../components/Carousel";
import icons from "../assets/icons";
import { AiFillStar } from "react-icons/ai";
import { ReactFitty } from "react-fitty";
import { useDispatch, useSelector } from "react-redux";
import { setFormValues } from "../features/locationSlice";
import axios from "../utils/axios";
import { IoIosArrowDown } from "react-icons/io";
import Select from "react-dropdown-select";
import Image from "/images/homepage.jpeg";
import ReviewCard from "../components/ReviewCard";
import { useMutation, useQuery } from "@tanstack/react-query";

import { AiOutlineHeart } from "react-icons/ai";
import coworking from "/images/bg-image.jpg";
import hostels from "/images/bg-image.jpg";
import cafes from "/images/bg-image.jpg";
import privateStay from "/images/bg-image.jpg";
import companyWorkation from "/images/bg-image.jpg";
import SearchBarCombobox from "../components/SearchBarCombobox";

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
  const selectedCountry = watch("country")
  const selectedState = watch("location")
  // Sample options
  const countryOptions = [{ label: "India", value: "india" }];
  const locationOptions = [{ label: "Goa", value: "goa" }];
  const countOptions = [
    { label: "0 - 10", value: "0 - 10" },
    { label: "10 - 20", value: "10 - 20" },
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
  const featureSections = [
    {
      icon: <FaRegListAlt />,
      points: [
        "Serves as a dynamic platform, seamlessly connecting freelance professionals, remote workers, and individuals seeking flexible workspace solutions with nearby co-working spaces.",
      ],
      title: "Listing",
      bgColor: "bg-[#fef7de]",
      link: {
        to: "#",
        label: "View more >>",
      },
    },
    {
      icon: <FaRegListAlt />,
      points: [
        "Serves as a dynamic platform, seamlessly connecting freelance professionals, remote workers, and individuals seeking flexible workspace solutions with nearby co-working spaces.",
      ],
      title: "Booking",
      bgColor: "bg-[#fbfed5]",
      link: {
        to: "#",
        label: "View more >>",
      },
    },
    {
      icon: <FaRegListAlt />,
      points: [
        "Serves as a dynamic platform, seamlessly connecting freelance professionals, remote workers, and individuals seeking flexible workspace solutions with nearby co-working spaces.",
      ],
      title: "Community",
      bgColor: "bg-[#f4fede]",
      link: {
        to: "#",
        label: "View more >>",
      },
    },
    {
      icon: <FaRegListAlt />,
      points: [
        "Serves as a dynamic platform, seamlessly connecting freelance professionals, remote workers, and individuals seeking flexible workspace solutions with nearby co-working spaces.",
      ],
      title: "Communication",
      bgColor: "bg-[#defede]",
      link: {
        to: "#",
        label: "View more >>",
      },
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
  ];
  const carouselItems = [
    {
      image:
        // "https://images.unsplash.com/photo-1581090700227-1e8a28add49c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      title: "CO-WORKING",
    },
    {
      image:
        // "https://images.unsplash.com/photo-1572120360610-d971b9b78827?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      title: "CO-LIVING",
    },
    {
      image:
        // "https://images.unsplash.com/photo-1607083207630-9b22b38138f4?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      title: "WORKATION",
    },
    {
      image:
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      title: "VILLAS",
    },
    {
      image:
        // "https://images.unsplash.com/photo-1616627983135-3b2dc0d9dd75?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      title: "MEETING ROOM",
    },
  ];
  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  return (
    <div className="flex flex-col w-full">
      <Container>
        <div className="py-4  ">
          <div className="flex flex-col gap-4 justify-between items-center">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className=" flex justify-between w-3/4 border-2 bg-gray-50 rounded-full p-0 items-center"
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
                className="w-fit h-full  bg-pink-600 text-white p-5 text-subtitle rounded-full"
              >
                <IoSearch />
              </button>
            </form>
          </div>
        </div>
      </Container>

      <Container padding={false}>
        <section className="w-full   bg-white pb-12">
          <div className=" mx-auto flex flex-col md:flex-row items-center gap-12">
            {/* Left: Text */}
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl md:text-7xl lg:text-6xl font-light text-primary-blue lg:leading-snug text-center font-play pb-6">
                Building the <br />
                <span className="text-5xl md:text-6xl font-light text-primary-blue">
                  LARGEST
                </span>
                <br />
                COMMUNITY of <br />
                <span className="text-4xl md:text-5xl text-primary-blue">
                  NOMADS
                </span>
              </h2>
              <p className="mt-6 text-gray-700 text-base md:text-lg text-center">
                A global movement of remote workers, companies, <br />
                creators, entrepreneurs, hosts, investors who are
                <br />
                redefining how the world lives and works.
              </p>
              <p className="mt-4 text-gray-700 text-base md:text-lg text-center">
                Bound by freedom, flexibility, and connection, nomads <br /> are
                building the future—one destination at a time.
              </p>
            </div>

            {/* Right: Image */}
            <div className="md:w-1/2">
              <div className="rounded-md overflow-hidden shadow-lg border border-purple-200">
                <img
                  src={Image}
                  alt="Nomads working together"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </Container>

      {/* <Container padding={false}>
        <section className="flex flex-col gap-2 lg:mb-8 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4 justify-end items-start">
              <p className="uppercase font-semibold text-mobile-main-header lg:text-main-header lg:leading-normal">
                WORLDS NOMAD COMMUNITY
              </p>
              <span className="text-content lg:text-hero">
                Connecting Co-working Spaces and Flexible Workers
              </span>
            </div>
            <div className=" rounded-xl overflow-hidden">
              <div className="bg-[url('/images/bg-image.jpg')] bg-cover bg-center h-96 lg:h-full w-full rounded-md shadow-md flex items-end">
                <div className="bg-white/10 backdrop-blur-md p-4 w-full flex flex-col gap-4">
                  <span className="text-white text-small">
                    Serves as a dynamic platform, seamlessly connecting
                    freelance professionals, remote workers, and individuals
                    seeking flexible workspace
                  </span>
                  <hr />
                  <div className="flex items-center gap-2">
                    <div className="py-3 px-4 rounded-3xl bg-white">
                      <div className="flex items-center gap-4 ">
                        <div className="flex">
                          <span className="text-yellow-300">
                            <AiFillStar size={16} />
                          </span>
                          <span className="text-yellow-300">
                            <AiFillStar size={16} />
                          </span>
                          <span className="text-yellow-300">
                            <AiFillStar size={16} />
                          </span>
                          <span className="text-yellow-300">
                            <AiFillStar size={16} />
                          </span>
                          <span className="text-gray-400">
                            <AiFillStar size={16} />
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-black">4.0</p>
                      </div>
                    </div>
                    <NavLink
                      className={"text-white text-small hover:underline"}>
                      View More Reviews
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 h-full lg:h-48">
              <div className="flex flex-col gap-4 h-full justify-between">
                <div className="bg-white text-black flex justify-center items-center">
                  {" "}
                  <div className="flex justify-start md:justify-center lg:justify-start items-center -space-x-4 w-full mt-4">
                    {avatarConfigs.map((config, index) => (
                      <Avatar
                        key={index}
                        alt={config.alt}
                        src={config.src}
                        sx={{
                          width: { xs: 60, md: 90, lg: 103 },
                          height: { xs: 60, md: 90, lg: 103 },
                          border: "2px solid white",
                          "& img": {
                            transform: config.transform,
                            transformOrigin: "center center",
                            objectFit: "contain",
                          },
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-start md:justify-center lg:justify-start items-center">
                  <SecondaryButton title={"BOOK YOUR SPACE NOW"} />
                </div>
              </div>
              <div className="flex flex-col gap-4 h-full justify-between">
                <div className="bg-white text-black border-l-2 border-black pl-4">
                  <p className="text-small">
                    Serves as a dynamic platform, seamlessly connecting
                    freelance professionals, remote workers, and individuals
                    seeking flexible workspace solutions with nearby co-working
                    spaces
                  </p>
                </div>
                <div className="flex justify-start lg:justify-start items-center">
                  <AccentButton title={"LIST YOUR BUSINESS"} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 justify-between">
              <form
                onSubmit={handleSubmit((data) => locationData(data))}
                className="flex gap-2 border-2 border-primary-blue rounded-full pl-4 h-10 lg:h-16 justify-between items-center bg-white">
                <div className="relative w-full">
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={countryOptions}
                        onChange={(values) => field.onChange(values[0]?.value)}
                        values={countryOptions.filter(
                          (opt) => opt.value === field.value
                        )}
                        placeholder="Select A Country"
                        color="#0000"
                        dropdownPosition="bottom"
                        className="w-3/4 text-sm"
                        style={{
                          border: "none",
                          background: "transparent",
                          boxShadow: "none",
                          fontSize: "0.875rem",
                          padding: "0.5rem",
                          color: "black",
                          cursor: "pointer",
                        }}
                      />
                    )}
                  />
                </div>

                <div className="relative w-full border-l-2 border-l-primary-blue">
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={locationOptions}
                        onChange={(values) => field.onChange(values[0]?.value)}
                        values={locationOptions.filter(
                          (opt) => opt.value === field.value
                        )}
                        placeholder="Select A Location"
                        dropdownPosition="bottom"
                        className="w-3/4 text-sm"
                        style={{
                          border: "none",
                          background: "transparent",
                          boxShadow: "none",
                          fontSize: "0.875rem",
                          padding: "0.5rem",
                          cursor: "pointer",
                        }}
                      />
                    )}
                  />
                </div>

                <div className="relative w-full border-l-2 border-l-primary-blue pl-2">
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={categoryOptions}
                        onChange={(values) => field.onChange(values[0]?.value)}
                        values={categoryOptions.filter(
                          (opt) => opt.value === field.value
                        )}
                        placeholder="Select A Category"
                        dropdownPosition="bottom"
                        className="w-3/4 text-sm"
                        style={{
                          border: "none",
                          background: "transparent",
                          boxShadow: "none",
                          fontSize: "0.875rem",
                          padding: "0.5rem",
                          cursor: "pointer",
                        }}
                      />
                    )}
                  />
                </div>

                <div className="bg-primary-blue h-full w-3/4 flex justify-center rounded-r-full">
                  <button
                    type="submit"
                    disabled={isLocation}
                    className="h-full text-center w-full flex justify-center items-center text-white">
                    <FaSearch className="text-lg" /> &nbsp; Search
                  </button>
                </div>
              </form>

              <div>
                <div className="grid grid-cols-3 text-center text-sm font-medium relative">
                  <div className="p-4 text-tiny">Co – Working</div>
                  <div className="p-4 text-tiny border-l border-r border-black">
                    Co – Living
                  </div>
                  <div className="p-4 text-tiny">Workation</div>

                  <div className="absolute left-0 right-0 border-t border-black top-1/2" />

                  <div className="p-4 text-tiny">Exclusive Campus</div>
                  <div className="p-4 text-tiny border-l border-r border-black">
                    Meeting Room
                  </div>
                  <div className="p-4 text-tiny">Conferences</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Container> */}

      <section className="bg-black w-full flex flex-col gap-4 py-16 lg:py-16">
        <div className="lg:w-[80rem] max-w-[80rem] mx-auto flex flex-col text-primary-blue  justify-center items-center leading-none">
          {/* <h1 className="text-mobile-mega-header font-hero lg:leading-none lg:text-mega-header font-medium">
            INTRODUCING
          </h1> */}
          <ReactFitty className="font-hero">INTRODUCING</ReactFitty>
          <ReactFitty className="font-hero">N-COMMERCE</ReactFitty>
          {/* <h1 className="text-mobile-mega-header font-hero lg:leading-none lg:text-mega-header font-medium">
            N-COMMERCE
          </h1> */}
          <p className="uppercase text-mobile-main-header lg:text-9xl font-hero text-white pt-4 pb-20">
            ("nomad commerce")
          </p>
          {/* <div className="flex justify-center items-end w-full">
            <PrimaryButton title={"Partner now"} />
          </div> */}
          <div className="text-white w-full text-center ">
            <ReactFitty className="text-mobile-header lg:text-4xl font-normal">
              End-to-end Nomad solutions for working from aspiring destinations
            </ReactFitty>
          </div>
        </div>
      </section>

      {/* <Container padding>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:grid-cols-[1fr_1px_1fr] gap-y-6 lg:gap-x-12">
          <div className="w-full flex flex-col gap-4">
            <h1 className="text-title font-semibold text-center uppercase pb-10">
              WONO for Nomads
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-0">
              {featureSections.map((section, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-4 rounded-xl p-3 ${
                    section.bgColor || "bg-white"
                  }`}>
                  <div className="flex flex-col gap-4">
                    <span className="text-title pl-6">{section.icon}</span>
                    <ul className="list-disc pl-6">
                      {section.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                    <h3 className="text-subtitle font-medium pl-2">
                      {section.title}
                    </h3>
                  </div>
                </div>
              ))}
              <div className="flex justify-center items-center w-full col-span-1 lg:col-span-2 mt-4">
                <NavLink to={"#"} className="text-primary-dark text-tiny">
                  View More {">>"}
                </NavLink>
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-px bg-gray-300 h-full mx-auto" />

          <div className="w-full flex flex-col gap-4">
            <h1 className="text-title font-semibold text-center uppercase pb-10">
              WONO for Business
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-0">
              {featureSections.map((section, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-4 rounded-xl p-3 ${
                    section.bgColor || "bg-white"
                  }`}>
                  <div className="flex flex-col gap-4">
                    <span className="text-title pl-6">{section.icon}</span>
                    <ul className="list-disc pl-6">
                      {section.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                    <h3 className="text-subtitle font-medium pl-2">
                      {section.title}
                    </h3>
                  </div>
                </div>
              ))}
              <div className="flex justify-center items-center w-full col-span-1 lg:col-span-2 mt-4">
                <NavLink to={"#"} className="text-primary-dark text-tiny">
                  View More {">>"}
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </Container> */}

      {/* <div className="lg:max-w-[80rem] min-w-[85%] lg:mx-auto  flex flex-col gap-4 md:px-10 px-6 border-t-2 border-gray-300 pt-16 pb-16">
        <h1 className="  lg:text-title font-semibold text-title pb-8">
          Solutions for your aspiring destinations.
        </h1>
        <div>
          <Carousel carouselItems={carouselItems} />
        </div>

  
      </div> */}

      {/*  */}
      <section className="w-full px-6 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium text-left mb-10 text-gray-700">
            Solutions for your aspiring destinations.
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {destinationData.map((item, idx) => (
              <div
                key={idx}
                className="w-44 sm:w-52 md:w-56 lg:w-56 flex flex-col items-center"
              >
                <div className="relative w-full rounded-xl overflow-hidden shadow-md">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-full h-80 object-cover"
                  />
                  {/* <div className="absolute top-2 left-2 bg-white text-xs font-medium text-gray-700 px-2 py-1 rounded-full shadow">
                    Guest favourite
                  </div> */}
                  <div className="absolute top-2 right-2 shadow">
                    <AiOutlineHeart className="text-white text-xl" />
                  </div>
                </div>
                <p className="mt-2 text-sm md:text-base font-medium text-gray-800 text-center">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Container>
        <div className="flex flex-col gap-8 w-full border-t-2 border-gray-300 py-8">
          <h1 className="text-title font-semibold ">Platform inclusions.</h1>
          <div className="grid grid-cols-2 md:grid-cols-4  lg:grid-cols-6 gap-x-16 md:gap-x-16 lg:gap-x-28 gap-y-10">
            {amenities.map((item, index) => (
              <Amenities key={index} image={item.image} title={item.title} />
            ))}
          </div>
        </div>
      </Container>
      <Container>
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
