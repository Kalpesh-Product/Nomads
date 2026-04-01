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
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Country } from "country-state-city";
import Swal from "sweetalert2";
import Container from "../components/Container";

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
  fullName: "",
  email: "",
  dateOfBirth: "",
  passportValidity: "",
  nationalityOnPassport: "",
  travelCountry: "",
  contactCode: "",
  contactNumber: "",
  supportRequired: "",
  tentativeTravelDate: "",
  comments: "",
};

const OVERALL_ACTIVATION_PROMPT =
  "Tell us what kind of on-ground activation help you need, and our team will guide you end-to-end.";
const OVERALL_ACTIVATION_HEADING = "Overall Activation Support";

const AiOverallActivationSupport = () => {
  const [typedMessage, setTypedMessage] = useState("");
  const [typedPageHeading, setTypedPageHeading] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const countries = useMemo(() => Country.getAllCountries(), []);
  const { control, reset, setValue, watch } = useForm({
    defaultValues,
  });
  const selectedNationality = watch("nationalityOnPassport");

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
    setTypedMessage("");
    setTypedPageHeading("");
    setIsFormVisible(false);

    let messageIndex = 0;
    let headingIndex = 0;
    let cleanupHeading = () => {};

    const typeHeading = () => {
      const headingInterval = setInterval(() => {
        headingIndex += 1;
        setTypedPageHeading(OVERALL_ACTIVATION_HEADING.slice(0, headingIndex));

        if (headingIndex >= OVERALL_ACTIVATION_HEADING.length) {
          clearInterval(headingInterval);
          setIsFormVisible(true);
        }
      }, 35);

      cleanupHeading = () => clearInterval(headingInterval);
    };

    const messageInterval = setInterval(() => {
      messageIndex += 1;
      setTypedMessage(OVERALL_ACTIVATION_PROMPT.slice(0, messageIndex));

      if (messageIndex >= OVERALL_ACTIVATION_PROMPT.length) {
        clearInterval(messageInterval);
        typeHeading();
      }
    }, 25);

    return () => {
      clearInterval(messageInterval);
      cleanupHeading();
    };
  }, []);

  return (
    <div className="bg-white text-black font-sans">
      <Container padding={false}>
        <section className="min-h-[85vh] flex items-center justify-center py-8">
          <div className="w-full max-w-5xl md:px-20 lg:px-40">
            <div className="mx-auto mb-8 flex w-full max-w-4xl flex-col items-center gap-4 px-6">
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
              className={`bg-white p-6 md:p-10 rounded-2xl ${
                isFormVisible ? "visible" : "invisible"
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
                      label="Email Address"
                      variant="standard"
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
                      enableAccessibleFieldDOMStructure={false}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(value) =>
                        field.onChange(
                          value ? dayjs(value).format("YYYY-MM-DD") : "",
                        )
                      }
                      slotProps={{
                        field: {
                          placeholder: "DD-MM-YYYY",
                        },
                        textField: {
                          fullWidth: true,
                          variant: "standard",
                          placeholder: "DD-MM-YYYY",
                          inputProps: { placeholder: "DD-MM-YYYY" },
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
                      enableAccessibleFieldDOMStructure={false}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(value) =>
                        field.onChange(
                          value ? dayjs(value).format("YYYY-MM-DD") : "",
                        )
                      }
                      slotProps={{
                        field: {
                          placeholder: "DD-MM-YYYY",
                        },
                        textField: {
                          fullWidth: true,
                          variant: "standard",
                          placeholder: "DD-MM-YYYY",
                          inputProps: { placeholder: "DD-MM-YYYY" },
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

                <Controller
                  name="travelCountry"
                  control={control}
                  rules={{ required: "Travel Country is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Travel Country"
                      variant="standard"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
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
                      // required
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

                {/* <Controller
                  name="tentativeTravelDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Tentative Travel Date"
                      format="DD-MM-YYYY"
                      enableAccessibleFieldDOMStructure={false}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(value) =>
                        field.onChange(
                          value ? dayjs(value).format("YYYY-MM-DD") : "",
                        )
                      }
                      slotProps={{
                        field: {
                          placeholder: "DD-MM-YYYY",
                        },
                        textField: {
                          fullWidth: true,
                          variant: "standard",
                          placeholder: "DD-MM-YYYY",
                          inputProps: { placeholder: "DD-MM-YYYY" },
                          InputLabelProps: {
                            sx: floatingLabelSx,
                            shrink: true,
                          },
                        },
                      }}
                    />
                  )}
                /> */}

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

export default AiOverallActivationSupport;
