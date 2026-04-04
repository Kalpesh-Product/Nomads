import React, { useEffect, useMemo, useState } from "react";
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
  visaType: "",
  fullName: "",
  nationality: "",
  travellingCountry: "",
  email: "",
  contactCode: "",
  contactNumber: "",
  comments: "",
};

const VISA_TYPE_OPTIONS = [
  "Explore / Travel",
  "Work Remotely",
  "Get a Job Abroad",
  "Study Abroad",
  "Start or Expand a Business",
  "Relocate / Settle Long-Term",
  "Move with Family",
  "Not Sure - Need Recommendation",
];

const VISA_SUPPORT_PROMPT =
  "Tell us about your travel plans and we will help you navigate the visa process with confidence.";
const VISA_SUPPORT_HEADING = "Visa Support";
const VISA_SUPPORT_TYPING_SEEN_KEY = "wono-visa-support-typing-seen";

const AiVisaSupport = () => {
  const [typedMessage, setTypedMessage] = useState("");
  const [typedVisaHeading, setTypedVisaHeading] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
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
  const selectedNationality = watch("nationality");

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
      (option) => option.state === formValues.travellingCountry,
    );
    const destinationState = selectedDestination?.state?.toLowerCase() || "";
    const destinationCountry =
      selectedDestination?.country?.toLowerCase() || "";

    navigate(
      `/visa-support/thank-you?choice=${choice}&state=${encodeURIComponent(destinationState)}&country=${encodeURIComponent(destinationCountry)}&destination=${encodeURIComponent(formValues.travellingCountry || "")}`,
    );
    reset(defaultValues);
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
      window.localStorage.getItem(VISA_SUPPORT_TYPING_SEEN_KEY) === "true";

    if (hasSeenTypingEffect) {
      setTypedMessage(VISA_SUPPORT_PROMPT);
      setTypedVisaHeading(VISA_SUPPORT_HEADING);
      setIsFormVisible(true);
      return;
    }
    setTypedMessage("");
    setTypedVisaHeading("");
    setIsFormVisible(false);

    let messageIndex = 0;
    let visaHeadingIndex = 0;
    let cleanupHeading = () => { };

    const typeVisaHeading = () => {
      const headingInterval = setInterval(() => {
        visaHeadingIndex += 1;
        setTypedVisaHeading(VISA_SUPPORT_HEADING.slice(0, visaHeadingIndex));

        if (visaHeadingIndex >= VISA_SUPPORT_HEADING.length) {
          clearInterval(headingInterval);
          setIsFormVisible(true);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(VISA_SUPPORT_TYPING_SEEN_KEY, "true");
          }
        }
      }, 35);

      cleanupHeading = () => clearInterval(headingInterval);
    };

    const messageInterval = setInterval(() => {
      messageIndex += 1;
      setTypedMessage(VISA_SUPPORT_PROMPT.slice(0, messageIndex));

      if (messageIndex >= VISA_SUPPORT_PROMPT.length) {
        clearInterval(messageInterval);
        typeVisaHeading();
      }
    }, 2);

    return () => {
      clearInterval(messageInterval);
      cleanupHeading();
    };
  }, []);

  return (
    <div className="bg-white text-black font-sans">
      <Container padding={false}>
        <section className="min-h-[85vh] flex items-center justify-center py-2">
          <div className="w-full max-w-5xl md:px-20 lg:px-20 flex flex-col gap-2">
            <p className="mx-auto min-h-[3rem] w-full text-left font-play text-[0.95rem] leading-relaxed text-gray-800 sm:min-h-[3.5rem] sm:text-[1rem]">
              {typedMessage}
            </p>

            <h1 className="text-hero min-h-[3rem] text-center font-play">
              {typedVisaHeading}
            </h1>

            <Box
              component="form"
              onSubmit={handleSubmit(handleFormSubmit)}
              className={`bg-white p-0 md:p-0 rounded-2xl ${isFormVisible ? "visible" : "invisible"
                }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                <Controller
                  name="visaType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="VISA Type"
                      variant="standard"
                      select
                      InputLabelProps={{ sx: floatingLabelSx }}
                    >
                      <MenuItem value="" sx={{ fontWeight: 700 }}>
                        SELECT VISA TYPE
                      </MenuItem>
                      {VISA_TYPE_OPTIONS.map((option) => (
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
                  name="nationality"
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
                          {country.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="travellingCountry"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Travelling Country"
                      variant="standard"
                      select
                      InputLabelProps={{ sx: floatingLabelSx }}
                      onChange={(event) => field.onChange(event.target.value)}
                    >
                      <MenuItem value="" sx={{ fontWeight: 700 }}>
                        SELECT COUNTRY
                      </MenuItem>
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
                        inputProps={{ readOnly: true }}
                        sx={{ width: "20%" }}
                      />
                    )}
                  />
                  <Box sx={{ width: "1px", height: "100%", backgroundColor: "#ccc" }} />
                  <Controller
                    name="contactNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Contact Number"
                        variant="standard"
                        type="tel"
                        InputLabelProps={{ sx: floatingLabelSx }}
                        sx={{ flex: 1 }}
                      />
                    )}
                  />
                </Box>

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
                    Submit
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