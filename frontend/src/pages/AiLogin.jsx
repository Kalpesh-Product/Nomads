import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import AiPrimaryButton from "../components/AiPrimaryButton";

const LOGIN_PROMPT =
  "Log in to unlock all features and get the most out of your Nomad experience.";

export default function AiLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  useEffect(() => {
    setTypedMessage("");

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      currentIndex += 1;
      setTypedMessage(LOGIN_PROMPT.slice(0, currentIndex));

      if (currentIndex >= LOGIN_PROMPT.length) {
        clearInterval(typingInterval);
      }
    }, 25);

    return () => clearInterval(typingInterval);
  }, []);

  const { control } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = (event) => {
    event.preventDefault();
    navigate("/home?login=true");
  };

  return (
    <>
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-10 rounded-lg border-gray-300 px-6 py-8 md:min-h-[60vh] lg:min-h-[75vh]">
        <div className="w-full max-w-4xl">
          <p className="mx-auto min-h-[3rem] w-full text-center font-play text-[1rem] leading-relaxed text-gray-900 sm:min-h-[3.5rem] sm:text-[1.4rem]">
            {typedMessage}
          </p>
        </div>
        <div className="flex w-full max-w-4xl flex-col items-center gap-6">
          <h1 className="text-hero text-center">Login</h1>

          <form
            onSubmit={handleLogin}
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
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
                className="bg-primary-blue flex text-white font-[500] capitalize hover:bg-primary-light w-full sm:w-[7rem] px-6"
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
