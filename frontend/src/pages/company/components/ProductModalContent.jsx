import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
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
import { showErrorAlert, showSuccessAlert } from "../../../utils/alerts";
import { getMediaSrc, normalizeSlug } from "../utils/templateRouteUtils";

const ProductModalContent = ({
  product,
  onClose,
  embedded = false,
  forceCafeMode = false,
}) => {
  const [current, setCurrent] = useState(0);
  // Legacy vertical-based cafe modal behavior kept as backup only:
  // const normalizedVertical = normalizeVertical(vertical);
  // const isCafe = normalizedVertical === "cafe";
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
  const companyName = data?.companyName || "";
  const isCafeProduct =
    forceCafeMode ||
    normalizeSlug(product?.slug || product?.type || product?.name || "", "")
      .includes("cafe");

  const { mutate, isPending: isEnquiry } = useMutation({
    mutationKey: ["enquiryForm"],
    mutationFn: async (formData) => {
      const cleanStart = formData.startDate
        ? dayjs(formData.startDate).format("YYYY-MM-DD")
        : null;

      const cleanEnd = formData.endDate
        ? dayjs(formData.endDate).format("YYYY-MM-DD")
        : null;

      const res = await axios.post("/api/leads/create-lead", {
        ...formData,
        startDate: cleanStart,
        endDate: cleanEnd,
        fullName: formData.fullName,
        name: formData.fullName,
        mobileNumber: formData.mobileNumber,
        mobile: formData.mobileNumber,
        phone: formData.mobileNumber,
        email: formData.email,
        companyName,
        companyId: data?.companyId || "",
        workspaceId: data?.workspaceId || "",
        searchKey: data?.searchKey || "",
        vertical: data?.vertical || "",
        websiteUrl: window.location.href,
        source: "Website",
        productType: product?.type || product?.name || "",
        roomType: product?.type || product?.name || "",
        packageName: product?.type || product?.name || "",
        dormType: product?.type || product?.name || "",
        noOfPeople: formData?.noOfPeople,
        attendees: formData?.noOfPeople,
        stayDuration: cleanEnd ? `${cleanStart || ""} to ${cleanEnd}` : "",
        timeSlot: "",
        inquiryType: product?.type || "",
      });

      return res.data;
    },

    onSuccess: (res) => {
      showSuccessAlert(
        res?.data?.message || res?.message || "Enquiry submitted successfully",
      );
      reset();
      if (typeof onClose === "function") {
        onClose();
      }
    },
    onError: (err) => {
      // showErrorAlert(err.response?.data?.errors?.[0]);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err?.message ||
        "Something went wrong";
      showErrorAlert(errorMessage);
    },
  });

  const images = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : Array.isArray(product?.heroImages) && product.heroImages.length > 0
      ? product.heroImages
      : product?.heroImage
        ? [product.heroImage]
        : product?.cardImage
          ? [product.cardImage]
          : ["/sample1.jpg", "/sample2.jpg", "/sample3.jpg"];
  const nextSlide = () => setCurrent((p) => (p + 1) % images.length);
  const prevSlide = () =>
    setCurrent((p) => (p - 1 + images.length) % images.length);

  if (isCafeProduct) {
    return (
      <div className="relative grid w-full grid-cols-1 gap-6 rounded-xl bg-white p-4 md:grid-cols-2">
        {!embedded ? (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-50 rounded-full bg-white/90 p-1 shadow-md transition hover:bg-white"
          >
            <IoMdClose size={22} className="text-black" />
          </button>
        ) : null}

        <div className="relative overflow-hidden rounded-xl">
          <img
            src={getMediaSrc(images[current]) || images[current]}
            alt={product?.name || "Product"}
            className="h-56 w-full bg-black object-cover md:h-full md:object-contain"
          />
        </div>

        <div className="flex w-full flex-col">
          <h2 className="text-xl font-bold uppercase">{product?.type || product?.name}</h2>
          <p className="text-gray-600">{product?.name}</p>
          {product?.cost && (
            <p className="mt-2 font-semibold text-secondary-dark">{product.cost}</p>
          )}
          <div className="mt-4 text-sm leading-7 text-gray-700">
            {product?.description}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative grid w-full grid-cols-1 gap-6 rounded-xl bg-white p-4 md:grid-cols-2">
      {/* Close Button */}
      {!embedded ? (
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-50 rounded-full bg-white/90 p-1 shadow-md transition hover:bg-white"
        >
          <IoMdClose size={22} className="text-black" />
        </button>
      ) : null}

      {/* Left: Image Carousel */}
      <div className="relative">
        <div className="relative h-full overflow-hidden rounded-xl">
          <img
            src={getMediaSrc(images[current]) || images[current]}
            alt={product?.name || "Product"}
            className="w-full h-48 md:h-full object-cover lg:object-contain bg-black"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <button
              onClick={prevSlide}
              className="bg-white text-black p-2 rounded-full"
            >
              <FaChevronLeft size={16} />
            </button>

            <button
              onClick={nextSlide}
              className="bg-white text-black p-2 rounded-full"
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Right: Details + Form (no inner scroll) */}
      <div className="flex w-full flex-col">
        <h2 className="text-xl font-bold uppercase">{product?.type}</h2>
        <p className="text-gray-600">{product?.name}</p>
        {product?.cost && (
          <p className="mt-2 font-semibold text-secondary-dark">{product.cost}</p>
        )}

        <div className="mt-4 text-sm text-gray-700">{product?.description}</div>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            Enquire & Receive Quote
          </h3>

          <form
            onSubmit={handleSubmit((formData) => mutate(formData))}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
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
                buttonText={
                  isEnquiry ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></span>
                      Submitting...
                    </div>
                  ) : (
                    "Get Quote"
                  )
                }
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModalContent;
