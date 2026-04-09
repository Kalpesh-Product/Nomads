import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  InputBase,
  MenuItem,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Country } from "country-state-city";
import Swal from "sweetalert2";
import Container from "../components/Container";
import useNomadLoginState from "../hooks/useNomadLoginState";
import useAuth from "../hooks/useAuth";
import axios from "../utils/axios";

const floatingLabelSx = {
  color: "black",
  "&.Mui-focused": { color: "#1976d2" },
  "&.MuiInputLabel-shrink": { color: "#1976d2" },
};

const activationSupportOptions = [
  "Private Family Stay Setup Assistance",
  "Shared / Co-Living Setup Assistance",
  "Private Office Setup Assistance",
  "Co-Working Setup Assistance",
  "Overall New Location Setup Assistance",
  "Not Sure - Need Customised Support",
];

const defaultValues = {
  supportRequired: "",
  fullName: "",
  nationalityOnPassport: "",
  travelCountry: "",
  contactCode: "",
  contactNumber: "",
  email: "",
  comments: "",
};

const OVERALL_ACTIVATION_PROMPT =
  "Tell us what kind of on-ground activation help you need, and our team will guide you end-to-end.";
const OVERALL_ACTIVATION_HEADING = "Overall Activation Support";
const OVERALL_ACTIVATION_TYPING_SEEN_KEY =
  "wono-overall-activation-typing-seen";
const getFlagIconUrl = (isoCode) =>
  `https://flagcdn.com/24x18/${isoCode.toLowerCase()}.png`;

const AiOverallActivationSupport = () => {
  const [typedMessage, setTypedMessage] = useState("");
  const [typedPageHeading, setTypedPageHeading] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedDestination, setSubmittedDestination] = useState("");
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const { auth } = useAuth();
  const isLoggedIn = useNomadLoginState();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const countries = useMemo(() => Country.getAllCountries(), []);
  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues,
  });
  const messagePrefix = isLoggedIn ? auth?.user?.fullName + ", " : "User, ";
  const overallActivationPrompt = `${messagePrefix}${OVERALL_ACTIVATION_PROMPT}`;
  const selectedNationality = watch("nationalityOnPassport");
  const selectedNationalityCountry = useMemo(
    () =>
      countries.find((country) => country.name === selectedNationality) || null,
    [countries, selectedNationality],
  );

  const [isPending, setIsPending] = useState(false);

  // const handleFormSubmit = async () => {
  //   setIsPending(true);

  //   await Swal.fire({
  //     title: "Request Submitted!",
  //     text: "Your form has been submitted. We will get back to you shortly.",
  //     icon: "success",
  //     confirmButtonText: "OK",
  //     confirmButtonColor: "#0BA9EF",
  //   });

  //   reset(defaultValues);
  //   setIsPending(false);
  // };

  const handleFormSubmit = async (formValues) => {
    try {
      setIsSubmitting(true);
      await axios.post("overall-activation-support", formValues);
      setSubmittedDestination(formValues.travelCountry || "");
      setShowChoiceModal(true);
      reset(defaultValues);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Something went wrong while submitting your request.";
      window.alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  useEffect(() => {
    const hasSeenTypingEffect =
      typeof window !== "undefined" &&
      window.localStorage.getItem(OVERALL_ACTIVATION_TYPING_SEEN_KEY) ===
      "true";

    if (hasSeenTypingEffect) {
      setTypedMessage(overallActivationPrompt);
      setTypedPageHeading(OVERALL_ACTIVATION_HEADING);
      setIsFormVisible(true);
      return;
    }
    setTypedMessage("");
    setTypedPageHeading("");
    setIsFormVisible(false);

    let messageIndex = 0;
    let headingIndex = 0;
    let cleanupHeading = () => { };

    const typeHeading = () => {
      const headingInterval = setInterval(() => {
        headingIndex += 1;
        setTypedPageHeading(overallActivationPrompt.slice(0, headingIndex));

        if (headingIndex >= OVERALL_ACTIVATION_HEADING.length) {
          clearInterval(headingInterval);
          setIsFormVisible(true);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              OVERALL_ACTIVATION_TYPING_SEEN_KEY,
              "true",
            );
          }
        }
      }, 1);

      cleanupHeading = () => clearInterval(headingInterval);
    };

    const messageInterval = setInterval(() => {
      messageIndex += 1;
      setTypedMessage(overallActivationPrompt.slice(0, messageIndex));

      if (messageIndex >= overallActivationPrompt.length) {
        clearInterval(messageInterval);
        typeHeading();
      }
    }, 1);

    return () => {
      clearInterval(messageInterval);
      cleanupHeading();
    };
  }, [overallActivationPrompt]);

  const namePortion = typedMessage.slice(0, messagePrefix.length);
  const messagePortion = typedMessage.slice(messagePrefix.length);

  return (
    <div className="bg-white text-black font-sans">
      <Container padding={false}>
        <section className="min-h-[85vh] flex items-center justify-center py-2">
          <div className="w-full max-w-5xl md:px-20 lg:px-20">
            <div className="mx-auto mb-0 flex w-full max-w-4xl flex-col items-center gap-2 px-0">
              <p className="min-h-[3rem] w-full text-left font-play text-[0.95rem] leading-relaxed text-gray-800 sm:min-h-[3.5rem] sm:text-[1rem]">
                {messagePrefix ? (
                  <>
                    <span className="text-blue-600">{namePortion}</span>
                    {messagePortion}
                  </>
                ) : (
                  typedMessage
                )}
              </p>
              <h1 className="text-hero min-h-[3rem] text-center font-play">
                {typedPageHeading}
              </h1>
            </div>
            <Box
              component="form"
              onSubmit={handleSubmit(handleFormSubmit)}
              className={`bg-white p-0 md:p-0 rounded-2xl ${isFormVisible ? "visible" : "invisible"
                }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">
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
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    >
                      <MenuItem value="" sx={{ fontWeight: 700 }}>
                        Select Support
                      </MenuItem>
                      {activationSupportOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

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
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
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
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                      SelectProps={{
                        renderValue: (value) => {
                          const selectedCountry = countries.find(
                            (country) => country.name === value,
                          );

                          if (!selectedCountry) {
                            return value;
                          }

                          return (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <img
                                src={getFlagIconUrl(selectedCountry.isoCode)}
                                alt={`${selectedCountry.name} flag`}
                                width={20}
                                height={15}
                                loading="lazy"
                              />
                              <span>{selectedCountry.name}</span>
                            </Box>
                          );
                        },
                      }}
                      onChange={(event) =>
                        handleNationalityChange(
                          event.target.value,
                          field.onChange,
                        )
                      }
                    >
                      <MenuItem value="" sx={{ fontWeight: 700 }}>
                        SELECT COUNTRY
                      </MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.isoCode} value={country.name}>
                          <Box
                            component="img"
                            src={getFlagIconUrl(country.isoCode)}
                            alt={`${country.name} flag`}
                            sx={{ width: 20, height: 15, mr: 1, flexShrink: 0 }}
                            loading="lazy"
                          />
                          <span>{country.name}</span>
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="travelCountry"
                  control={control}
                  rules={{ required: "Travelling Country is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Travelling Country"
                      variant="standard"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    >
                      <MenuItem value="" sx={{ fontWeight: 700 }}>
                        SELECT COUNTRY
                      </MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.isoCode} value={country.name}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                  <Controller
                    name="contactCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Code"
                        variant="standard"
                        InputLabelProps={{ sx: floatingLabelSx }}
                        InputProps={{
                          startAdornment:
                            selectedNationalityCountry?.isoCode ? (
                              <InputAdornment position="start">
                                <Box
                                  component="img"
                                  src={getFlagIconUrl(
                                    selectedNationalityCountry.isoCode,
                                  )}
                                  alt={`${selectedNationalityCountry.name} flag`}
                                  sx={{ width: 20, height: 15, flexShrink: 0 }}
                                  loading="lazy"
                                />
                              </InputAdornment>
                            ) : null,
                        }}
                        inputProps={{ readOnly: true }}
                        sx={{ width: "20%" }}
                      />
                    )}
                  />
                  <Box
                    sx={{
                      width: "1px",
                      height: "100%",
                      backgroundColor: "#ccc",
                    }}
                  />
                  <Controller
                    name="contactNumber"
                    control={control}
                    rules={{ required: "Contact number is required" }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Contact Number"
                        variant="standard"
                        type="tel"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputLabelProps={{ sx: floatingLabelSx }}
                        sx={{ flex: 1 }}
                      />
                    )}
                  />
                </Box>

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
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
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
                        minRows={3}
                        label="Additional Comments"
                        variant="standard"
                        InputLabelProps={{ sx: floatingLabelSx }}
                      />
                    )}
                  />
                </div>

                <div className="pt-2 md:col-span-2 text-center">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      bgcolor: "black",
                      borderRadius: 20,
                      px: { xs: 6, md: 14 },
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: "600",
                      textTransform: "none",
                      "&:hover": { bgcolor: "#333" },
                      width: { xs: "100%", md: "auto" },
                    }}
                  >
                    {isSubmitting && (
                      <CircularProgress
                        size={16}
                        sx={{ color: "white", mr: 1 }}
                      />
                    )}
                    {isSubmitting ? "Submitting..." : "Submit"}
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

export default AiOverallActivationSupport;
