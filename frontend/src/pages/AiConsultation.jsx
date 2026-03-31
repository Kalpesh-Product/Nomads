import React, { useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  InputBase,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import { Country } from "country-state-city";
import Container from "../components/Container";
import axios from "../utils/axios";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";

const floatingLabelSx = {
  color: "black",
  "&.Mui-focused": { color: "#1976d2" },
  "&.MuiInputLabel-shrink": { color: "#1976d2" },
};

const supportOptions = [
  "Visa Consultation",
  "Immigration Consultation",
  "Tax Consultation",
  "Financial Consultation",
  "Accommodation Consultation",
  "Business Setup Consultation",
  "Other",
];

const defaultValues = {
  fullName: "",
  email: "",
  dateOfBirth: "",
  passportValidity: "",
  nationalityOnPassport: "",
  consultationCountry: "",
  contactCode: "",
  contactNumber: "",
  supportRequired: "",
  tentativeTravelDate: "",
  comments: "",
};

const AiConsultation = () => {
  const countries = useMemo(() => Country.getAllCountries(), []);
  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues,
  });
  const selectedNationality = watch("nationalityOnPassport");

  const { mutate: submitForm, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("forms/add-new-b2c-form-submission", {
        ...data,
        sheetName: "AI_Consultation",
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

  const handleNationalityChange = (countryName, onChange) => {
    const country = countries.find((item) => item.name === countryName);
    const phonePrefix = country?.phonecode ? `+${country.phonecode}` : "";

    onChange(countryName);
    setValue("contactCode", phonePrefix, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("contactNumber", "", {
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
                Consultation
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
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Date of Birth"
                      format="DD-MM-YYYY"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(value) =>
                        field.onChange(
                          value ? dayjs(value).format("YYYY-MM-DD") : "",
                        )
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "standard",
                          placeholder: "dd-mm-yyyy",
                          inputProps: { placeholder: "dd-mm-yyyy" },
                          InputLabelProps: {
                            sx: floatingLabelSx,
                            shrink: true,
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="passportValidity"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Passport Validity (Expiry Date)"
                      format="DD-MM-YYYY"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(value) =>
                        field.onChange(
                          value ? dayjs(value).format("YYYY-MM-DD") : "",
                        )
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "standard",
                          placeholder: "dd-mm-yyyy",
                          inputProps: { placeholder: "dd-mm-yyyy" },
                          InputLabelProps: {
                            sx: floatingLabelSx,
                            shrink: true,
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="nationalityOnPassport"
                  control={control}
                  rules={{ required: "Nationality on passport is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Nationality on Passport"
                      variant="standard"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                      onChange={(event) =>
                        handleNationalityChange(
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
                  name="consultationCountry"
                  control={control}
                  rules={{ required: "Consultation Country is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Consultation Country"
                      variant="standard"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
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

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
                    transition: "border-bottom-color 0.2s ease",
                    "&:focus-within": { borderBottomColor: "#1976d2" },
                  }}
                >
                  <Box
                    sx={{
                      width: "32%",
                      px: 0.5,
                      pb: 0.5,
                      borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: selectedNationality ? "#1976d2" : "#6b7280",
                        fontWeight: 500,
                        display: "block",
                      }}
                    >
                      Code
                    </Typography>
                    <Controller
                      name="contactCode"
                      control={control}
                      render={({ field }) => (
                        <InputBase
                          {...field}
                          fullWidth
                          readOnly
                          placeholder="+___"
                          sx={{ color: "rgba(0, 0, 0, 0.6)" }}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ flex: 1, px: 1, pb: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: selectedNationality ? "#1976d2" : "#6b7280",
                        fontWeight: 500,
                        display: "block",
                      }}
                    >
                      Contact Number
                    </Typography>
                    <Controller
                      name="contactNumber"
                      control={control}
                      rules={{ required: "Contact number is required" }}
                      render={({ field }) => (
                        <InputBase
                          {...field}
                          fullWidth
                          inputProps={{ inputMode: "tel" }}
                        />
                      )}
                    />
                  </Box>
                </Box>

                <Controller
                  name="supportRequired"
                  control={control}
                  rules={{ required: "Support required is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Support Required"
                      variant="standard"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    >
                      <MenuItem value="">Select Support</MenuItem>
                      {supportOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="tentativeTravelDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Tentative Travel Date"
                      format="DD-MM-YYYY"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(value) =>
                        field.onChange(
                          value ? dayjs(value).format("YYYY-MM-DD") : "",
                        )
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "standard",
                          placeholder: "dd-mm-yyyy",
                          inputProps: { placeholder: "dd-mm-yyyy" },
                          InputLabelProps: {
                            sx: floatingLabelSx,
                            shrink: true,
                          },
                        },
                      }}
                    />
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
                        label="Additional Comments"
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

export default AiConsultation;
