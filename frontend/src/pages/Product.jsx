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

dayjs.extend(relativeTime);

const Product = () => {
  const location = useLocation();
  const { companyId } = location.state;
  const [selectedReview, setSelectedReview] = useState([]);
  console.log("selected : ", selectedReview);
  const [open, setOpen] = useState(false);
  console.log("company id", companyId);
  const { data: companyDetails, isPending: isCompanyDetails } = useQuery({
    queryKey: ["companyDetails", companyId],
    queryFn: async () => {
      const response = await axios.get(
        `company/individual-company/${companyId}`
      );
      return response.data;
    },
    enabled: !!companyId,
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
            <div className="w-full h-full overflow-hidden rounded-md">
              <img
                src={selectedImage.url}
                className="w-full h-full object-cover"
                alt="Selected"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-2 gap-2">
              {companyImages.map((item) => (
                <div
                  key={item._id}
                  className={`w-full h-full overflow-hidden rounded-md cursor-pointer border-2 ${
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
              <div className="text-sm lg:text-tiny text-gray-700">
                <MdLocationOn className="inline-block text-secondary text-subtitle mr-1" />
                {companyDetails?.address}
              </div>
              <h1 className="text-title uppercase font-semibold">about</h1>
              <p className="text-sm">
                {companyDetails?.about?.replace(/\\n/g, " ")}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="border-2 rounded-xl flex flex-wrap lg:flex-nowrap gap-6 lg:gap-4 items-center p-4 h-full lg:h-36">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-title font-semibold">Guest favorite</p>
                    <p></p>
                  </div>
                  <div className="w-full">
                    <p className="text-content lg:text-small lg:text-nowrap text-start lg:text-start">
                      One of the most loved homes on WoNo, according to guests
                    </p>
                  </div>
                </div>
                <div className="flex w-full gap-4 justify-evenly lg:justify-end lg:w-1/2">
                  <div className="flex flex-col gap-4 justify-center items-center">
                    <span className="text-subtitle lg:text-title">
                      <LeafRatings
                        ratings={
                          (
                            companyDetails?.reviews.reduce(
                              (sum, r) => sum + r.starCount,
                              0
                            ) / companyDetails?.reviews?.length
                          ).toFixed(1) || 0
                        }
                        height={30}
                        width={30}
                      />
                    </span>
                    <span className="text-sm flex lg:text-small font-medium">
                      {renderStars(
                        companyDetails?.reviews.reduce(
                          (sum, r) => sum + r.starCount,
                          0
                        ) / companyDetails?.reviews?.length || 0
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 lg:gap-4 justify-center items-center">
                    <p className="text-subtitle lg:text-title">
                      {companyDetails?.reviews?.length || 0}
                    </p>
                    <span className="text-small font-medium">Reviews</span>
                  </div>
                </div>
              </div>
              <div className="shadow-md flex flex-col gap-4 p-6 rounded-xl border-2">
                <h1 className="text-card-title font-semibold">
                  Enquire & Recieve Quote
                </h1>
                <form
                  onSubmit={handleSubmit((data) => submitEnquiry(data))}
                  action=""
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
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
                    externalStyles={"col-span-1 lg:col-span-2"}
                  />
                </form>
              </div>
            </div>
          </div>
          <hr className="my-5 lg:my-10" />
          {/* Inclusions */}
          <div className="flex flex-col gap-8 w-full ">
            <h1 className="text-title font-semibold ">
              What Inclusion does it offers
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-24 gap-y-10">
              {allAmenities.map((item, index) => (
                <Amenities key={index} image={item.image} title={item.title} />
              ))}
            </div>
          </div>
          <hr className="my-5 lg:my-10" />
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col justify-center items-center max-w-4xl mx-auto">
              <h1 className="text-main-header font-medium mt-5">
                <LeafRatings
                  ratings={
                    (
                      companyDetails?.reviews?.reduce(
                        (sum, r) => sum + r.starCount,
                        0
                      ) / companyDetails?.reviews?.length
                    ).toFixed(1) || 0
                  }
                  align="items-start"
                />
              </h1>

              <p className="text-subtitle  my-4 font-medium">Guest favorite</p>
              <span className="text-content text-center">
                This home is a guest favourite based on <br /> ratings, reviews
                and reliability
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-0 lg:p-6">
              {reviewData.length > 0 ? (
                reviewData.map((review, index) => (
                  <ReviewCard
                    handleClick={() => {
                      setSelectedReview(review);
                      setOpen(true)
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
            <div className="flex flex-col gap-8">
              <h1 className="text-title font-semibold">Where you'll be</h1>
              <iframe
                src="https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1sBIZNest+Sunteck+…rporate+Park,+501+B,Patto+Centre,+Panaji,Goa+403001!6i14!3m1!1sen!5m1!1sen"
                width="100%"
                height="600"
                loading="lazy"
                className="rounded-xl"
                referrerPolicy="no-referrer-when-downgrade"
                title="map"
              ></iframe>
            </div>
            <hr className="my-5 lg:my-10" />
            <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2 gap-20 pb-20">
              <div className="flex flex-col shadow-md gap-4 border-2 rounded-xl p-4 max-w-md">
                <div className="flex justify-center items-center">
                  <div className="h-20 w-20 overflow-hidden rounded-full">
                    <img
                      src="/images/bg-image.jpg"
                      alt="poc image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-title font-semibold">
                    {companyDetails?.pocs?.name || "Unknown"}
                  </h1>
                  <p className="text-content">
                    {companyDetails?.pocs?.designation || "Unknown"}
                  </p>
                </div>
                <hr />
                <div>
                  <p className="text-subtitle mb-4">Host Details</p>
                  <ul className="list-disc pl-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <li>Response rate: 100%</li>
                      <li>Response rate: 100%</li>
                      <li>Response rate: 100%</li>
                      <li>Response rate: 100%</li>
                    </div>
                  </ul>
                </div>
              </div>
              <div className="flex w-full justify-end">
                <div className="flex flex-col shadow-md h-full gap-4 border-2 rounded-xl p-6 w-full lg:w-3/4 justify-between">
                  <h1 className="text-card-title font-semibold">
                    Connect With Us
                  </h1>
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

                    <SecondaryButton title={"Submit"} type={"submit"} />
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
    <div className="flex items-center gap-1 text-yellow-500 text-sm">
      {Array(selectedReview?.stars)
        .fill()
        .map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-4 h-4"
          >
            <path d="M12 .587l3.668 7.568L24 9.75l-6 5.859L19.336 24 12 19.897 4.664 24 6 15.609 0 9.75l8.332-1.595z" />
          </svg>
        ))}
    </div>

    {/* Message */}
    <div className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">
      {selectedReview?.message}
    </div>
  </div>
</MuiModal>

    </div>
  );
};

export default Product;
