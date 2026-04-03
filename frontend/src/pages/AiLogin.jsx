import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import AiPrimaryButton from "../components/AiPrimaryButton";

const LOGIN_PROMPT =
  "Login to unlock all features and get the most out of your Nomad experience.";

const LOGIN_HEADING = "Login";

const toSentenceCase = (value = "") => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  return `${trimmedValue.charAt(0).toUpperCase()}${trimmedValue
    .slice(1)
    .toLowerCase()}`;
};

export default function AiLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { redirectGoal } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [typedHeading, setTypedHeading] = useState("");
  const [typedDescription, setTypedDescription] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const [typedLoginHeading, setTypedLoginHeading] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const loginContext = useMemo(() => {
    if (!location.state || typeof location.state !== "object") {
      return null;
    }

    const context = location.state.loginContext;

    if (
      !context ||
      typeof context.title !== "string" ||
      typeof context.description !== "string"
    ) {
      return null;
    }

    return {
      title: context.title,
      description: context.description,
    };
  }, [location.state]);

  useEffect(() => {
    setTypedHeading("");
    setTypedDescription("");
    setTypedMessage("");
    setTypedLoginHeading("");
    setIsFormVisible(false);

    let descriptionIndex = 0;
    let messageIndex = 0;
    let loginHeadingIndex = 0;
    let cleanupDescription = () => { };
    let cleanupMessage = () => { };
    let cleanupLoginHeading = () => { };

    const typeLoginHeading = () => {
      const loginHeadingInterval = setInterval(() => {
        loginHeadingIndex += 1;
        setTypedLoginHeading(LOGIN_HEADING.slice(0, loginHeadingIndex));

        if (loginHeadingIndex >= LOGIN_HEADING.length) {
          clearInterval(loginHeadingInterval);
          setIsFormVisible(true);
        }
      }, 35);

      cleanupLoginHeading = () => clearInterval(loginHeadingInterval);
    };

    const typeLoginPrompt = () => {
      const messageInterval = setInterval(() => {
        messageIndex += 1;
        setTypedMessage(LOGIN_PROMPT.slice(0, messageIndex));

        if (messageIndex >= LOGIN_PROMPT.length) {
          clearInterval(messageInterval);
          typeLoginHeading();
        }
      }, 25);

      cleanupMessage = () => clearInterval(messageInterval);
    };

    if (!loginContext) {
      typeLoginPrompt();

      return () => {
        cleanupMessage();
        cleanupLoginHeading();
      };
    }

    setTypedHeading(toSentenceCase(loginContext.title));
    const descriptionInterval = setInterval(() => {
      descriptionIndex += 1;
      setTypedDescription(loginContext.description.slice(0, descriptionIndex));

      if (descriptionIndex >= loginContext.description.length) {
        clearInterval(descriptionInterval);
        typeLoginPrompt();
      }
    }, 25);

    cleanupDescription = () => clearInterval(descriptionInterval);

    return () => {
      cleanupDescription();
      cleanupMessage();
      cleanupLoginHeading();
    };
  }, [loginContext]);

  const { control } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resolveRedirectPath = () => {
    if (
      location.state &&
      typeof location.state === "object" &&
      typeof location.state.redirectTo === "string" &&
      location.state.redirectTo.startsWith("/")
    ) {
      return location.state.redirectTo;
    }

    if (redirectGoal) {
      return `/search/${redirectGoal}/results`;
    }

    return "/home";
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const redirectPath = resolveRedirectPath();
    const [pathname, search = ""] = redirectPath.split("?");
    const nextParams = new URLSearchParams(search);
    nextParams.set("login", "true");

    navigate({
      pathname,
      search: `?${nextParams.toString()}`,
    });
  };

  return (
    <>
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-10 rounded-lg border-gray-300 px-6 py-8 md:min-h-[60vh] lg:min-h-[75vh]">
        <div className="w-full max-w-4xl">
          {loginContext ? (
            <h2 className="mx-auto min-h-[2rem] w-full text-center font-play text-[1.1rem] font-medium leading-relaxed text-gray-900 sm:min-h-[2.4rem] sm:text-[1.6rem]">
              {typedHeading}
            </h2>
          ) : null}
          {loginContext ? (
            <p className="mx-auto mt-5 min-h-[3rem] w-full text-left font-play text-[0.95rem] leading-relaxed text-gray-800 sm:min-h-[3.5rem] sm:text-[1.2rem]">
              {typedDescription}
            </p>
          ) : null}
          <p className="mx-auto min-h-[3rem] w-full text-left font-play text-[0.95rem] leading-relaxed text-gray-800 sm:min-h-[3.5rem] sm:text-[1.2rem]">
            {typedMessage}
          </p>
        </div>
        <div className="flex w-full max-w-4xl flex-col items-center gap-6">
          <h1 className="text-hero min-h-[3rem] text-center font-play">
            {typedLoginHeading}
          </h1>

          <form
            onSubmit={handleLogin}
            className={`w-full grid grid-cols-1 gap-6 md:grid-cols-2 ${isFormVisible ? "visible" : "invisible"
              }`}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  variant="standard"
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

            <div className="col-span-1 md:col-span-2 flex justify-center items-center mt-2 py-2 w-full">
              <AiPrimaryButton
                title="Login"
                type="submit"
                className="bg-primary-blue flex text-white font-[500] capitalize hover:bg-black w-full sm:w-[7rem] px-6"
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-center items-center md:gap-2 text-center">
              <p className="text-gray-600 hover:text-black underline mb-1 md:mb-0">
                <Link to="/forgot-password">Forgot password?</Link>
              </p>

              <p className="hidden md:block">|</p>

              <p className="text-gray-600 hover:text-black ">
                <span>New to WoNo? </span>
                <span className="underline">
                  <Link to="/ai-signup">Sign Up</Link>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
