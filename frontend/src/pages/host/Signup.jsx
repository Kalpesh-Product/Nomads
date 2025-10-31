import React, { useState } from "react";
import { Stepper, Step } from "react-form-stepper";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from "@mui/material";
import Container from "../../components/Container";
import GetStartedButton from "../../components/GetStartedButton";
import { NavLink, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { useFieldArray } from "react-hook-form";
import { Country, State, City } from "country-state-city";
import { MenuItem } from "@mui/material";
import UploadFileInput from "../../components/UploadFileInput";
import UploadMultipleFilesInput from "../../components/UploadMultipleFilesInput";

const steps = [
  "Personal Info",
  "Company Info",
  "Create Website Info",
  "Services",
  "Activation",
];

const serviceOptions = [
  {
    category: "Addon Apps (Coming Soon)",
    items: [
      "Tickets",
      "Meetings",
      "Tasks",
      "Performance",
      "Visitors",
      "Assets",

      // "Cafe",
    ],
  },
  {
    category: "Addon Modules (Coming Soon)",
    items: [
      "Finance",
      "Sales",
      "HR",

      "Admin",
      "Maintenance",
      "IT",
      // "Cafe",
    ],
  },
  // {
  //   category: "General",
  //   items: ["Calendar", "Access", "Profile"],
  // },
];

const HostSignup = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);

  const { control, handleSubmit, getValues, trigger, reset, watch, setValue } =
    useForm({
      defaultValues: {
        name: "",
        email: "",
        mobile: "",
        country: "",
        state: "",
        city: "",
        companyName: "",
        industry: "",
        companySize: "",
        companyCountry: "",
        companyState: "",
        companyCity: "",
        // websiteUrl: "",
        // linkedInUrl: "",
        title: "",
        subTitle: "",
        companyLogo: null,
        heroImages: [],
        // CTAButtonText: "",
        // about: [{ text: "" }],
        about: [{ text: "" }, { text: "" }], // 👈 two default paragraphs
        // productTitle: "",
        // galleryTitle: "",
        products: [
          { type: "", name: "", cost: "", description: "", files: [] },
        ],
        gallery: [],
        // testimonialTitle: "",
        contactTitle: "",
        mapUrl: "",
        websiteEmail: "",
        phone: "",
        address: "",
        registeredCompanyName: "",
        copyrightText: "",
        selectedServices: [],
      },
    });

  // inside your HostSignup or CreateWebsite component:
  const {
    fields: aboutFields,
    append: appendAbout,
    remove: removeAbout,
  } = useFieldArray({ control, name: "about" });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({ control, name: "products" });

  // const { mutate: register, isLoading: isRegisterLoading } = useMutation({
  //   mutationFn: async (data) => {
  //     const response = await axios.post("form/add-new-b2b-form-submission", {
  //       ...data,
  //       formName: "register",
  //     });

  //     return response.data;
  //   },
  //   onSuccess: (data) => {
  //     toast.success("Form submitted successfully");
  //     reset();
  //   },
  //   onError: (error) => {
  //     toast.error(error.response.data.message);
  //     reset();
  //   },
  // });
  // const { mutate: register, isLoading: isRegisterLoading } = useMutation({
  //   mutationFn: async (fd) => {
  //     const response = await axios.post("forms/register-form-submission", fd, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     return response.data;
  //   },
  //   onSuccess: (data) => {
  //     toast.success("Form submitted successfully");
  //     reset();
  //   },
  //   onError: (error) => {
  //     toast.error(error.response?.data?.message || "Something went wrong");
  //     reset();
  //   },
  // });

  const { mutate: register, isLoading: isRegisterLoading } = useMutation({
    mutationFn: async (fd) => {
      const response = await axios.post("forms/register-form-submission", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Form submitted successfully");
      reset();
      setActiveStep((prev) => prev + 1); // 👈 go to Step 5 after submit
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
      reset();
      setActiveStep((prev) => prev + 1); // 👈 go to Step 5 after submit (To be removed later)
    },
  });

  const stepFields = [
    ["name", "email", "mobile", "country", "state", "city"], // Step 1
    [
      "companyName",
      "industry",
      "companySize",
      "companyCountry",
      "companyState",
      "companyCity",
      // "websiteUrl",
      // "linkedInUrl",
    ], // Step 2
    [
      "title",
      "subTitle",
      // "CTAButtonText",
      "about",
      // "productTitle",
      // "galleryTitle",
      // "testimonialTitle",
      "contactTitle",
      "mapUrl",
      "websiteEmail",
      "phone",
      "address",
      "registeredCompanyName",
      "copyrightText",
    ], // Temporary Step 2.5 Website Info ✅
    ["selectedServices"], // Step 3
    [], // Step 4
  ];

  const handleNext = async () => {
    const fieldsToValidate = stepFields[activeStep];
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return; // stop if invalid

    const stepValues = getValues();
    console.log(`Step ${activeStep + 1} values:`, stepValues);

    setActiveStep((prev) => prev + 1);
  };

  const renderStepFields = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Full Name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  margin="normal"
                  variant="standard"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  variant="standard"
                  margin="normal"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="mobile"
              control={control}
              rules={{ required: "Phone Number is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  fullWidth
                  margin="normal"
                  variant="standard"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="country"
              control={control}
              // rules={{ required: "Country is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Country"
                  fullWidth
                  margin="normal"
                  variant="standard"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value); // update form with country name
                    setValue("state", ""); // reset state
                    setValue("city", ""); // reset city
                  }}
                >
                  {Country.getAllCountries().map((c) => (
                    <MenuItem key={c.isoCode} value={c.name}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="state"
              control={control}
              // rules={{ required: "State is required" }}
              render={({ field, fieldState }) => {
                const countryName = watch("country");
                const countryObj = Country.getAllCountries().find(
                  (c) => c.name === countryName
                );
                const states = countryObj
                  ? State.getStatesOfCountry(countryObj.isoCode)
                  : [];

                return (
                  <TextField
                    {...field}
                    select
                    label="State"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={!countryObj}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value); // store state name
                      setValue("city", ""); // reset city when state changes
                    }}
                  >
                    {states.map((s) => (
                      <MenuItem key={s.isoCode} value={s.name}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }}
            />

            <Controller
              name="city"
              control={control}
              // rules={{ required: "City is required" }}
              render={({ field, fieldState }) => {
                const countryName = watch("country");
                const stateName = watch("state");

                const countryObj = Country.getAllCountries().find(
                  (c) => c.name === countryName
                );
                const stateObj =
                  countryObj &&
                  State.getStatesOfCountry(countryObj.isoCode).find(
                    (s) => s.name === stateName
                  );

                const cities =
                  countryObj && stateObj
                    ? City.getCitiesOfState(
                        countryObj.isoCode,
                        stateObj.isoCode
                      )
                    : [];

                return (
                  <TextField
                    {...field}
                    select
                    label="City"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={!stateObj}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city.name} value={city.name}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }}
            />
          </>
        );

      case 1:
        return (
          <>
            <Controller
              name="companyName"
              control={control}
              // rules={{ required: "Company Name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Company Name"
                  fullWidth
                  margin="normal"
                  variant="standard"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="industry"
              control={control}
              // rules={{ required: "Industry is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Industry"
                  fullWidth
                  margin="normal"
                  variant="standard"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="companySize"
              control={control}
              rules={{
                // required: "Company Size is required",
                pattern: {
                  value: /^[0-9]+$/, // only digits allowed
                  message: "Company Size must be a number",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Company Size"
                  fullWidth
                  margin="normal"
                  variant="standard"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="companyCountry"
              control={control}
              // rules={{ required: "Company Country is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Company Country"
                  fullWidth
                  margin="normal"
                  variant="standard"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value); // store country name
                    setValue("companyState", ""); // reset state
                    setValue("companyCity", ""); // reset city
                  }}
                >
                  {Country.getAllCountries().map((c) => (
                    <MenuItem key={c.isoCode} value={c.name}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="companyState"
              control={control}
              // rules={{ required: "Company State is required" }}
              render={({ field, fieldState }) => {
                const countryName = watch("companyCountry");
                const countryObj = Country.getAllCountries().find(
                  (c) => c.name === countryName
                );
                const states = countryObj
                  ? State.getStatesOfCountry(countryObj.isoCode)
                  : [];

                return (
                  <TextField
                    {...field}
                    select
                    label="Company State"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={!countryObj}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value); // store state name
                      setValue("companyCity", ""); // reset city when state changes
                    }}
                  >
                    {states.map((s) => (
                      <MenuItem key={s.isoCode} value={s.name}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }}
            />

            <Controller
              name="companyCity"
              control={control}
              // rules={{ required: "Company City is required" }}
              render={({ field, fieldState }) => {
                const countryName = watch("companyCountry");
                const stateName = watch("companyState");

                const countryObj = Country.getAllCountries().find(
                  (c) => c.name === countryName
                );
                const stateObj =
                  countryObj &&
                  State.getStatesOfCountry(countryObj.isoCode).find(
                    (s) => s.name === stateName
                  );

                const cities =
                  countryObj && stateObj
                    ? City.getCitiesOfState(
                        countryObj.isoCode,
                        stateObj.isoCode
                      )
                    : [];

                return (
                  <TextField
                    {...field}
                    select
                    label="Company City"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={!stateObj}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city.name} value={city.name}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }}
            />
          </>
        );

      case 2:
        return (
          <>
            <div className="col-span-1 lg:col-span-2">
              <h2 className="font-semibold mt-4 text-xl">Website Banner</h2>
            </div>
            <div className="col-span-1 lg:col-span-2 rounded-lg border border-gray-300 p-3 mb-2 grid grid-cols-2 gap-4">
              <Controller
                name="title"
                control={control}
                // rules={{ required: "Website Title is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Website Title"
                    fullWidth
                    margin="none"
                    variant="standard"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="subTitle"
                control={control}
                // rules={{ required: "Website Subtitle is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Website Subtitle"
                    fullWidth
                    margin="none"
                    variant="standard"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              {/* Company Logo (single upload) */}
              <Controller
                name="companyLogo"
                control={control}
                render={({ field }) => (
                  <Box
                    sx={{
                      pb: 0.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      // nuke any borders/shadows the custom component may render
                      "& *": {
                        border: "0 !important",
                        boxShadow: "none !important",
                        background: "transparent",
                      },
                    }}
                  >
                    <UploadFileInput
                      id="companyLogo"
                      value={field.value}
                      label="Company Logo"
                      onChange={field.onChange}
                    />
                  </Box>
                )}
              />

              {/* Hero Images (multiple upload) */}
              <Controller
                name="heroImages"
                control={control}
                render={({ field }) => (
                  <Box
                    sx={{
                      pb: 0.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "& *": {
                        border: "0 !important",
                        boxShadow: "none !important",
                        background: "transparent",
                      },
                    }}
                  >
                    <UploadMultipleFilesInput
                      {...field}
                      name="heroImages"
                      id="heroImages"
                      label="Carousel Images"
                      maxFiles={5}
                      allowedExtensions={["jpg", "jpeg", "png", "pdf", "webp"]}
                    />
                  </Box>
                )}
              />
            </div>

            {/* <div> */}
            <div className="col-span-1 lg:col-span-2">
              <h3 className="font-semibold mb-2 text-xl mt-4">About Company</h3>
              {aboutFields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-gray-300 p-3 mb-2"
                >
                  <div className="flex items-center justify-between ">
                    <span className="font-medium">Paragraph {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAbout(index)}
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <Controller
                    name={`about.${index}.text`}
                    control={control}
                    // rules={{ required: "About paragraph is required" }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Add Paragraph"
                        fullWidth
                        margin="none"
                        variant="standard"
                        multiline
                        rows={2}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => appendAbout({ text: "" })}
                className="text-blue-600 text-sm"
              >
                + Add Paragraph
              </button>
            </div>

            {/* <Controller
              name="contactTitle"
              control={control}
              rules={{ required: "Contact Title is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Contact Title"
                  fullWidth
                  margin="normal"
                  variant="standard"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            /> */}

            {/* Products Section */}
            <div className="col-span-1 lg:col-span-2">
              <h3 className="font-semibold mb-2 text-xl mt-4">Products</h3>

              {productFields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-gray-300 p-3 mb-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Product {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Grid for first 4 inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      name={`products.${index}.name`}
                      control={control}
                      // rules={{ required: "Name is required" }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Product Name"
                          fullWidth
                          margin="none"
                          variant="standard"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`products.${index}.type`}
                      control={control}
                      // rules={{ required: "Type is required" }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          select
                          label="Product Type"
                          fullWidth
                          margin="none"
                          variant="standard"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        >
                          {[
                            "Co-working",
                            "Hostels",
                            "Workation",
                            "Private Stay",
                            "Meetings",
                            "Cafe",
                          ].map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <Controller
                      name={`products.${index}.description`}
                      control={control}
                      // rules={{ required: "Description is required" }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Product Description"
                          fullWidth
                          margin="normal"
                          variant="standard"
                          // multiline
                          // rows={2}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`products.${index}.cost`}
                      control={control}
                      // rules={{ required: "Cost is required" }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="Product Cost"
                          fullWidth
                          margin="normal"
                          variant="standard"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </div>

                  {/* Product Images */}
                  <Controller
                    name={`products.${index}.files`}
                    control={control}
                    render={({ field }) => (
                      <UploadMultipleFilesInput
                        {...field}
                        name={`products.${index}.files`}
                        id={`products-${index}-files`}
                        label="Product Images"
                        maxFiles={15}
                        allowedExtensions={[
                          "jpg",
                          "jpeg",
                          "png",
                          "pdf",
                          "webp",
                        ]}
                      />
                    )}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  appendProduct({
                    type: "",
                    name: "",
                    cost: "",
                    description: "",
                    files: [],
                  })
                }
                className="text-blue-600 text-sm"
              >
                + Add Product
              </button>
            </div>

            {/* Gallery Section (already there) */}

            {/* Gallery Section */}
            <div className="col-span-1 lg:col-span-2">
              <h3 className="font-semibold mb-2 text-xl mt-4">Gallery</h3>
              <Controller
                name="gallery"
                control={control}
                render={({ field }) => (
                  <UploadMultipleFilesInput
                    {...field}
                    name="gallery"
                    id="gallery"
                    label="Gallery Images"
                    maxFiles={10}
                    allowedExtensions={["jpg", "jpeg", "png", "pdf", "webp"]}
                  />
                )}
              />
            </div>

            <div className="col-span-1 lg:col-span-2">
              <h2 className="font-semibold mt-4 text-xl">Company Contact</h2>
            </div>
            <div className="col-span-1 lg:col-span-2 rounded-lg border border-gray-300 p-3 mb-2 grid grid-cols-2 gap-4">
              <Controller
                name="websiteEmail"
                control={control}
                rules={{
                  // required: "Contact Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Contact Email"
                    fullWidth
                    margin="none"
                    variant="standard"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="phone"
                control={control}
                // rules={{ required: "Contact Phone is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Contact Phone"
                    fullWidth
                    margin="none"
                    variant="standard"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="mapUrl"
                control={control}
                // rules={{
                //   required: "Map URL is required",
                //   validate: (val) => {
                //     const MAP_EMBED_REGEX =
                //       /^https?:\/\/(www\.)?(google\.com|maps\.google\.com)\/maps\/embed(\/v1\/[a-z]+|\?pb=|\/?\?)/i;

                //     const v = (val || "").trim();

                //     return (
                //       MAP_EMBED_REGEX.test(v) ||
                //       "Enter a valid Google Maps *embed* URL (e.g. https://www.google.com/maps/embed?pb=...)"
                //     );
                //   },
                // }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      // auto-extract src if full iframe pasted
                      const extractIframeSrc = (val = "") =>
                        val.match(/src=["']([^"']+)["']/i)?.[1] || val;

                      const raw = e.target.value;
                      const cleaned = extractIframeSrc(raw).trim();

                      field.onChange(cleaned);
                    }}
                    label="Google Map Embed URL"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="address"
                control={control}
                // rules={{ required: "Address is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    // multiline
                    // rows={3}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="registeredCompanyName"
                control={control}
                // rules={{ required: "Registered Company Name is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Registered Company Name"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="copyrightText"
                control={control}
                // rules={{ required: "Copyright Text is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Copyright Text"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    // multiline
                    // rows={2}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="font-semibold text-lg pt-4">
              Please Select Your Services
            </h2>
            <Controller
              name="selectedServices"
              control={control}
              defaultValue={["Website Builder", "Lead Generation"]}
              // rules={{
              //   validate: (value) =>
              //     value.length > 0 || "Please select at least one service",
              // }}
              render={({ field, fieldState }) => {
                const mandatoryServices = [
                  "Website Builder",
                  "Lead Generation",
                  "Automated Google Sheets",
                ];

                // Always merge mandatory into value
                const valueWithMandatory = Array.from(
                  new Set([...(field.value || []), ...mandatoryServices])
                );

                const renderCard = (service, isMandatory) => {
                  const isSelected = valueWithMandatory.includes(service);

                  const handleToggle = () => {
                    if (isMandatory) return;
                    const newValue = isSelected
                      ? valueWithMandatory.filter((s) => s !== service)
                      : [...valueWithMandatory, service];

                    console.log("Selected services:", newValue);
                    field.onChange(newValue);
                  };

                  return (
                    <Box
                      key={service}
                      onClick={handleToggle}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === " ") &&
                          !isMandatory
                        )
                          handleToggle();
                      }}
                      sx={{
                        border: "1px solid",
                        borderColor: isSelected ? "primary.main" : "divider",
                        borderRadius: 2,
                        p: 2,
                        cursor: isMandatory ? "not-allowed" : "pointer",
                        userSelect: "none",
                        boxShadow: isSelected ? 3 : 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        opacity: isMandatory ? 0.8 : 1,
                      }}
                    >
                      <span className="font-medium">{service}</span>

                      <Checkbox
                        checked={isSelected}
                        disabled={isMandatory}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggle();
                        }}
                        inputProps={{
                          "aria-label": `${service} checkbox`,
                        }}
                      />
                    </Box>
                  );
                };

                return (
                  <Box sx={{ mt: 2 }} className="col-span-1 lg:col-span-2">
                    {/* Mandatory Section */}
                    <h3 className="font-semibold mb-2">
                      Your Activated Services
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {mandatoryServices.map((service) =>
                        renderCard(service, true)
                      )}
                    </div>

                    {/* Other Categories */}
                    {serviceOptions.map((group) => (
                      <Box key={group.category} sx={{ mb: 4 }}>
                        <h3 className="font-semibold mb-2">{group.category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.items.map((service) =>
                            renderCard(service, false)
                          )}
                        </div>
                      </Box>
                    ))}

                    {fieldState.error && (
                      <FormHelperText error>
                        {fieldState.error.message}
                      </FormHelperText>
                    )}
                  </Box>
                );
              }}
            />
          </>
        );

      case 4:
        return (
          <div className="flex flex-col gap-4 col-span-2">
            <h1 className="text-title text-center">Account Activation</h1>
            <div className="space-y-10">
              <div>
                <p>
                  An email has been sent to your email address&nbsp;
                  {/* {"<EMAIL?>"} */}
                  <strong>{watch("email")}</strong> containing all the further
                  process for activating the account.
                </p>
                <p>
                  Our team will reach out to you shortly for more details and
                  will inform you once your website is activated within 48
                  hours.
                </p>
                <br />
                <p>
                  Please let us know if there is any more queries from your
                  side, or you can contact us at : {"response@wono.co"}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 overflow-hidden">
                    <img src="/logos/gmailLogo.jpg" alt="gmail-logo" />
                  </div>
                  <NavLink className={"underline"}>Open Gmail</NavLink>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 overflow-hidden">
                    <img src="/logos/outlookLogo.png" alt="outlook-logo" />
                  </div>
                  <NavLink className={"underline"}>Open Outlook</NavLink>
                </div>
              </div>
              <div>
                <p>Did not recieve an email ? Please check your spam folder.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col justify-start gap-10 p-4 lg:p-10 items-center w-full">
      <Stepper
        className="w-full p-0"
        connectorStateColors={true}
        styleConfig={{
          activeBgColor: "#2196F3", // Blue for the active step
          completedBgColor: "#4CAF50", // Green for completed steps
          inactiveBgColor: "#E0E0E0", // Color for inactive steps
          size: "2.5em", // Step size (Optional)
          activeTextColor: "#FFFFFF", // Text color for active step
          completedTextColor: "#FFFFFF", // Text color for completed steps
          inactiveTextColor: "#000000", // Text color for inactive steps
          circleFontSize: "1rem", // Font size for step number (Optional)
          fontFamily: "inherit",
        }}
        connectorStyleConfig={{
          size: 3, // Thickness of the connector line
          activeColor: "#4CAF50", // Color of the connector when active
          completedColor: "#4CAF50", // Color of the connector when completed
          inactiveColor: "#E0E0E0", // Color of the connector when inactive
        }}
        style={{
          // paddingTop: 0,
          textTransform: "uppercase",
          fontFamily: "Poppins",
        }}
        activeStep={activeStep}
      >
        {steps.map((label, index) => (
          <Step label={label} key={index} />
        ))}
      </Stepper>
      <div className="max-w-5xl mx-auto w-full">
        {/* {activeStep !== 3 && (
          <h1 className="text-title text-center">
            Let's set up your free account
          </h1>
        )} */}
        {activeStep !== 3 && (
          <h1 className="text-title text-center">
            {activeStep === 0 && "Let's set up your free account"}
            {activeStep === 1 && "Add your company details"}
            {activeStep === 2 && "Add Your Website Content"}
            {/* {activeStep === 3 && "Choose your services"} */}
            {/* {activeStep === 4 && "Activate your account"} */}
          </h1>
        )}

        <form
          key={activeStep}
          className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4"
          // onSubmit={handleSubmit((data) => register(data))}
          // onSubmit={handleSubmit((data) =>
          //   register({ ...data, about: data.about.map((a) => a.text) })
          // )}
          // onSubmit={handleSubmit((values) => {
          //   const fd = new FormData();

          //   // Append all simple fields (skip files/arrays)
          //   Object.entries(values).forEach(([key, val]) => {
          //     if (
          //       key === "companyLogo" ||
          //       key === "heroImages" ||
          //       key === "about" ||
          //       key === "gallery" ||
          //       key === "products"
          //     )
          //       return;
          //     fd.set(key, val);
          //   });

          //   // About
          //   fd.set("about", JSON.stringify(values.about.map((a) => a.text)));
          //   // fd.set("about", values.about.map((a) => a.text).join(","));

          //   // Products metadata
          //   const productsMeta = (values.products || []).map((p) => ({
          //     type: p.type,
          //     name: p.name,
          //     cost: p.cost,
          //     description: p.description,
          //   }));
          //   fd.set("products", JSON.stringify(productsMeta));

          //   // Product images
          //   (values.products || []).forEach((p, i) => {
          //     (p.files || []).forEach((f) => {
          //       fd.append(`productImages_${i}`, f);
          //     });
          //   });

          //   // companyLogo
          //   if (values.companyLogo) {
          //     fd.set("companyLogo", values.companyLogo);
          //   }

          //   // heroImages
          //   fd.delete("heroImages");
          //   (values.heroImages || []).forEach((file) => {
          //     fd.append("heroImages", file);
          //   });

          //   // gallery
          //   fd.delete("gallery");
          //   (values.gallery || []).forEach((file) => {
          //     fd.append("gallery", file);
          //   });

          //   // formName
          //   fd.set("formName", "register");

          //   register(fd);
          // }

          // )}

          onSubmit={handleSubmit((values) => {
            const fd = new FormData();

            // Utility to ensure required fields always have something
            const withFallback = (val, fallback) =>
              val && val !== "" ? val : fallback;

            // Append simple fields
            Object.entries(values).forEach(([key, val]) => {
              if (
                key === "companyLogo" ||
                key === "heroImages" ||
                key === "about" ||
                key === "gallery" ||
                key === "products"
              )
                return;

              fd.set(key, withFallback(val, "N/A")); // 👈 fallback if empty
            });

            // About (array → join into text or fallback)
            const aboutArray =
              values.about?.map((a, i) =>
                withFallback(a.text, `About ${i + 1}`)
              ) || [];
            fd.set("about", JSON.stringify(aboutArray));

            // Products metadata (with fallbacks)
            const productsMeta = (values.products || []).map((p, i) => ({
              type: withFallback(p.type, "Default Type"),
              name: withFallback(p.name, `Product ${i + 1}`),
              cost: withFallback(p.cost, "0"),
              description: withFallback(
                p.description,
                "No description provided"
              ),
            }));
            fd.set("products", JSON.stringify(productsMeta));

            // Product images
            (values.products || []).forEach((p, i) => {
              (p.files || []).forEach((f) => {
                fd.append(`productImages_${i}`, f);
              });
            });

            // companyLogo
            if (values.companyLogo) {
              fd.set("companyLogo", values.companyLogo);
            }

            // heroImages
            fd.delete("heroImages");
            (values.heroImages || []).forEach((file) => {
              fd.append("heroImages", file);
            });

            // gallery
            fd.delete("gallery");
            (values.gallery || []).forEach((file) => {
              fd.append("gallery", file);
            });

            // formName
            fd.set("formName", "register");

            register(fd);
          })}
        >
          {renderStepFields()}
          <div className="col-span-1 lg:col-span-2 flex justify-between items-center">
            {/* {activeStep > 0 && (
              <GetStartedButton
                title="Back"
                handleSubmit={() => setActiveStep((prev) => prev - 1)}
              />
            )} */}
            {activeStep > 0 && activeStep < stepFields.length - 1 && (
              <GetStartedButton
                title="Back"
                handleSubmit={() => setActiveStep((prev) => prev - 1)}
              />
            )}

            {activeStep === 0 && (
              <div className="flex  justify-center  items-center w-full">
                <GetStartedButton title="Next" handleSubmit={handleNext} />
              </div>
            )}

            {activeStep !== 0 && activeStep < steps.length - 2 ? (
              <div className="flex   justify-end items-center w-full">
                <GetStartedButton title="Next" handleSubmit={handleNext} />
              </div>
            ) : (
              <></>
            )}
            {/* {activeStep === stepFields.length - 2 && (
              <div className="flex  justify-center lg:justify-end  items-center w-full">
                <GetStartedButton title="Submit" type={"submit"} />
              </div>
            )}
            {activeStep === stepFields.length - 1 && (
              <div className="flex justify-center lg:justify-end items-center w-full">
                <GetStartedButton
                  title="Go To Home"
                  handleSubmit={() => {
                    // 👉 replace with your actual navigation logic
                    window.location.href = "/";
                  }}
                />
              </div>
            )} */}

            {/* Submit button on 4th step */}
            {activeStep === stepFields.length - 2 && (
              <div className="flex justify-end items-center w-full">
                <GetStartedButton title="Submit" type="submit" />
              </div>
            )}

            {/* Go To Home button on 5th step */}
            {activeStep === stepFields.length - 1 && (
              <div className="flex justify-center items-center w-full">
                <GetStartedButton
                  title="Go To Home"
                  handleSubmit={() => {
                    navigate("/"); // 👈 React Router navigation
                  }}
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostSignup;
