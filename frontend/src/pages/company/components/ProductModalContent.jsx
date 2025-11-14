import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  isAlphanumeric,
  isValidEmail,
  isValidInternationalPhone,
  noOnlyWhitespace,
} from "../../../utils/validators";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import axios from "../../../utils/axios";
import TempButton from "./TempButton";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";

const ProductModalContent = ({ product, onClose }) => {
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
  const { data } = useOutletContext();
  const companyName = data?.companyName;

  const { data: companyDetails } = useQuery({
    queryKey: ["companyDetails", companyName],
    queryFn: async () =>
      (await axios.get(`company/get-company-data/${companyName}`)).data,
    enabled: !!companyName,
  });

  const { mutate, isPending: isEnquiry } = useMutation({
    mutationKey: ["enquiryForm"],
    mutationFn: async (formData) => {
      const res = await axios.post("/forms/add-new-b2c-form-submission", {
        ...formData,
        country: companyDetails?.country,
        state: companyDetails?.state,
        companyType: companyDetails?.companyType,
        personelCount: parseInt(formData?.noOfPeople),
        companyName: companyDetails?.companyName,
        companyId: companyDetails?.companyId,
        company: companyDetails?._id,
        sheetName: "All_Enquiry",
        phone: formData?.mobileNumber,
        source: "website",
        productType: product?.type,
      });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      reset();
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]);
    },
  });

  const images = product?.images || [
    "/sample1.jpg",
    "/sample2.jpg",
    "/sample3.jpg",
  ];
  const nextSlide = () => setCurrent((p) => (p + 1) % images.length);
  const prevSlide = () =>
    setCurrent((p) => (p - 1 + images.length) % images.length);

  return (
    // Root no longer forces full height; panel handles scroll/max height
    <div className="relative w-full bg-white rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-50 bg-white/90 hover:bg-white rounded-full p-1 shadow-md transition"
      >
        <IoMdClose size={22} className="text-black" />
      </button>

      {/* Left: Image Carousel */}
      <div className="relative">
        <div className="overflow-hidden rounded-xl relative">
          <img
            src={images[current]?.url || images[current]}
            alt={product?.name || "Product"}
            className="w-full h-48 md:h-full object-cover bg-black"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

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

      {/* Right: Details + Form (no inner scroll) */}
      <div className="flex flex-col w-full">
        <h2 className="text-xl font-bold uppercase">{product?.type}</h2>
        <p className="text-gray-600">{product?.name}</p>
        <p className="mt-2 font-semibold text-secondary-dark">
          {product?.cost || "500"}
        </p>

        <div className="mt-4 text-sm text-gray-700">{product?.description}</div>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            Enquire & Receive Quote
          </h3>

          <form
            onSubmit={handleSubmit((formData) => mutate(formData))}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Controller
              name="fullName"
              control={control}
              rules={{
                required: "Full Name is required",
                validate: { noOnlyWhitespace, isAlphanumeric },
              }}
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
              rules={{ required: "No. of people is required" }}
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
                />
              )}
            />
            <Controller
              name="mobileNumber"
              control={control}
              rules={{
                required: "Mobile number is required",
                validate: isValidInternationalPhone,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mobile Number"
                  fullWidth
                  variant="standard"
                  size="small"
                  helperText={errors?.mobileNumber?.message}
                  error={!!errors.mobileNumber}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                validate: { isValidEmail },
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
                    },
                  }}
                />
              )}
            />
            <div className="flex justify-center items-center lg:col-span-2">
              <TempButton
                disabled={isEnquiry}
                type="submit"
                buttonText="Get Quote"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModalContent;
