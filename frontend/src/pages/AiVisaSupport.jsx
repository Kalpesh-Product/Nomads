import React, { useMemo } from "react";
import {
  Box,
  Button,
  InputBase,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
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

const defaultValues = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  passportValidity: "",
  currentResidence: "",
  destination: "",
  email: "",
  contactCode: "",
  contactNumber: "",
  tentativeTravelDate: "",
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
      title: "Request Submitted!",
      text: "Please suggest and select below options.",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Need Custom Solution",
      cancelButtonText: "Browse Options Yourself",
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
                  name="currentResidence"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nationality on Passport"
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
                      label="Travel Country"
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
                        color: selectedResidence ? "#1976d2" : "#6b7280",
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
                        color: selectedResidence ? "#1976d2" : "#6b7280",
                        fontWeight: 500,
                        display: "block",
                      }}
                    >
                      Contact Number
                    </Typography>
                    <Controller
                      name="contactNumber"
                      control={control}
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
