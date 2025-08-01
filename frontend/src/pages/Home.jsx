import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import AccentButton from "../components/AccentButton";
import { Avatar, MenuItem, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { CiSearch } from "react-icons/ci";
import Container from "../components/Container";
import { FaRegListAlt } from "react-icons/fa";
import Amenities from "../components/Amenities";
import Carousel from "../components/Carousel";
import icons from "../assets/icons";
import { AiFillStar } from "react-icons/ai";

const Home = () => {
  const navigate = useNavigate();
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      country: "",
      location: "",
      category: "",
    },
  });
  const { mutate: locationData, isPending: isLocation } = useMutation({
    mutationFn: async (data) => {
      console.log("data", data);
      navigate("listings");
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
    { image: icons.airconditioner, title: "AIR CONDITION" },
    { image: icons.internet, title: "FAST INTERNET" },
    { image: icons.cafe, title: "CAFE / DINING" },
    { image: icons.receptionist, title: "RECEPTIONIST" },
    { image: icons.meetingroom, title: "MEETING ROOMS" },
    { image: icons.trainingroom, title: "TRAINING ROOMS" },
    { image: icons.itsupport, title: "IT SUPPORT" },
    { image: icons.teacoffe, title: "TEA & COFFEE" },
    { image: icons.privateassistant, title: "ASSIST" },
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

  return (
    <div className="flex flex-col w-full">
      <section className="flex flex-col gap-2 lg:mb-8 max-w-[85rem] mx-auto pb-4">
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
                  Serves as a dynamic platform, seamlessly connecting freelance
                  professionals, remote workers, and individuals seeking
                  flexible workspace
                </span>
                <hr />
                <div className="flex items-center gap-2">
                  <div className="py-3 px-4 rounded-3xl bg-white">
                    {/* <span>Ratings here</span> */}
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
                  <NavLink className={"text-white text-small hover:underline"}>
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
                {/* Consultant Avatars */}
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
                  Serves as a dynamic platform, seamlessly connecting freelance
                  professionals, remote workers, and individuals seeking
                  flexible workspace solutions with nearby co-working spaces
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
              className="flex gap-2 items-center border-2 border-primary-blue rounded-full pl-4 overflow-hidden">
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
                    slotProps={{ input: { disableUnderline: true } }}>
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
                    slotProps={{ input: { disableUnderline: true } }}>
                    <MenuItem value="" disabled>
                      Select A Location
                    </MenuItem>
                    <MenuItem value="goa">Goa</MenuItem>
                  </TextField>
                )}
              />
              <div className="w-full border-l-2 border-l-primary-blue px-2 ">
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
                      slotProps={{ input: { disableUnderline: true } }}>
                      <MenuItem value="" disabled>
                        Select A Category
                      </MenuItem>
                      <MenuItem value="coWorking">Co-Working</MenuItem>
                    </TextField>
                  )}
                />
              </div>
              <div className="bg-primary-blue h-full flex justify-center">
                <button
                  type="submit"
                  className="h-full text-center w-32 flex justify-center items-center text-white">
                  <CiSearch /> &nbsp;&nbsp; Search
                </button>
              </div>
            </form>

            <div>
              <div className="grid grid-cols-3 text-center text-sm font-medium relative">
                {/* Top Row */}
                <div className="p-4 text-tiny">Co – Working</div>
                <div className="p-4 text-tiny border-l border-r border-black">
                  Co – Living
                </div>
                <div className="p-4 text-tiny">Workation</div>

                {/* Horizontal Divider */}
                <div className="absolute left-0 right-0 border-t border-black top-1/2" />

                {/* Bottom Row */}
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

      <section className="bg-black w-full flex flex-col gap-4 py-16 lg:py-16">
        <div className="max-w-7xl mx-auto flex flex-col text-primary  justify-center items-center ">
          <h1 className="text-mobile-mega-header font-hero lg:leading-none lg:text-mega-header font-medium">
            INTRODUCING
          </h1>
          <h1 className="text-mobile-mega-header font-hero lg:leading-none lg:text-mega-header font-medium">
            N-COMMERCE
          </h1>
          <p className="uppercase text-mobile-main-header lg:text-mega-desc font-hero">
            ("nomad commerce")
          </p>
          <div className="flex justify-center items-end w-full">
            <PrimaryButton title={"Partner now"} />
          </div>
        </div>
      </section>
      <Container padding>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:grid-cols-[1fr_1px_1fr] gap-y-6 lg:gap-x-12">
          {/* Section: WONO for Nomads */}
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

          {/* Divider */}
          <div className="hidden lg:block w-px bg-gray-300 h-full mx-auto" />

          {/* Section: WONO for Business */}
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
      </Container>

      <div className="lg:max-w-[85rem] lg:mx-auto  flex flex-col gap-4 md:px-10 px-4 border-t-2 border-gray-300 py-8">
        <h1 className=" uppercase lg:text-title font-semibold text-title pb-8">
          We have solutions for your needs.....
        </h1>
        <div>
          <Carousel carouselItems={carouselItems} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-card-title lg:text-[6rem] leading-normal uppercase font-semibold">
              Exclusive villas
            </h1>
            <p className="text-subtitle leading-none lg:text-[2.5rem] font-medium">
              {" "}
              250+ Villas all over country
            </p>
          </div>
          <div className="flex flex-col gap-4 py-6 border-b-2 border-black">
            <p className="text-[1.8rem]">
              Serves as a{" "}
              <span className="font-semibold">dynamic platform</span>,
              seamlessly connecting freelance professionals, remote workers, and
              individuals seeking{" "}
              <span className="font-semibold">
                flexible workspace solutions
              </span>{" "}
              with nearby{" "}
              <span className="font-semibold">co-working spaces.</span>
            </p>
            <span className="text-content">
              <ul className="list-disc pl-6 text-gray-500">
                <li>
                  Serves as a dynamic platform, seamlessly connecting freelance
                  professionals, remote workers, and individuals seeking
                  flexible workspace solutions with nearby co-working spaces.
                </li>
              </ul>
            </span>
          </div>
        </div>
      </div>
      <Container>
        <div className="flex flex-col gap-8 w-full border-t-2 border-gray-300 py-8">
          <h1 className="text-title font-semibold uppercase">Our inclusions</h1>
          <div className="grid grid-cols-2 md:grid-cols-4  lg:grid-cols-6 gap-x-16 md:gap-x-16 lg:gap-x-28 gap-y-10">
            {amenities.map((item, index) => (
              <Amenities key={index} image={item.image} title={item.title} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Home;
