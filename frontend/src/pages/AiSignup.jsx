import { TextField, IconButton, InputAdornment, MenuItem } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Country } from "country-state-city";
import AiPrimaryButton from "../components/AiPrimaryButton";

const SIGNUP_PROMPT =
  "Create your account to personalize your journey and unlock the full Nomad experience.";

const SIGNUP_HEADING = "Signup";

export default function AiSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [typedSignupHeading, setTypedSignupHeading] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: "India",
      password: "",
      confirmPassword: "",
      mobile: "+91",
    },
  });

  const selectedCountryName = watch("country");

  const countries = useMemo(() => Country.getAllCountries(), []);
  const selectedCountry = useMemo(
    () =>
      countries.find((country) => country.name === selectedCountryName) ||
      countries.find((country) => country.isoCode === "IN"),
    [countries, selectedCountryName],
  );

  const handleSignup = () => {
    navigate("/ai-login");
  };

  useEffect(() => {
    setTypedMessage("");
    setTypedSignupHeading("");
    setIsFormVisible(false);

    let messageIndex = 0;
    let signupHeadingIndex = 0;
    let cleanupHeading = () => {};

    const typeSignupHeading = () => {
      const headingInterval = setInterval(() => {
        signupHeadingIndex += 1;
        setTypedSignupHeading(SIGNUP_HEADING.slice(0, signupHeadingIndex));

        if (signupHeadingIndex >= SIGNUP_HEADING.length) {
          clearInterval(headingInterval);
          setIsFormVisible(true);
        }
      }, 35);

      cleanupHeading = () => clearInterval(headingInterval);
    };

    const messageInterval = setInterval(() => {
      messageIndex += 1;
      setTypedMessage(SIGNUP_PROMPT.slice(0, messageIndex));

      if (messageIndex >= SIGNUP_PROMPT.length) {
        clearInterval(messageInterval);
        typeSignupHeading();
      }
    }, 25);

    return () => {
      clearInterval(messageInterval);
      cleanupHeading();
    };
  }, []);

  const handleCountryChange = (countryName, onChange) => {
    const country = countries.find((item) => item.name === countryName);
    const phonePrefix = country?.phonecode ? `+${country.phonecode}` : "";

    onChange(countryName);
    setValue("mobile", phonePrefix, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="flex items-center justify-center px-4 md:h-[60vh] lg:h-[80vh] border-gray-300 rounded-lg">
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
        <p className="mx-auto min-h-[3rem] w-full text-left font-play text-[0.95rem] leading-relaxed text-gray-800 sm:min-h-[3.5rem] sm:text-[1.2rem]">
          {typedMessage}
        </p>

        <h1 className="text-hero min-h-[3rem] text-center font-play">
          {typedSignupHeading}
        </h1>

        <form
          onSubmit={handleSubmit(handleSignup)}
          className={`w-full grid grid-cols-1 md:grid-cols-2 gap-6 ${
            isFormVisible ? "visible" : "invisible"
          }`}
        >
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Full Name"
                fullWidth
                variant="standard"
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                fullWidth
                variant="standard"
              />
            )}
          />

          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Current Country Of Residence"
                fullWidth
                variant="standard"
                onChange={(event) =>
                  handleCountryChange(event.target.value, field.onChange)
                }
              >
                {countries.map((country) => (
                  <MenuItem key={country.isoCode} value={country.name}>
                    {country.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="mobile"
            control={control}
            render={({ field }) => (
              <MuiTelInput
                {...field}
                label="Mobile"
                fullWidth
                defaultCountry={selectedCountry?.isoCode || "IN"}
                forceCallingCode
                variant="standard"
                onChange={(value) => field.onChange(value)}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="standard"
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
            render={({ field }) => (
              <TextField
                {...field}
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                variant="standard"
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
              title="Signup"
              className="bg-primary-blue flex text-white font-[500] capitalize hover:bg-primary-light w-full sm:w-[7rem] px-6"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <p className="text-center">
              Already have an account?&nbsp;
              <span className="underline">
                <Link to="/ai-login">Login</Link>
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
