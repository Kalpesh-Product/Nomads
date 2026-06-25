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

const getLeadFieldsForProduct = (slug) => {
  const normalized = normalizeSlug(slug || "", "");
  if (normalized.includes("meeting")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "No. Of Attendees", type: "number", required: true },
      { key: "startDate", label: "Meeting Date", type: "date", required: true },
      { key: "endDate", label: "Meeting End Date", type: "date", required: false },
    ];
  }
  if (normalized.includes("workation")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "No. Of Guests", type: "number", required: true },
      { key: "startDate", label: "Check-In Date", type: "date", required: true },
      { key: "endDate", label: "Check-Out Date", type: "date", required: true },
    ];
  }
  if (normalized.includes("co-living") || normalized.includes("coliving")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "No. Of Occupants", type: "number", required: true },
      { key: "startDate", label: "Move-In Date", type: "date", required: true },
      { key: "endDate", label: "Preferred Stay Until", type: "date", required: false },
    ];
  }
  if (normalized.includes("hostel")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "Beds Required", type: "number", required: true },
      { key: "startDate", label: "Check-In Date", type: "date", required: true },
      { key: "endDate", label: "Check-Out Date", type: "date", required: true },
    ];
  }
  return [
    { key: "fullName", label: "Full Name", type: "text", required: true },
    { key: "mobile", label: "Mobile Number", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "people", label: "No. Of People", type: "number", required: false },
    { key: "startDate", label: "Start Date", type: "date", required: false },
    { key: "endDate", label: "End Date", type: "date", required: false },
  ];
};

const getLeadMetaForProduct = (product) => {
  const slug = normalizeSlug(product?.slug || product?.name || product?.type || "", "");
  const dynamicPrice = [product?.price, product?.cost, product?.duration]
    .filter(Boolean)
    .join(" | ");
  const dynamicDescription = String(product?.description || product?.subText || "").trim();

  if (dynamicPrice || dynamicDescription) {
    return {
      priceLine: dynamicPrice || "Starting at 5,900 + GST",
      description: dynamicDescription || "",
      label: "Enquire & Receive Quote",
    };
  }

  if (slug.includes("meeting")) {
    return { priceLine: "Starting at 2,499 + GST", description: "", label: "Enquire & Receive Quote" };
  }
  if (slug.includes("workation")) {
    return { priceLine: "Starting at 7,900 + GST", description: "", label: "Plan Your Workation" };
  }
  if (slug.includes("co-living") || slug.includes("coliving")) {
    return { priceLine: "Starting at 14,900 + GST", description: "", label: "Enquire About Stay" };
  }
  if (slug.includes("hostel")) {
    return { priceLine: "Starting at 799 + GST", description: "", label: "Check Bed Availability" };
  }
  return { priceLine: "Starting at 5,900 + GST", description: "", label: "Enquire & Receive Quote" };
};

const ProductModalContent = ({
  product,
  onClose,
  embedded = false,
  forceCafeMode = false,
}) => {
  const [current, setCurrent] = useState(0);
  const productSlug = product?.slug || product?.type || product?.name || "";
  const leadFields = getLeadFieldsForProduct(productSlug);
  const leadMeta = getLeadMetaForProduct(product);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: Object.fromEntries(
      leadFields.map((f) => [f.key, f.type === "date" ? null : f.type === "number" ? 0 : ""]),
    ),
  });

  const selectedStartDate = watch("startDate");
  const { data } = useOutletContext();
  const companyName = data?.companyName || "";
  const isCafeProduct =
    forceCafeMode ||
    normalizeSlug(productSlug, "").includes("cafe");

  const { mutate, isPending: isEnquiry } = useMutation({
    mutationKey: ["enquiryForm"],
    mutationFn: async (formData) => {
      const cleanStart = formData.startDate
        ? dayjs(formData.startDate).format("YYYY-MM-DD")
        : null;

      const cleanEnd = formData.endDate
        ? dayjs(formData.endDate).format("YYYY-MM-DD")
        : null;

      const res = await axios.post("/leads/create-lead", {
        ...formData,
        startDate: cleanStart,
        endDate: cleanEnd,
        fullName: formData.fullName,
        name: formData.fullName,
        mobileNumber: formData.mobile,
        mobile: formData.mobile,
        phone: formData.mobile,
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
        noOfPeople: formData?.people,
        attendees: formData?.people,
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

  const resolveValidImages = (product) => {
    const raw = Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : Array.isArray(product?.heroImages) && product.heroImages.length > 0
        ? product.heroImages
        : [];
    const valid = raw
      .map((img) => {
        const resolved = getMediaSrc(img);
        return resolved || (typeof img === "string" ? img : null);
      })
      .filter((src) => src && typeof src === "string");
    if (valid.length > 0) return valid;
    if (product?.heroImage) return [getMediaSrc(product.heroImage) || product.heroImage].filter(Boolean);
    if (product?.cardImage) return [typeof product.cardImage === "string" ? product.cardImage : getMediaSrc(product.cardImage)].filter(Boolean);
    return ["/sample1.jpg", "/sample2.jpg", "/sample3.jpg"];
  };
  const images = resolveValidImages(product);
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
          <h3 className="mb-2 font-semibold text-gray-800">
            {leadMeta.label || "Enquire & Receive Quote"}
          </h3>

          <form
            onSubmit={handleSubmit((formData) => mutate(formData))}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {leadFields.map((field) => {
              if (field.type === "date") {
                return (
                  <Controller
                    key={field.key}
                    name={field.key}
                    control={control}
                    rules={field.required ? { required: `${field.label} is required` } : {}}
                    render={({ field: controllerField }) => (
                      <DesktopDatePicker
                        {...controllerField}
                        label={field.label}
                        disablePast
                        format="DD-MM-YYYY"
                        value={controllerField.value ? dayjs(controllerField.value) : null}
                        onChange={controllerField.onChange}
                        disabled={field.key === "endDate" && !selectedStartDate}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            variant: "standard",
                            helperText: errors?.[field.key]?.message,
                            error: !!errors?.[field.key],
                          },
                        }}
                      />
                    )}
                  />
                );
              }
              return (
                <Controller
                  key={field.key}
                  name={field.key}
                  control={control}
                  rules={{
                    ...(field.required ? { required: `${field.label} is required` } : {}),
                    ...(field.key === "email" ? { validate: { isValidEmail } } : {}),
                    ...(field.key === "mobile" ? { validate: isValidInternationalPhone } : {}),
                    ...(field.type === "text" && !["email", "mobile"].includes(field.key)
                      ? { validate: { noOnlyWhitespace, isAlphanumeric } }
                      : {}),
                  }}
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      label={field.label}
                      fullWidth
                      variant="standard"
                      size="small"
                      type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                      helperText={errors?.[field.key]?.message}
                      error={!!errors?.[field.key]}
                    />
                  )}
                />
              );
            })}
            <div className="flex items-center justify-center lg:col-span-2">
              <TempButton
                disabled={isEnquiry}
                type="submit"
                buttonText={
                  isEnquiry ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
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
