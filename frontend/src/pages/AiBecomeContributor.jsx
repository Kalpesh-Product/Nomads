import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  InputAdornment,
  ListSubheader,
  MenuItem,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Country } from "country-state-city";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import axios from "../utils/axios";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { HiCheck } from "react-icons/hi";
import Seo from "../components/Seo";

const floatingLabelSx = {
  color: "black",
  "&.Mui-focused": { color: "#1976d2" },
  "&.MuiInputLabel-shrink": { color: "#1976d2" },
};

const defaultValues = {
  contributionType: [],
  fullName: "",
  email: "",
  currentCountry: "",
  linkedinProfile: "",
  contactCode: "",
  contactNumber: "",
  message: "",
};

const MESSAGE_CHARACTER_LIMIT = 1000;

const CONTRIBUTOR_PROMPT =
  "we are constantly looking out for individuals who can support our cause to make WoNo the largest Nomad Community & Platform in the world. We know we will not be able to do this alone.";
const CONTRIBUTOR_HEADING = "Become a Wono Contributor";
const CONTRIBUTOR_TYPING_SEEN_KEY = "wono-contributor-typing-seen";
const PENDING_CONTRIBUTOR_SUBMISSION_KEY =
  "wono-pending-contributor-submission";
const PENDING_CONTRIBUTOR_SUBMISSION_MAX_AGE = 30 * 60 * 1000;
const getFlagIconUrl = (isoCode) =>
  `https://flagcdn.com/24x18/${isoCode.toLowerCase()}.png`;
const CONTRIBUTION_TYPE_GROUPS = [
  {
    label: "Contributor",
    options: [
      "Become a Blogger",
      "Become A News Writer",
      "Contribute To Places",
      "Contribute To Events",
    ],
  },
  {
    label: "Partner",
    options: [
      "Become a Visa & Immigration Partner",
      "Become a Company Setup Services Partner",
      "Become a Activation Support Partner",
      "Become a Consultation Support Partner",
      "Become a Workation Support Partner",
      "Not Sure - Lets Connect & Explore",
    ],
  },
];
const CONTRIBUTOR_CONTRIBUTION_OPTIONS = CONTRIBUTION_TYPE_GROUPS[0].options;
const getSelectedContributorOptions = (selectedOptions = []) =>
  selectedOptions.filter((option) =>
    CONTRIBUTOR_CONTRIBUTION_OPTIONS.includes(option),
  );

const readPendingContributorSubmission = () => {
  if (typeof window === "undefined") return null;

  try {
    const storedValue = window.sessionStorage.getItem(
      PENDING_CONTRIBUTOR_SUBMISSION_KEY,
    );
    if (!storedValue) return null;

    const parsedValue = JSON.parse(storedValue);
    if (!parsedValue?.formValues || !Array.isArray(parsedValue.contributorOptions)) {
      return null;
    }
    if (
      parsedValue.createdAt &&
      Date.now() - parsedValue.createdAt > PENDING_CONTRIBUTOR_SUBMISSION_MAX_AGE
    ) {
      clearPendingContributorSubmission();
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
};

const writePendingContributorSubmission = (payload) => {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    PENDING_CONTRIBUTOR_SUBMISSION_KEY,
    JSON.stringify(payload),
  );
};

const clearPendingContributorSubmission = () => {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(PENDING_CONTRIBUTOR_SUBMISSION_KEY);
};

const tickMenuItemSx = {
  "& .tick-icon": { opacity: 0, color: "#1976d2" },
  "&:hover .tick-icon": { opacity: 1 },
  "&.Mui-selected .tick-icon": { opacity: 1 },
  "&.Mui-selected:hover .tick-icon": { opacity: 1 },
};

const showContributorSuccessAlert = async (message, options) => {
  const { showSuccessAlert } = await import("../utils/alerts");
  return showSuccessAlert(message, options);
};

const showContributorErrorAlert = async (message) => {
  const { showErrorAlert } = await import("../utils/alerts");
  return showErrorAlert(message);
};

const AiBecomeContributor = () => {
  const [typedMessage, setTypedMessage] = useState("");
  const [typedPageHeading, setTypedPageHeading] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messageLimitAlertedRef = useRef(false);
  const pendingSubmissionHandledRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const { auth, setAuth } = useAuth();
  const isLoggedIn = Boolean(auth?.user);
  const countries = useMemo(() => Country.getAllCountries(), []);
  const { handleSubmit, control, reset, setValue, watch } = useForm({
    defaultValues,
  });
  const selectedContributionTypes = watch("contributionType");
  const selectedCountry = watch("currentCountry");
  const selectedCountryData = useMemo(
    () => countries.find((country) => country.name === selectedCountry) || null,
    [countries, selectedCountry],
  );
  const messagePrefix = isLoggedIn
    ? (auth?.user?.fullName?.split(" ")[0] || "User") + ", "
    : "Hey, ";
  const contributorPrompt = `${messagePrefix}${CONTRIBUTOR_PROMPT}`;

  const getContributorSubmissionPayload = (formValues) => {
    const contributorOptions = Array.isArray(formValues.contributionType)
      ? getSelectedContributorOptions(formValues.contributionType)
      : [];
    const normalizedValues = {
      ...formValues,
      contributionType: Array.isArray(formValues.contributionType)
        ? formValues.contributionType.join(", ")
        : formValues.contributionType,
    };

    return { contributorOptions, normalizedValues };
  };

  const { mutate: submitContributor } = useMutation({
    mutationFn: async ({ formValues, contributorOptions }) => {
      if (isLoggedIn && contributorOptions.length) {
        const contributorRoleResponse = await axiosPrivate.patch(
          "/user/contributor-roles",
          {
            contributionTypes: contributorOptions,
          },
        );

        if (contributorRoleResponse?.data?.user) {
          setAuth((prevState) => ({
            ...prevState,
            user: {
              ...prevState.user,
              ...contributorRoleResponse.data.user,
            },
          }));
        }
      }

      const response = await axios.post("forms/add-new-b2c-form-submission", {
        ...formValues,
        sheetName: "AI_Become_Contributor",
      });
      return response.data;
    },
    onSuccess: async (data) => {
      if (data?.warning) {
        console.warn(data.warning);
      }
      clearPendingContributorSubmission();
      await showContributorSuccessAlert(
        "We’ll review your details and get back to you soon.",
        {
          title: "Thank You for Your Interest!",
        },
      );
      reset(defaultValues);
    },
    onError: (error) => {
      void showContributorErrorAlert(
        error?.response?.data?.message ||
          "Something went wrong while submitting your request.",
      );
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleFormSubmit = (formValues) => {
    const { contributorOptions, normalizedValues } =
      getContributorSubmissionPayload(formValues);

    setIsSubmitting(true);
    submitContributor({ formValues: normalizedValues, contributorOptions });
  };

  const selectedContributorOptionsRequireLogin = (selectedOptions = []) =>
    getSelectedContributorOptions(selectedOptions).length > 0;

  const handleFormGateAndSubmit = (event) => {
    if (
      !isLoggedIn &&
      selectedContributorOptionsRequireLogin(selectedContributionTypes)
    ) {
      void handleSubmit((formValues) => {
        const { contributorOptions } = getContributorSubmissionPayload(formValues);

        writePendingContributorSubmission({
          formValues,
          contributorOptions,
          createdAt: Date.now(),
        });

        navigate("/login", {
          state: {
            loginContext: {
              title: "Become a Contributor",
              description:
                "Login as a Nomad to contribute blogs, news, places, or events to WoNo.",
            },
            redirectTo: `${location.pathname}${location.search}`,
          },
        });
      })(event);
      return;
    }

    void handleSubmit(handleFormSubmit)(event);
  };

  const handleMessageChange = (event, onChange) => {
    const nextValue = event.target.value;

    if (nextValue.length > MESSAGE_CHARACTER_LIMIT) {
      if (!messageLimitAlertedRef.current) {
        messageLimitAlertedRef.current = true;
        void showContributorErrorAlert(
          `Message cannot exceed ${MESSAGE_CHARACTER_LIMIT} characters.`,
        );
      }
      onChange(nextValue.slice(0, MESSAGE_CHARACTER_LIMIT));
      return;
    }

    if (nextValue.length < MESSAGE_CHARACTER_LIMIT) {
      messageLimitAlertedRef.current = false;
    }
    onChange(nextValue);
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
    if (isLoggedIn && auth?.user) {
      const pendingSubmission = readPendingContributorSubmission();
      if (
        pendingSubmission &&
        !pendingSubmissionHandledRef.current &&
        pendingSubmission.contributorOptions.length > 0
      ) {
        pendingSubmissionHandledRef.current = true;
        reset(pendingSubmission.formValues);
        const { contributorOptions, normalizedValues } =
          getContributorSubmissionPayload(pendingSubmission.formValues);

        setIsFormVisible(true);
        setIsSubmitting(true);
        submitContributor({
          formValues: normalizedValues,
          contributorOptions,
        });
        return;
      }

      const {
        fullName,
        email,
        contactCode,
        contactNumber,
        country,
        countryOfResidence,
      } = auth.user;
      setValue("fullName", fullName || "");
      setValue("email", email || "");
      setValue("contactCode", contactCode || "");
      setValue("contactNumber", contactNumber || "");
      const userCountry = country || countryOfResidence;
      if (userCountry) {
        setValue("currentCountry", userCountry);
      }
    }
  }, [isLoggedIn, auth, reset, setValue, submitContributor]);

  useEffect(() => {
    const hasSeenTypingEffect =
      typeof window !== "undefined" &&
      window.localStorage.getItem(CONTRIBUTOR_TYPING_SEEN_KEY) === "true";

    if (hasSeenTypingEffect) {
      setTypedMessage(contributorPrompt);
      setTypedPageHeading(CONTRIBUTOR_HEADING);
      setIsFormVisible(true);
      return;
    }
    setTypedMessage("");
    setTypedPageHeading("");
    setIsFormVisible(false);

    let messageIndex = 0;
    let headingIndex = 0;
    let cleanupHeading = () => {};

    const typeHeading = () => {
      const headingInterval = setInterval(() => {
        headingIndex += 1;
        setTypedPageHeading(CONTRIBUTOR_HEADING.slice(0, headingIndex));

        if (headingIndex >= CONTRIBUTOR_HEADING.length) {
          clearInterval(headingInterval);
          setIsFormVisible(true);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(CONTRIBUTOR_TYPING_SEEN_KEY, "true");
          }
        }
      }, 1);

      cleanupHeading = () => clearInterval(headingInterval);
    };

    const messageInterval = setInterval(() => {
      messageIndex += 1;
      setTypedMessage(contributorPrompt.slice(0, messageIndex));

      if (messageIndex >= contributorPrompt.length) {
        clearInterval(messageInterval);
        typeHeading();
      }
    }, 1);

    return () => {
      clearInterval(messageInterval);
      cleanupHeading();
    };
  }, []);

    const namePortion = typedMessage.slice(0, messagePrefix.length);
  const messagePortion = typedMessage.slice(messagePrefix.length);

  return (
    <div className="bg-white text-black font-sans">
      <Seo path="/become-a-contributor?tab=password" />
      <Container padding={false}>
        <section className="min-h-[60vh] flex items-center justify-center py-0">
          <div className="w-full max-w-5xl md:px-20 lg:px-20">
            <div className="mx-auto mb-0 flex w-full max-w-4xl flex-col items-center gap-0 px-0">
              <p className="min-h-[2.75rem] w-full text-left font-play text-[0.95rem] leading-relaxed text-gray-800 sm:min-h-[3.25rem] sm:text-[1rem]">
                {messagePrefix ? (
                <>
                  <span className="text-primary-blue">{namePortion}</span>
                  {messagePortion}
                </>
              ) : (
                typedMessage
              )}
            </p>
              <h1 className="ai-phone-form-title text-hero mt-5 min-h-[3rem] text-center font-play md:mt-8">
                {typedPageHeading}
              </h1>
            </div>
            <Box
              component="form"
              onSubmit={handleFormGateAndSubmit}
              className={`bg-white p-0 md:p-0 rounded-2xl ${
                isFormVisible ? "visible" : "invisible"
              }`}
            >
              <div className="mt-1 grid grid-cols-1 gap-4 md:mt-2 md:grid-cols-2 md:gap-4">
                <Controller
                  name="contributionType"
                  control={control}
                  rules={{
                    validate: (value) =>
                      value?.length > 0 || "Contribution Type is required",
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Contribution Towards WoNo"
                      variant="standard"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ sx: floatingLabelSx }}
                      SelectProps={{
                        multiple: true,
                        renderValue: (selected) => selected.join(", "),
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              mt: 0.5,
                              maxHeight: 420,
                              "& .MuiMenuItem-root": {
                                minHeight: 32,
                                py: 0.5,
                              },
                            },
                          },
                        },
                      }}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(
                          typeof value === "string" ? value.split(",") : value,
                        );
                      }}
                    >
                      {CONTRIBUTION_TYPE_GROUPS.map((group) => [
                        <ListSubheader
                          key={group.label}
                          disableSticky
                          sx={{
                            color: "black",
                            fontSize: "1rem",
                            fontWeight: 700,
                            lineHeight: 1.4,
                            pt: 1.5,
                            pb: 0.5,
                          }}
                        >
                          {group.label}
                        </ListSubheader>,
                        ...group.options.map((option) => (
                          <MenuItem key={option} value={option}>
                            <Checkbox
                              checked={field.value.includes(option)}
                              size="small"
                              sx={{
                                color: "#666",
                                mr: 1,
                                p: 0,
                                "&.Mui-checked": { color: "#1976d2" },
                              }}
                            />
                            <span>{option}</span>
                          </MenuItem>
                        )),
                      ])}
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
                      SelectProps={{
                        renderValue: (value) => {
                          const selectedOption = countries.find(
                            (country) => country.name === value,
                          );

                          if (!selectedOption) {
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
                                src={getFlagIconUrl(selectedOption.isoCode)}
                                alt={`${selectedOption.name} flag`}
                                width={20}
                                height={15}
                                loading="lazy"
                              />
                              <span>{selectedOption.name}</span>
                            </Box>
                          );
                        },
                      }}
                      onChange={(event) =>
                        handleCountryChange(event.target.value, field.onChange)
                      }
                    >
                      <MenuItem value="" sx={{ fontWeight: 700 }}>
                        SELECT COUNTRY
                      </MenuItem>
                      {countries.map((country) => (
                        <MenuItem
                          key={country.isoCode}
                          value={country.name}
                          sx={tickMenuItemSx}
                        >
                          <Box className="flex w-full items-center gap-2">
                            <HiCheck className="tick-icon" size={16} />
                            <Box className="flex items-center gap-1">
                              <Box
                                component="img"
                                src={getFlagIconUrl(country.isoCode)}
                                alt={`${country.name} flag`}
                                sx={{ width: 20, height: 15, flexShrink: 0 }}
                                loading="lazy"
                              />
                              <span>{country.name}</span>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

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
                          startAdornment: selectedCountryData?.isoCode ? (
                            <InputAdornment position="start">
                              <Box
                                component="img"
                                src={getFlagIconUrl(
                                  selectedCountryData.isoCode,
                                )}
                                alt={`${selectedCountryData.name} flag`}
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
                    rules={{
                      required: "Contact number is required",
                      pattern: {
                        value: /^[0-9]{7,15}$/,
                        message: "Please enter a valid phone number",
                      },
                    }}
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
                      label="Email"
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
                    rules={{
                      maxLength: {
                        value: MESSAGE_CHARACTER_LIMIT,
                        message: `Message cannot exceed ${MESSAGE_CHARACTER_LIMIT} characters`,
                      },
                    }}
                    render={({ field, fieldState }) => {
                      const messageLength = field.value?.length || 0;

                      return (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          minRows={3}
                          label="Message"
                          variant="standard"
                          onChange={(event) =>
                            handleMessageChange(event, field.onChange)
                          }
                          error={!!fieldState.error}
                          helperText={
                            <Box
                              component="span"
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 2,
                              }}
                            >
                              <span>{fieldState.error?.message || " "}</span>
                              <span>
                                {messageLength}/{MESSAGE_CHARACTER_LIMIT}
                              </span>
                            </Box>
                          }
                          InputLabelProps={{
                            sx: floatingLabelSx,
                          }}
                        />
                      );
                    }}
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

export default AiBecomeContributor;
