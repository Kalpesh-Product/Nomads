import React, { useEffect, useMemo, useState } from "react";
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
import { Country } from "country-state-city";
import Swal from "sweetalert2";
import Container from "../components/Container";

const floatingLabelSx = {
  color: "black",
  "&.Mui-focused": { color: "#1976d2" },
  "&.MuiInputLabel-shrink": { color: "#1976d2" },
};

const defaultValues = {
  fullName: "",
  email: "",
  currentCountry: "",
  contactCode: "",
  contactNumber: "",
  message: "",
};

const CONTRIBUTOR_PROMPT =
  "We are constantly looking out for individuals who can support our cause to make WoNo the largest Nomad Community & Platform in the world. We know we will not be able to do this alone.";
const CONTRIBUTOR_HEADING = "Become a WoNo Contributor";

const AiBecomeContributor = () => {
  const [typedMessage, setTypedMessage] = useState("");
  const [typedPageHeading, setTypedPageHeading] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const countries = useMemo(() => Country.getAllCountries(), []);
  const { control, reset, setValue, watch } = useForm({
    defaultValues,
  });
  const selectedCountry = watch("currentCountry");

  const [isPending, setIsPending] = useState(false);

  const handleFormSubmit = async () => {
    setIsPending(true);

    await Swal.fire({
      title: "Request Submitted!",
      text: "Your form has been submitted. We will get back to you shortly.",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#0BA9EF",
    });

    reset(defaultValues);
    setIsPending(false);
  };

  const handleCountryChange = (countryName, onChange) => {
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
    setTypedMessage("");
    setTypedPageHeading("");
    setIsFormVisible(false);

    let messageIndex = 0;
    let headingIndex = 0;
    let cleanupHeading = () => { };

    const typeHeading = () => {
      const headingInterval = setInterval(() => {
        headingIndex += 1;
        setTypedPageHeading(CONTRIBUTOR_HEADING.slice(0, headingIndex));

        if (headingIndex >= CONTRIBUTOR_HEADING.length) {
          clearInterval(headingInterval);
          setIsFormVisible(true);
        }
      }, 35);

      cleanupHeading = () => clearInterval(headingInterval);
    };


    const messageInterval = setInterval(() => {
      messageIndex += 1;
      setTypedMessage(CONTRIBUTOR_PROMPT.slice(0, messageIndex));

      if (messageIndex >= CONTRIBUTOR_PROMPT.length) {
        clearInterval(messageInterval);
        typeHeading();
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
        <section className="min-h-[85vh] flex items-center justify-center py-0">
          <div className="w-full max-w-5xl md:px-20 lg:px-20">
            <div className="mx-auto mb-0 flex w-full max-w-4xl flex-col items-center gap-8 px-0">
              <p className="min-h-[3rem] w-full text-left font-play text-[0.95rem] leading-relaxed text-gray-800 sm:min-h-[3.5rem] sm:text-[1.2rem]">
                {typedMessage}
              </p>
              <h1 className="text-hero min-h-[3rem] text-center font-play">
                {typedPageHeading}
              </h1>
            </div>
            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                handleFormSubmit();
              }}
              className={`bg-white p-0 md:p-0 rounded-2xl ${isFormVisible ? "visible" : "invisible"
                }`}
            >
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
                      label="Email"
                      variant="standard"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    />
                  )}
                />

                <Controller
                  name="currentCountry"
                  control={control}
                  rules={{ required: "Current Country is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Current Country"
                      variant="standard"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                      onChange={(event) =>
                        handleCountryChange(event.target.value, field.onChange)
                      }
                    >
                      <MenuItem value="" sx={{ fontWeight: 700 }}>
                        Select Country
                      </MenuItem>
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
                      pb: 0,
                      borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: selectedCountry ? "#1976d2" : "#6b7280",
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
                          sx={{ color: "rgba(0, 0, 0, 0.6)", py: 0 }}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ flex: 1, px: 1, pb: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: selectedCountry ? "#1976d2" : "#6b7280",
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
                          sx={{ py: 0 }}
                        />
                      )}
                    />
                  </Box>
                </Box>
                <Controller
                  name="linkedinProfile"
                  control={control}
                  rules={{ required: "Linkedin profile is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Linkedin Profile"
                      variant="standard"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    />
                  )}
                />
                <Controller
                  name="website"
                  control={control}
                  rules={{ required: "Website is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Website/Insta/FB etc"
                      variant="standard"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                    />
                  )}
                />

                <div className="md:col-span-2">
                  <Controller
                    name="message"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        minRows={2}
                        label="Message"
                        variant="standard"
                        InputLabelProps={{ sx: floatingLabelSx }}
                      />
                    )}
                  />
                </div>

                <div className="pt-0 md:col-span-2 text-center">
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
                      textTransform: "none",
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
                    {isPending ? "Submitting..." : "Submit"}
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

export default AiBecomeContributor;
