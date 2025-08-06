import React, { useState } from "react";
import Container from "../components/Container";
import { NavLink, useLocation } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { Controller, useForm } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PrimaryButton from "../components/PrimaryButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import SecondaryButton from "../components/SecondaryButton";
import icons from "../assets/icons";
import Amenities from "../components/Amenities";
import ReviewCard from "../components/ReviewCard";
import LeafRatings from "../components/LeafRatings";
import axios from "../utils/axios";
import renderStars from "../utils/renderStarts";
import relativeTime from "dayjs/plugin/relativeTime";
import MuiModal from "../components/Modal";
import Map from "../components/Map";
import LeafWrapper from "../components/LeafWrapper";

dayjs.extend(relativeTime);

const Product = () => {
  const location = useLocation();
  const { companyId, type } = location.state;
  const [selectedReview, setSelectedReview] = useState([]);
  console.log("selected : ", selectedReview);
  const [open, setOpen] = useState(false);
  console.log("company id", companyId);

  const { data: companyDetails, isPending: isCompanyDetails } = useQuery({
    queryKey: ["companyDetails", companyId],
    queryFn: async () => {
      const response = await axios.get(
        `common/individual-company?companyId=${companyId}&&type=${type}`
      );
      return response.data;
    },
    enabled: !!companyId && !!type,
  });

  console.log("companuDetials ", companyDetails);
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
  const inclusions = companyDetails?.inclusions || {};

  const amenities = Object.entries(inclusions)
    .filter(
      ([key, value]) =>
        value === true &&
        key !== "_id" &&
        key !== "__v" &&
        key !== "coworkingCompany" &&
        key !== "createdAt" &&
        key !== "updatedAt" &&
        key !== "transportOptions"
    )
    .map(([key]) => {
      const iconKey = key.toLowerCase();
      return {
        image: icons[iconKey] || "/icons/default.webp", // fallback if no icon
        title: key
          .replace(/([A-Z])/g, " $1") // Add space before capital letters
          .replace(/^./, (str) => str.toUpperCase()), // Capitalize first letter
      };
    });

  const transportOptions = inclusions.transportOptions || {};

  const transportAmenities = Object.entries(transportOptions)
    .filter(([key, value]) => value === true)
    .map(([key]) => ({
      image: icons[key.toLowerCase()] || "/icons/default.webp",
      title: key.charAt(0).toUpperCase() + key.slice(1),
    }));

  const allAmenities = [...amenities, ...transportAmenities];
  const total = allAmenities.length;
  const columns = 6;
  const remainder = total % columns;
  const lastRowStartIndex = remainder === 0 ? -1 : total - remainder;

  // Tailwind-safe col-span mapping for remainder values
  const colSpanSafeMap = {
    1: "lg:col-span-6",
    2: "lg:col-span-3",
    3: "lg:col-span-2",
    4: "lg:col-span-3 ",
    5: "lg:col-span-2",
  };

  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      email: "",
      type: "",
      numberOfDesks: 2,
      startDate: null,
      endDate: null,
    },
  });
  const {
    handleSubmit: handlesubmitSales,
    control: salesControl,
    reset: salesReset,
  } = useForm({
    defaultValues: {
      fullName: "",
      mobileNumber: "",
      email: "",
    },
  });

  const { mutate: submitEnquiry, isPending: isSubmitting } = useMutation({
    mutationKey: ["submitEnquiry"],
    mutationFn: async (data) => {
      console.log(data);
    },
    onSuccess: (data) => {},
    onError: (error) => {},
  });
  const { mutate: submitSales, isPending: isSubmittingSales } = useMutation({
    mutationKey: ["submitSales"],
    mutationFn: async (data) => {
      console.log(data);
    },
    onSuccess: (data) => {},
    onError: (error) => {},
  });

  const [selectedImage, setSelectedImage] = useState(companyImages[0]);

  const reviewData = isCompanyDetails
    ? []
    : companyDetails?.reviews.map((item) => ({
        ...item,
        stars: item.starCount,
        message: item.description,
        date: dayjs(item.createdAt).fromNow(),
      }));

  const forMapsData = {
    id: companyDetails?._id,
    lat: companyDetails?.latitude,
    lng: companyDetails?.longitude,
    name: companyDetails?.companyName,
    location: companyDetails?.city,
    reviews: companyDetails?.reviews.length,
    rating: companyDetails?.reviews?.length
      ? (() => {
          const avg =
            companyDetails?.reviews.reduce((sum, r) => sum + r.starCount, 0) /
            companyDetails?.reviews.length;
          return avg % 1 === 0 ? avg : avg.toFixed(1);
        })()
      : "0",
    image:
      "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp",
  };

  const mapsData = [forMapsData];

  return (
    <div>
      <Container padding={false}>
        <div className="flex flex-col gap-8">
          <div className="flex w-full justify-between">
            <h1 className="text-title font-semibold">
              {companyDetails?.companyName}
            </h1>
            <NavLink className={"text-small underline"}>Save</NavLink>
          </div>

          {/* Image Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 overflow-hidden">
            {/* Main Image */}
            <div className="w-full h-96 overflow-hidden rounded-md">
              <img
                src={selectedImage.url}
                className="w-full h-full object-cover"
                alt="Selected"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-2 gap-0">
              {companyImages.map((item) => (
                <div
                  key={item._id}
                  className={`w-full h-[12rem] overflow-hidden rounded-md cursor-pointer border-2 ${
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
              {/* <div className="text-sm lg:text-tiny text-gray-700">
                <MdLocationOn className="inline-block text-secondary text-subtitle mr-1" />
                {companyDetails?.address}
              </div> */}
              <h1 className="text-title uppercase font-semibold">about</h1>
              <p className="text-sm">
                {companyDetails?.about?.replace(/\\n/g, " ")}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="border-2 rounded-xl flex flex-col lg:flex-row gap-4 items-center p-4">
                <div className="text-tiny w-1/4">
                  <LeafWrapper height="3rem" width="4rem">
                    <div className="text-black font-semibold flex flex-col gap-1 items-center">
                      <span>Guest</span>
                      <span>Favorite</span>
                    </div>
                  </LeafWrapper>
                </div>
                <div className="w-full">
                  <p className="text-tiny ">
                    One of the most loved places on WoNo, according to guests
                  </p>
                </div>
                <div className="flex w-1/2 gap-4 justify-end">
                  <div className="flex flex-col gap-4 justify-center items-center">
                    <p className="text-subtitle lg:text-title">
                      {companyDetails?.ratings}
                    </p>
                    <span className="text-sm flex lg:text-small font-medium">
                      {renderStars(
                        companyDetails?.reviews.reduce(
                          (sum, r) => sum + r.starCount,
                          0
                        ) / companyDetails?.reviews?.length || 0
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 lg:gap-3 justify-center items-center">
                    <p className="text-subtitle lg:text-title mt-1">
                      {companyDetails?.reviews?.length || 0}
                    </p>
                    <span className="text-small font-medium">Reviews</span>
                  </div>
                </div>
              </div>

              <div className="shadow-md flex flex-col gap-4 p-6 rounded-xl border-2">
                <h1 className="text-card-title font-semibold leading-normal">
                  Enquire & Recieve Quote
                </h1>
                <form
                  onSubmit={handleSubmit((data) => submitEnquiry(data))}
                  action=""
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  <Controller
                    name="fullName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Full Name"
                        fullWidth
                        variant="standard"
                        size="small"
                      />
                    )}
                  />
                  <Controller
                    name="noOfPeople"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="No. Of People"
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
                  {companyDetails?.type === "coworking" && (
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
                  )}
                  {companyDetails?.type === "coworking" && (
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
                  )}
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
                    externalStyles={"col-span-1 lg:col-span-2"}
                  />
                </form>
              </div>
            </div>
          </div>
          <hr className="my-5 lg:my-10" />
          {/* Inclusions */}
          <div className="flex flex-col gap-8 w-full">
            <h1 className="text-title font-semibold">
              What Inclusion does it offers
            </h1>

            {allAmenities.length === 0 ? (
              <div className="w-full border-2 border-dotted border-gray-400 rounded-lg p-6 text-center text-gray-500">
                Inclusions not available
              </div>
            ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-24 gap-y-10">
              {allAmenities.map((item, index) => (
                <Amenities key={index} image={item.image} title={item.title} />
              ))}
            </div>
            )}
          </div>

          <hr className="my-5 lg:my-10" />
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col justify-center items-center max-w-4xl mx-auto">
              <h1 className="text-main-header font-medium mt-5">
                <LeafRatings
                  ratings={companyDetails?.ratings || 0}
                  align="items-start"
                />
              </h1>

              <p className="text-subtitle  my-4 font-medium">Guest favorite</p>
              <span className="text-content text-center">
                This place is a guest favourite based on <br /> ratings, reviews
                and reliability
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-0 lg:p-6">
              {companyDetails?.reviews?.length > 0 ? (
                companyDetails?.reviews?.slice(0, 6).map((review, index) => (
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

            <hr className="my-5 lg:my-10" />
            {/* Map */}
            <div className="w-full h-[500px] flex flex-col gap-8 rounded-xl overflow-hidden">
              <h1 className="text-title font-semibold">Where you'll be</h1>
              <Map locations={mapsData} />
            </div>
            <hr className="my-5 lg:my-10" />
            <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2 gap-10 pb-20">
              <div className="flex flex-col items-center col-span-1 border-2 shadow-md gap-4 rounded-xl p-4 w-full">
                <div className="flex flex-col gap-4 justify-center items-center">
                  <div className="h-20 w-20 overflow-hidden rounded-full">
                    <img
                      src="/images/bg-image.jpg"
                      alt="poc image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center space-y-3">
                    <h1 className="text-title font-semibold">
                      {companyDetails?.pocs?.name || "Unknown"}
                    </h1>
                    <p className="text-content">
                      {companyDetails?.pocs?.designation || "Unknown"}
                    </p>
                  </div>
                </div>
                <hr />
                <div>
                  <p className="text-subtitle mb-4">Host Details</p>
                  <ul className="list-disc pl-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 gap-x-4 text-small">
                      <li>Response rate: 100%</li>
                      <li>Speaks English, Hindi and Punjabi</li>
                      <li>Responds within an hour</li>
                      <li>Lives in Velha, Goa</li>
                    </div>
                  </ul>
                </div>
              </div>
              <div className="flex w-full border-2 shadow-md">
                <div className="flex flex-col  h-full gap-4 rounded-xl p-6 w-full lg:w-full justify-between">
                  <h1 className="text-title font-semibold">Connect With Us</h1>
                  <form
                    onSubmit={handlesubmitSales((data) => submitSales(data))}
                    className="grid grid-cols-1 gap-4"
                  >
                    <Controller
                      name="fullName"
                      control={salesControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Full Name"
                          fullWidth
                          variant="standard"
                          size="small"
                        />
                      )}
                    />
                    <Controller
                      name="mobileNumber"
                      control={salesControl}
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
                      control={salesControl}
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

                    <SecondaryButton
                      title={"Submit"}
                      type={"submit"}
                      externalStyles={"mt-6"}
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <MuiModal open={open} onClose={() => setOpen(false)} title={"Review"}>
        <div className="flex flex-col gap-4">
          {/* Reviewer Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-white font-semibold text-lg uppercase">
              {selectedReview?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-base">{selectedReview?.name}</p>
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
  );
};

export default Product;
