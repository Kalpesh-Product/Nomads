import React, { useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Country } from "country-state-city";
import Container from "../components/Container";
import axios from "../utils/axios";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { isValidInternationalPhone } from "../utils/validators";

const floatingLabelSx = {
  color: "black",
  "&.Mui-focused": { color: "#1976d2" },
  "&.MuiInputLabel-shrink": { color: "#1976d2" },
};

const visaSupportOptions = [
  "Free Services - Visa eligibility check",
  "Free Services - Required documents checklist",
  "Free Services - Processing timeline",
  "Free Services - Recommended visa type",
  "Free Services - Estimated approval chances",
  "Paid Services - Visa Consultation (1-on-1 expert call / Personalized visa strategy / Country comparison)",
  "Paid Services - Application Support (Form filling assistance / Document review / SOP / cover letter drafting)",
  "Paid Services - End-to-End Visa Processing (Appointment booking / Submission tracking)",
];

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
  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues,
  });
  const countries = useMemo(() => Country.getAllCountries(), []);
  const selectedResidence = watch("currentResidence");

  const { mutate: submitForm, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("forms/add-new-b2c-form-submission", {
        ...data,
        sheetName: "AI_Visa_Support",
      });
      return response.data;
    },
    onSuccess: () => {
      showSuccessAlert("Form submitted successfully");
      reset(defaultValues);
    },
    onError: (error) => {
      showErrorAlert(error?.response?.data?.message || "Failed to submit form");
    },
  });

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
              onSubmit={handleSubmit((data) => submitForm(data))}
              className="bg-gray-50/50 p-6 md:p-10 rounded-2xl border border-gray-100 shadow-sm"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold uppercase mb-8 text-center">
                Visa Support
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <Controller
                  name="fullName"
                  control={control}
                  rules={{ required: "Full name is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      variant="standard"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    />
                  )}
                />

                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: "Gender is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Gender"
                      variant="standard"
                      required
                      select
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    >
                      <MenuItem value="">Select Gender</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                  )}
                />

                <Controller
                  name="dateOfBirth"
                  control={control}
                  rules={{ required: "Date of birth is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Date of Birth"
                      variant="standard"
                      type="date"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true, sx: floatingLabelSx }}
                    />
                  )}
                />

                <Controller
                  name="passportValidity"
                  control={control}
                  rules={{ required: "Passport Validity is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Passport Validity"
                      variant="standard"
                      type="date"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true, sx: floatingLabelSx }}
                    />
                  )}
                />

                <Controller
                  name="currentResidence"
                  control={control}
                  rules={{
                    required: "Current City/Country of Residence is required",
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Current City/Country of Residence"
                      variant="standard"
                      select
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
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
                  rules={{ required: "Destination is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Destination"
                      variant="standard"
                      select
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                      onChange={(event) => field.onChange(event.target.value)}
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
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      variant="standard"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    />
                  )}
                />

                <Controller
                  name="contactNumber"
                  control={control}
                  rules={{
                    required: "Contact number is required",
                    validate: isValidInternationalPhone,
                  }}
                  render={({ field, fieldState }) => (
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
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    />
                  )}
                />

                <Controller
                  name="serviceRequired"
                  control={control}
                  rules={{ required: "Services Required is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Services Required"
                      variant="standard"
                      required
                      select
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    >
                      <MenuItem value="">Select an option</MenuItem>
                      {visaSupportOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
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
                    disabled={isPending}
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
                    {isPending && (
                      <CircularProgress
                        size={16}
                        sx={{ color: "white", mr: 1 }}
                      />
                    )}
                    {isPending ? "SUBMITTING..." : "SUBMIT"}
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
