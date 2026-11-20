import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Country } from "country-state-city";
import { useMutation } from "@tanstack/react-query";
import axios from "../utils/axios";
import AiPrimaryButton from "../components/AiPrimaryButton";
import { isValidEmail } from "../utils/validators";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";

const SIGNUP_PROMPT =
  "Create your account to personalize your journey and unlock the full Nomad experience.";

const SIGNUP_HEADING = "Signup";
const getFlagIconUrl = (isoCode) =>
  `https://flagcdn.com/24x18/${isoCode.toLowerCase()}.png`;

// country-state-city's phonecode is inconsistent ("355", "+1-684", "+358-18"
// ...) — normalize to a plain "+<callingCode>" for display and comparison.
const getCallingCode = (phonecode) => {
  const raw = String(phonecode || "").replace(/^\+/, "").split("-")[0];
  return raw ? `+${raw}` : "";
};

// Mirrors the backend's validateStrongPassword (authControllers.js) so the
// frontend catches it before OTP verification instead of after.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).+$/;
const validateStrongPassword = (password) => {
  if (!password || password.length < 8) return "Must be at least 8 characters long.";
  if (password.length > 72) return "Password cannot exceed 72 characters.";
  if (!PASSWORD_REGEX.test(password)) {
    return "Should include both uppercase and lowercase letters and at least one number or special character.";
  }
  return true;
};

// Matches AiHostSignup's label styling: black until focused/filled, then blue.
const floatingLabelSx = {
  color: "black",
  "&.Mui-focused": { color: "#1976d2" },
  "&.MuiInputLabel-shrink": { color: "#1976d2" },
};

// Keeps the error helper text from pushing the grid layout around when it
// appears/disappears, so the page doesn't shuffle as validation runs.
const stableFieldSx = {
  position: "relative",
  "& .MuiFormHelperText-root": {
    position: "absolute",
    top: "100%",
    left: 0,
    mt: "3px",
    mx: 0,
    lineHeight: 1.25,
  },
};

export default function AiSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [typedSignupHeading, setTypedSignupHeading] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [step, setStep] = useState("form");
  const [pendingSignupData, setPendingSignupData] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [emailCheckState, setEmailCheckState] = useState({
    checking: false,
    exists: false,
    error: "",
  });
  const emailCheckTimerRef = useRef(null);
  const emailCheckRequestRef = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    return () => {
      if (emailCheckTimerRef.current) clearTimeout(emailCheckTimerRef.current);
    };
  }, []);

  const handleEmailChange = (event, onChange) => {
    const value = event.target.value;
    onChange(value);

    if (emailCheckTimerRef.current) clearTimeout(emailCheckTimerRef.current);

    const trimmed = value.trim();
    if (!trimmed || isValidEmail(trimmed) !== true) {
      emailCheckRequestRef.current += 1;
      setEmailCheckState({ checking: false, exists: false, error: "" });
      return;
    }

    const requestId = ++emailCheckRequestRef.current;
    setEmailCheckState((prev) => ({ ...prev, checking: true, error: "" }));

    emailCheckTimerRef.current = setTimeout(async () => {
      try {
        const response = await axios.get("/forms/check-b2c-user-email", {
          params: { email: trimmed },
        });
        if (requestId !== emailCheckRequestRef.current) return;
        setEmailCheckState({
          checking: false,
          exists: Boolean(response.data?.exists),
          error: "",
        });
      } catch {
        if (requestId !== emailCheckRequestRef.current) return;
        setEmailCheckState({
          checking: false,
          exists: false,
          error: "Could not verify email. Please try again.",
        });
      }
    }, 500);
  };

  const handlePhoneCodeChange = (code, onChange) => {
    onChange(code);
    setValue("mobile", "", { shouldDirty: true, shouldTouch: true });
  };

  const handleMobileDigitsChange = (event, onChange, contactCode) => {
    const digits = event.target.value.replace(/\D/g, "");
    const maxDigits = contactCode === "+91" ? 10 : 15;
    if (digits.length > maxDigits) return;
    onChange(digits);
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const { control, handleSubmit, setValue, watch, trigger, getValues, reset } =
    useForm({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      countryOfResidence: "",
      password: "",
      confirmPassword: "",
      contactCode: "",
      mobile: "",
    },
  });

  const contactCode = watch("contactCode");
  const password = watch("password");

  const countries = useMemo(() => Country.getAllCountries(), []);

  const phoneCodeOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    countries.forEach((country) => {
      const code = getCallingCode(country.phonecode);
      if (!code || seen.has(code)) return;
      seen.add(code);
      options.push({ code, isoCode: country.isoCode, name: country.name });
    });
    return options.sort((a, b) => Number(a.code.slice(1)) - Number(b.code.slice(1)));
  }, [countries]);

  const { mutate: submitRegistration, isPending } = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        mobile: `${data.contactCode || ""}${data.mobile || ""}`,
        sheetName: "Sign_up",
      };

      const response = await axios.post(
        "/forms/add-new-b2c-form-submission",
        payload,
      );

      return response.data;
    },
    onSuccess: () => {
      showSuccessAlert(
        "Signup successful! Please check your email for confirmation.",
      );
      reset();
      setStep("form");
      setPendingSignupData(null);
      setOtpValue("");
      navigate("/login", { state: location.state });
    },
    onError: (error) => {
      showErrorAlert(error.response?.data?.message || "Something went wrong");
    },
  });

  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/auth/signup/send-otp", {
        email: data.email,
      });
      return response.data;
    },
    onSuccess: (_response, data) => {
      setPendingSignupData(data);
      setOtpValue("");
      setOtpError("");
      setStep("otp");
    },
    onError: (error) => {
      showErrorAlert(error.response?.data?.message || "Something went wrong");
    },
  });

  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/auth/signup/verify-otp", {
        email: pendingSignupData?.email,
        otp: otpValue,
      });
      return response.data;
    },
    onSuccess: (result) => {
      submitRegistration({
        ...pendingSignupData,
        signupSessionToken: result.signupSessionToken,
      });
    },
    onError: (error) => {
      setOtpError(error.response?.data?.message || "Invalid OTP");
    },
  });

  const isEmailCheckBlocking =
    emailCheckState.checking || emailCheckState.exists || Boolean(emailCheckState.error);

  const handleSignup = (data) => {
    if (isEmailCheckBlocking) return;
    sendOtp(data);
  };

  useEffect(() => {
    setTypedMessage("");
    setTypedSignupHeading("");
    setIsFormVisible(false);

    let messageIndex = 0;
    let signupHeadingIndex = 0;
    let cleanupHeading = () => { };

    const typeSignupHeading = () => {
      const headingInterval = setInterval(() => {
        signupHeadingIndex += 1;
        setTypedSignupHeading(SIGNUP_HEADING.slice(0, signupHeadingIndex));

        if (signupHeadingIndex >= SIGNUP_HEADING.length) {
          clearInterval(headingInterval);
          setIsFormVisible(true);
        }
      }, 7);

      cleanupHeading = () => clearInterval(headingInterval);
    };

    const messageInterval = setInterval(() => {
      messageIndex += 1;
      // setTypedMessage(SIGNUP_PROMPT.slice(0, messageIndex));

      if (messageIndex >= SIGNUP_PROMPT.length) {
        clearInterval(messageInterval);
        typeSignupHeading();
      }
    }, 0);

    return () => {
      clearInterval(messageInterval);
      cleanupHeading();
    };
  }, []);

  const handleCountryChange = (countryName, onChange) => {
    onChange(countryName);

    const country = countries.find((item) => item.name === countryName);
    const code = getCallingCode(country?.phonecode);
    setValue("contactCode", code, { shouldDirty: true, shouldTouch: true });
    setValue("mobile", "", { shouldDirty: true, shouldTouch: true });
  };

  return (
    <div className="flex items-center justify-center px-4 md:h-[60vh] lg:h-[80vh] border-gray-300 rounded-lg">
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
        {/* <p className="mx-auto min-h-[3rem] w-full text-left font-play text-[0.95rem] leading-relaxed text-gray-800 sm:min-h-[3.5rem] sm:text-[1rem]">
          {typedMessage}
        </p> */}

        <h1 className="text-hero min-h-[3rem] text-center font-play">
          {typedSignupHeading}
        </h1>

        {step === "form" && (
        <form
          onSubmit={handleSubmit(handleSignup)}
          className={`w-full grid grid-cols-1 md:grid-cols-2 gap-6 ${isFormVisible ? "visible" : "invisible"
            }`}
        >
          <Controller
            name="fullName"
            control={control}
            rules={{ required: "Full name is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Full Name"
                fullWidth
                variant="standard"
                sx={stableFieldSx}
                InputLabelProps={{ sx: floatingLabelSx }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{ required: "Email is required", validate: isValidEmail }}
            render={({ field, fieldState }) => {
              const emailHelperText =
                fieldState.error?.message ||
                (emailCheckState.checking
                  ? "Checking email..."
                  : emailCheckState.exists
                    ? "This email is already registered. Please use a different email."
                    : emailCheckState.error);

              return (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  autoComplete="off"
                  fullWidth
                  variant="standard"
                  sx={{
                    ...stableFieldSx,
                    "& .MuiFormHelperText-root": {
                      ...stableFieldSx["& .MuiFormHelperText-root"],
                      fontSize: "0.70rem",
                      letterSpacing: "-0.2px",
                      // explicit px breakpoint so this lines up with the
                      // form grid's own Tailwind md: (768px), not MUI's
                      // default md (900px)
                      "@media (min-width:768px)": {
                        fontSize: "0.75rem",
                        letterSpacing: "normal",
                      },
                    },
                  }}
                  InputLabelProps={{ sx: floatingLabelSx }}
                  error={
                    !!fieldState.error ||
                    (!emailCheckState.checking &&
                      (emailCheckState.exists || Boolean(emailCheckState.error)))
                  }
                  helperText={emailHelperText}
                  onChange={(event) => handleEmailChange(event, field.onChange)}
                />
              );
            }}
          />


          <Controller
            name="countryOfResidence"
            control={control}
            rules={{ required: "Country of residence is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Current Country Of Residence"
                fullWidth
                variant="standard"
                sx={stableFieldSx}
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
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
                  handleCountryChange(event.target.value, field.onChange)
                }
              >
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

          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Controller
              name="contactCode"
              control={control}
              rules={{ required: "Code is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Code"
                  variant="standard"
                  sx={{ ...stableFieldSx, minWidth: 100, maxWidth: 140 }}
                  InputLabelProps={{ sx: floatingLabelSx }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  SelectProps={{
                    renderValue: (value) => {
                      const option = phoneCodeOptions.find(
                        (item) => item.code === value,
                      );
                      if (!option) return value;

                      return (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                        >
                          <img
                            src={getFlagIconUrl(option.isoCode)}
                            alt={`${option.name} flag`}
                            width={18}
                            height={13}
                            loading="lazy"
                          />
                          <span>{option.code}</span>
                        </Box>
                      );
                    },
                  }}
                  onChange={(event) =>
                    handlePhoneCodeChange(event.target.value, field.onChange)
                  }
                >
                  {phoneCodeOptions.map((option) => (
                    <MenuItem key={option.isoCode} value={option.code}>
                      <Box
                        component="img"
                        src={getFlagIconUrl(option.isoCode)}
                        alt={`${option.name} flag`}
                        sx={{ width: 18, height: 13, mr: 1, flexShrink: 0 }}
                        loading="lazy"
                      />
                      <span>
                        {option.code} {option.name}
                      </span>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="mobile"
              control={control}
              rules={{
                required: "Mobile number is required",
                pattern: {
                  value: /^[0-9]{7,15}$/,
                  message: "Please enter a valid phone number",
                },
                validate: (value) =>
                  contactCode !== "+91" ||
                  value.length <= 10 ||
                  "Indian phone numbers cannot exceed 10 digits",
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="tel"
                  label="Phone Number"
                  fullWidth
                  variant="standard"
                  sx={stableFieldSx}
                  InputLabelProps={{ sx: floatingLabelSx }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  inputProps={{
                    inputMode: "numeric",
                    maxLength: contactCode === "+91" ? 10 : 15,
                  }}
                  onChange={(event) =>
                    handleMobileDigitsChange(event, field.onChange, contactCode)
                  }
                />
              )}
            />
          </Box>

          <Controller
            name="password"
            control={control}
            rules={{
              required: "Password is required",
              validate: validateStrongPassword,
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                fullWidth
                variant="standard"
                sx={stableFieldSx}
                InputLabelProps={{ sx: floatingLabelSx }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                onChange={(event) => {
                  field.onChange(event);
                  if (getValues("confirmPassword")) trigger("confirmPassword");
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Confirm password is required",
              validate: (value) => value === password || "Passwords do not match",
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                fullWidth
                variant="standard"
                sx={stableFieldSx}
                InputLabelProps={{ sx: floatingLabelSx }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <div className="col-span-1 md:col-span-2 flex justify-center items-center mt-2 py-2 w-full">
            <AiPrimaryButton
              type="submit"
              isLoading={isSendingOtp}
              title="Signup"
              disabled={isSendingOtp || isEmailCheckBlocking}
              bgColor="bg-black"
              hoverColor="hover:bg-gray-800"
              fontSize="text-lg"
              padding="px-8 py-2"
              className="flex text-white font-[500] capitalize w-40"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <p className="text-center">
              Already have an account?&nbsp;
              <span className="underline">
                <Link to="/login" state={location.state}>
                  Login
                </Link>
              </span>
            </p>
          </div>
        </form>
        )}

        {step === "otp" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-6 px-4">
            <p className="text-center text-sm text-gray-700">
              We've sent a 6-digit verification code to{" "}
              <b>{pendingSignupData?.email}</b>. Enter it below to complete
              your signup.
            </p>

            <TextField
              label="OTP"
              fullWidth
              variant="standard"
              value={otpValue}
              onChange={(event) => {
                setOtpError("");
                setOtpValue(event.target.value.replace(/\D/g, "").slice(0, 6));
              }}
              onPaste={(event) => {
                event.preventDefault();
                setOtpError("");
                setOtpValue(
                  event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6),
                );
              }}
              inputProps={{ "data-allow-context-menu": true }}
              error={!!otpError}
              helperText={otpError}
            />

            <AiPrimaryButton
              type="button"
              handleSubmit={() => verifyOtp()}
              isLoading={isVerifyingOtp || isPending}
              title="Verify & Signup"
              disabled={isVerifyingOtp || isPending || otpValue.length !== 6}
              bgColor="bg-black"
              hoverColor="hover:bg-gray-800"
              fontSize="text-lg"
              padding="px-8 py-2"
              className="flex text-white font-[500] capitalize w-full"
            />

            <p className="text-center text-sm">
              Didn't get the code?&nbsp;
              <button
                type="button"
                className="underline disabled:opacity-50"
                onClick={() => sendOtp(pendingSignupData)}
                disabled={isSendingOtp}
              >
                Resend OTP
              </button>
            </p>

            <button
              type="button"
              className="text-center text-sm underline text-gray-500"
              onClick={() => setStep("form")}
            >
              Edit details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
