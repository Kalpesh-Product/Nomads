import { TextField, IconButton, InputAdornment } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { axiosInstance } from "../utils/axios"; // ✅ use same axios config as signup
import toast from "react-hot-toast";
import PrimaryButton from "../components/PrimaryButton";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: submitLogin, isPending: isLoginPending } = useMutation({
    mutationFn: async (data) => {
      const payload = {
        email: data.email,
        password: data.password,
      };

      const response = await axios.post("auth/login", payload);
      console.log("resp", response.data.accessToken);
      setAuth((prevState) => ({
        ...prevState,
        accessToken: response?.data?.accessToken,
        user: response.data.user,
      }));

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Login successful");
      reset();

      // ✅ Redirect to profile page after login
      navigate("/profile");
    },
    onError: (error) => {
      if (error.response) {
        const { status, data } = error.response;
        let message = "Something went wrong";

        if (status === 400) message = "Email and password are required";
        else if (status === 401 && data?.message) message = data.message;
        else if (status === 500)
          message = "Internal server error. Please try again.";

        toast.error(message);
      } else {
        toast.error("Network error. Please check your connection.");
      }
    },
  });

  const onSubmit = (data) => submitLogin(data);

  return (
    <div className="flex items-center justify-center flex-col gap-14 h-[55vh] md:h-[60vh] lg:h-[75vh] border-gray-300 rounded-lg p-8">
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
        <h1 className="text-hero text-center">Login</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Email */}
          <Controller
            name="email"
            control={control}
            rules={{ required: "Email is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                required
                variant="standard"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Password */}
          <Controller
            name="password"
            control={control}
            rules={{ required: "Password is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                variant="standard"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
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

          {/* Submit Button */}
          <div className="col-span-1 md:col-span-2 flex justify-center items-center mt-2 py-2">
            <PrimaryButton
              title={"Login"}
              type="submit"
              isLoading={isLoginPending}
              disabled={isLoginPending}
              className="bg-[#FF5757] flex text-white font-[500] capitalize hover:bg-[#E14C4C] w-[7rem] px-6"
            />
          </div>

          {/* Signup Link */}
          <div className="col-span-1 md:col-span-2">
            <p className="text-center">
              New to WoNo?&nbsp;
              <span className="underline">
                <Link to="/signup">Sign Up</Link>
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
