import React, { useState } from "react";
import Container from "../components/Container";
import { NavLink } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { Controller, useForm } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PrimaryButton from "../components/PrimaryButton";
import { useMutation } from "@tanstack/react-query";
import SecondaryButton from "../components/SecondaryButton";
import icons from "../assets/icons";
import Amenities from "../components/Amenities";

const Product = () => {
  const companyImages = [
    {
      _id: 1,
      url: "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
    },
    {
      _id: 2,
      url: "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
    },
    {
      _id: 3,
      url: "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
    },
    {
      _id: 4,
      url: "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
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
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      email: "",
      type: "",
      numberOfDesks: 0,
      startDate: null,
      endDate: null,
    },
  });

  const { mutate: submitEnquiry, isPending: isSubmitting } = useMutation({
    mutationKey: ["submitEnquiry"],
    mutation: async (data) => {
      console.log(data);
    },
    onSuccess: (data) => {},
    onError: (error) => {},
  });

  const [selectedImage, setSelectedImage] = useState(companyImages[0]);

  return (
    <div>
      <Container>
        <div className="flex flex-col gap-4">
          <div className="flex w-full justify-between">
            <h1 className="text-title font-semibold">BIZ Nest Co-Working</h1>
            <NavLink className={"text-small underline"}>Save</NavLink>
          </div>

          {/* Image Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
            {/* Main Image */}
            <div className="w-full h-full overflow-hidden rounded-md">
              <img
                src={selectedImage.url}
                className="w-full h-full object-cover"
                alt="Selected"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-2 gap-1">
              {companyImages.map((item) => (
                <div
                  key={item._id}
                  className={`w-full h-60 overflow-hidden rounded-md cursor-pointer border-2 ${
                    selectedImage._id === item._id
                      ? "border-primary-dark"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(item)}
                >
                  <img
                    src={item.url}
                    alt="company-thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* About and Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <div className="w-full h-36 overflow-hidden rounded-md">
                <img
                  src={
                    "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp"
                  }
                  alt="company-logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-sm text-gray-700">
                <MdLocationOn className="inline-block text-lg text-primary-dark mr-1" />
                Sunteck Kanaka Corporate Park, 701 A, 701 B, 601 A, 601 B, 501 A
                & 501 B, Patto Centre, Panaji, Goa 403001
              </div>
              <h1 className="text-title uppercase font-semibold">about</h1>
              <p className="text-tiny">
                BIZ Nest ( Business with a Nest ) is the way of our Future
                Lifestyle! As data and trends indicate, our ecosystem has
                already started witnessing a strong and focused nomad community
                which has relocated and activated its lifestyle from aspiring
                destinations across the world and this community is growing
                bigger every year. Bold founders, professionals and even
                salaried individuals have quit their busy city lifestyle and
                have started living a healthy and happy lifestyle in smaller
                towns. We are building the bridge for these nomads by helping
                them settle in an aspiring destination like Goa via our
                fully-stack solution by providing co-working, co living and
                workations to ensure their HAPPINESS!
              </p>
              <p className="text-tiny">
                We are an early adapted platform of our FUTURE Lifestyle which
                we are confident will get fully activated in the global
                ecosystem by the end of this decade. We are the only Destination
                Based Lifestyle Subscription Platform in India targeted to
                become a ​National Destination Based Lifestyle Subscription
                Platform by the end of this decade due to our first mover
                advantage.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="border-2 rounded-xl flex gap-4 items-center p-4">
                <div className="text-tiny w-1/4">
                  <p>Guest</p>
                  <p>favorite</p>
                </div>
                <div className="w-full">
                  <p className="text-tiny text-nowrap">
                    One of the most loved homes on WoNo, according to guests
                  </p>
                </div>
                <div className="flex w-1/2 gap-4 justify-end">
                  <div className="flex flex-col gap-1 justify-center items-center">
                    <p className="text-tiny">4.89</p>
                    <span className="text-tiny">stars here</span>
                  </div>
                  <div className="flex flex-col gap-1 justify-center items-center">
                    <p className="text-tiny">28</p>
                    <span className="text-tiny">Reviews</span>
                  </div>
                </div>
              </div>
              <div className="shadow-xl flex flex-col gap-4 p-6 rounded-md border-2">
                <h1 className="text-card-title font-semibold">
                  Enquire & Recieve Quote
                </h1>
                <form
                  onSubmit={handleSubmit((data) => submitEnquiry(data))}
                  action=""
                  className="grid grid-cols-2 gap-4"
                >
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="First Name"
                        fullWidth
                        variant="standard"
                        size="small"
                      />
                    )}
                  />
                  <Controller
                    name="lasttName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Last Name"
                        fullWidth
                        variant="standard"
                        size="small"
                      />
                    )}
                  />
                  <Controller
                    name="mobileNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Mobile Number"
                        fullWidth
                        type="number"
                        variant="standard"
                        size="small"
                      />
                    )}
                  />
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email"
                        fullWidth
                        type="email"
                        variant="standard"
                        size="small"
                      />
                    )}
                  />
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Type"
                        fullWidth
                        variant="standard"
                        size="small"
                        select
                      >
                        <MenuItem value="" disabled>
                          <em>Select A Type</em>
                        </MenuItem>
                        <MenuItem value="cabin desk">Cabin Desk</MenuItem>
                      </TextField>
                    )}
                  />
                  <Controller
                    name="numberOfDesks"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Number of Desk"
                        fullWidth
                        variant="standard"
                        size="small"
                        select
                      >
                        <MenuItem value="" disabled>
                          <em>Select Number of Desk</em>
                        </MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                      </TextField>
                    )}
                  />
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <DesktopDatePicker
                        {...field}
                        label="Start Date"
                        format="DD-MM-YYYY"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            variant: "standard",
                          },
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <DesktopDatePicker
                        {...field}
                        label="End Date"
                        format="DD-MM-YYYY"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            variant: "standard",
                          },
                        }}
                      />
                    )}
                  />

                  <SecondaryButton
                    title={"Get Quote"}
                    type={"submit"}
                    externalStyles={"col-span-2"}
                  />
                </form>
              </div>
            </div>
          </div>

          {/* Inclusions */}
          <div className="flex flex-col gap-8 w-full">
            <h1 className="text-title font-semibold uppercase">
              What Inclusion does it offers
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-28 gap-y-10">
              {amenities.map((item, index) => (
                <Amenities key={index} image={item.image} title={item.title} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Product;
