import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import PrimaryButton from "../components/PrimaryButton";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AiLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

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
    <div className="flex items-center justify-center flex-col gap-14 h-[55vh] md:h-[60vh] lg:h-[75vh] border-gray-300 rounded-lg p-8">
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
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
            <PrimaryButton
              title="Login"
              type="submit"
              className="bg-[#FF5757] flex text-white font-[500] capitalize hover:bg-[#E14C4C] w-full sm:w-[7rem] px-6"
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
  );
}
