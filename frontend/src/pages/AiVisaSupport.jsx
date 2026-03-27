import React, { useMemo } from "react";
import { Box, Button, ListSubheader, MenuItem, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Country } from "country-state-city";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Container from "../components/Container";
import { aiDestinationCards } from "../constants/aiDestinationCards";

const floatingLabelSx = {
  color: "black",
  "&.Mui-focused": { color: "#1976d2" },
  "&.MuiInputLabel-shrink": { color: "#1976d2" },
};

const visaSupportOptions = {
  "Free Services": [
    "Visa eligibility check",
    "Required documents checklist",
    "Processing timeline",
    "Recommended visa type",
    "Estimated approval chances",
  ],
  "Paid Services": [
    "Visa Consultation (1-on-1 expert call / Personalized visa strategy / Country comparison)",
    "Application Support (Form filling assistance / Document review / SOP / cover letter drafting)",
    "End-to-End Visa Processing (Appointment booking / Submission tracking)",
  ],
};

const defaultValues = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  passportValidity: "",
  currentResidence: "",
  destination: "",
  email: "",
  contactNumber: "",
  serviceRequired: "",
  comments: "",
};

const AiVisaSupport = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues,
  });
  const countries = useMemo(() => Country.getAllCountries(), []);
  const destinationOptions = useMemo(
    () =>
      aiDestinationCards.map((destination) => ({
        state: destination.city,
        country: destination.country,
      })),
    [],
  );
  const selectedResidence = watch("currentResidence");

  const handleFormSubmit = async (formValues) => {
    const result = await Swal.fire({
      title: "Form Submitted",
      text: "Form submitted. Would you like us to get back to you or search yourself?",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Get Back To Me",
      cancelButtonText: "Self Serve",
      reverseButtons: true,
      cancelButtonColor: "#000000",
      confirmButtonColor: "#0BA9EF",
      customClass: {
        confirmButton: "swal2-button--pill",
        cancelButton: "swal2-button--pill",
      },
    });

    const choice = result.isConfirmed ? "get-back-to-me" : "help-needed";
    const selectedDestination = destinationOptions.find(
      (option) => option.state === formValues.destination,
    );
    const destinationState = selectedDestination?.state?.toLowerCase() || "";
    const destinationCountry =
      selectedDestination?.country?.toLowerCase() || "";

    navigate(
      `/visa-support/thank-you?choice=${choice}&state=${encodeURIComponent(destinationState)}&country=${encodeURIComponent(destinationCountry)}&destination=${encodeURIComponent(formValues.destination || "")}`,
    );
    reset(defaultValues);
  };

  const handleResidenceChange = (countryName, onChange) => {
    const country = countries.find((item) => item.name === countryName);
    const phonePrefix = country?.phonecode ? `+${country.phonecode}` : "";

    onChange(countryName);
    setValue("contactNumber", phonePrefix, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="bg-white text-black font-sans">
      <Container padding={false}>
        <section className="min-h-[85vh] flex items-center justify-center py-8">
          <div className="w-full max-w-5xl md:px-20 lg:px-40">
            <Box
              component="form"
              onSubmit={handleSubmit(handleFormSubmit)}
              className="bg-gray-50/50 p-6 md:p-10 rounded-2xl border border-gray-100 shadow-sm"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold uppercase mb-8 text-center">
                Visa Support
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      variant="standard"
                      InputLabelProps={{ sx: floatingLabelSx }}
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      variant="standard"
                      InputLabelProps={{ sx: floatingLabelSx }}
                    />
                  )}
                />

                {/* <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Gender"
                      variant="standard"
                      select
                      InputLabelProps={{ sx: floatingLabelSx }}
                    >
                      <MenuItem value="">Select Gender</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                  )}
                /> */}

                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Date of Birth"
                      variant="standard"
                      type="date"
                      InputLabelProps={{ shrink: true, sx: floatingLabelSx }}
                    />
                  )}
                />

                <Controller
                  name="passportValidity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Passport Validity"
                      variant="standard"
                      type="date"
                      InputLabelProps={{ shrink: true, sx: floatingLabelSx }}
                    />
                  )}
                />

                <Controller
                  name="currentResidence"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Current City/Country of Residence"
                      variant="standard"
                      select
                      InputLabelProps={{ sx: floatingLabelSx }}
                      onChange={(event) =>
                        handleResidenceChange(
                          event.target.value,
                          field.onChange,
                        )
                      }
                    >
                      <MenuItem value="">Select Country</MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.isoCode} value={country.name}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="destination"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Destination"
                      variant="standard"
                      select
                      InputLabelProps={{ sx: floatingLabelSx }}
                      onChange={(event) => field.onChange(event.target.value)}
                    >
                      <MenuItem value="">Select State</MenuItem>
                      {destinationOptions.map((destinationOption) => (
                        <MenuItem
                          key={`${destinationOption.state}-${destinationOption.country}`}
                          value={destinationOption.state}
                        >
                          {destinationOption.state}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="contactNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Contact Number"
                      variant="standard"
                      placeholder={
                        selectedResidence
                          ? "Country code is prefilled based on residence"
                          : ""
                      }
                      InputLabelProps={{ sx: floatingLabelSx }}
                    />
                  )}
                />

                <Controller
                  name="serviceRequired"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Services Required"
                      variant="standard"
                      select
                      InputLabelProps={{ sx: floatingLabelSx }}
                    >
                      <MenuItem value="">Select an option</MenuItem>
                      {Object.entries(visaSupportOptions).map(
                        ([category, options]) => [
                          <ListSubheader
                            key={`${category}-header`}
                            disableSticky
                            sx={{ color: "#111827", fontWeight: 600 }}
                          >
                            {category}
                          </ListSubheader>,
                          ...options.map((option) => (
                            <MenuItem
                              key={`${category}-${option}`}
                              value={`${category} - ${option}`}
                            >
                              {option}
                            </MenuItem>
                          )),
                        ],
                      )}
                    </TextField>
                  )}
                />

                <div className="md:col-span-2">
                  <Controller
                    name="comments"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        minRows={4}
                        label="Comments"
                        variant="standard"
                        InputLabelProps={{ sx: floatingLabelSx }}
                      />
                    )}
                  />
                </div>

                <div className="pt-6 md:col-span-2 text-center">
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      bgcolor: "black",
                      borderRadius: 20,
                      px: { xs: 6, md: 14 },
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: "600",
                      "&:hover": { bgcolor: "#333" },
                      width: { xs: "100%", md: "auto" },
                    }}
                  >
                    SUBMIT
                  </Button>
                </div>
              </div>
            </Box>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default AiVisaSupport;
