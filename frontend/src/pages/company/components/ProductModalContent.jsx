import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IconButton, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  isAlphanumeric,
  isValidEmail,
  isValidPhoneNumber,
  noOnlyWhitespace,
} from "../../../utils/validators";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import SecondaryButton from "../../../components/SecondaryButton";
import TempButton from "./TempButton";

// Example modal component
const ProductModalContent = ({ product, onClose, company }) => {
  const [current, setCurrent] = useState(0);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      fullName: "",
      noOfPeople: 0,
      mobileNumber: "",
      email: "",
      startDate: null,
      endDate: null,
    },
  });
  const selectedStartDate = watch("startDate");

  const { mutate, isPending } = useMutation({
    mutationKey: ["enquiryForm"],
    mutationFn: async (data) => {
      console.log(data);
    },
    onSuccess: () => {},
    onError: () => {},
  });

  const images = product?.images || [
    "/sample1.jpg",
    "/sample2.jpg",
    "/sample3.jpg",
  ];

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full bg-white rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Image Carousel */}
      <div className="  ">
        <div className="overflow-hidden h-full rounded-xl relative ">
          <img
            src={images[current]?.url}
            alt={product?.title || "Product"}
            className="w-full h-full object-cover bg-black"
          />
          <div className="absolute inset-0 bg-black/20">

          </div>
        </div>
        {/* Prev/Next buttons */}
        {images.length > 1 && (
          <div className="absolute inset-0">
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-white text-black p-2 rounded-full"
            >
              <FaChevronLeft size={16} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-[53%] -translate-y-1/2 bg-white text-black p-2 rounded-full"
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Right: Product Details */}
      <div className="  flex ">
        <div className="flex flex-col w-full">
          <h2 className="text-xl font-bold uppercase">{product?.type}</h2>
          <p className="text-gray-600">{product?.subtitle}</p>
          <p className="mt-2 font-semibold text-secondary-dark">
            {product?.cost || "Starting at INR 5,900 + GST"}
          </p>

          <div className="mt-4 text-sm text-gray-700 overflow-y-auto h-28 pr-2">
            {/* {product?.description || */}
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nemo,
            excepturi praesentium. Sapiente neque distinctio consequuntur qui
            iste, iure rerum pariatur exercitationem non cum. Dolorum rerum,
            quos veniam quasi laboriosam esse blanditiis! Perferendis nulla ab
            Lo
          </div>

          {/* Form area placeholder */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              Enquire & Receive Quote
            </h3>
            <div className="text-sm text-gray-500 h-40 md:h-full overflow-auto">
              <form
                onSubmit={handleSubmit((data) => mutate(data))}
                action=""
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Controller
                  name="fullName"
                  rules={{
                    required: "Full Name is required",
                    validate: {
                      noOnlyWhitespace,
                      isAlphanumeric,
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Full Name"
                      fullWidth
                      variant="standard"
                      size="small"
                      helperText={errors?.fullName?.message}
                      error={!!errors.fullName}
                    />
                  )}
                />
                <Controller
                  name="noOfPeople"
                  control={control}
                  rules={{
                    required: "No. of people is required",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="No. Of People"
                      fullWidth
                      type="number"
                      variant="standard"
                      size="small"
                      helperText={errors?.noOfPeople?.message}
                      error={!!errors.noOfPeople}
                      slotProps={{
                        input: { sx: { fontSize: "0.875rem" } },
                        inputLabel: { sx: { fontSize: "0.875rem" } },
                        formHelperText: { sx: { fontSize: "0.75rem" } },
                      }}
                    />
                  )}
                />
                <Controller
                  name="mobileNumber"
                  control={control}
                  rules={{
                    required: "Mobile number is required",
                    validate: {
                      isValidPhoneNumber,
                      isAlphanumeric
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mobile Number"
                      fullWidth
                   
                      value={field.value || ""}
                      variant="standard"
                      size="small"
                      helperText={errors?.mobileNumber?.message}
                      error={!!errors.mobileNumber}
                      slotProps={{
                        input: { sx: { fontSize: "0.875rem" } },
                        inputLabel: { sx: { fontSize: "0.875rem" } },
                        formHelperText: { sx: { fontSize: "0.75rem" } },
                      }}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    validate: {
                      isValidEmail,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      type="email"
                      variant="standard"
                      size="small"
                      helperText={errors?.email?.message}
                      error={!!errors.email}
                      slotProps={{
                        input: { sx: { fontSize: "0.875rem" } },
                        inputLabel: { sx: { fontSize: "0.875rem" } },
                        formHelperText: { sx: { fontSize: "0.75rem" } },
                      }}
                    />
                  )}
                />
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Start Date"
                      disablePast
                      format="DD-MM-YYYY"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          variant: "standard",
                          slotProps: {
                            input: { sx: { fontSize: "0.875rem" } },
                            inputLabel: { sx: { fontSize: "0.875rem" } },
                            formHelperText: { sx: { fontSize: "0.75rem" } },
                          },
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
                      disablePast
                      disabled={!selectedStartDate}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          variant: "standard",
                          slotProps: {
                            input: { sx: { fontSize: "0.875rem" } },
                            inputLabel: { sx: { fontSize: "0.875rem" } },
                            formHelperText: { sx: { fontSize: "0.75rem" } },
                          },
                        },
                      }}
                    />
                  )}
                />
                <div className="flex justify-center items-center lg:col-span-2">
                  <TempButton
                    disabled={isPending}
                    type={"submit"}
                    buttonText="Inquire Now"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-start   rounded-t-md">
          <div className="border-2 rounded-full">
            <IconButton sx={{ p: 0 }}>
              <IoMdClose className="text-black" onClick={onClose} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModalContent;
