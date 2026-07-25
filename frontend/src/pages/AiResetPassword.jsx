import { TextField, IconButton, InputAdornment } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../utils/axios"; // ✅ use same axios config
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff, FiCheckCircle, FiXCircle } from "react-icons/fi";
import useAuth from "../hooks/useAuth";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import AiPrimaryButton from "../components/AiPrimaryButton";

export default function AiResetPassword() {
  const { token } = useParams();
  const location = useLocation();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const resetSessionToken = location.state?.resetSessionToken || "";
  const isOtpFlow = Boolean(resetSessionToken);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // inside your component
  useEffect(() => {
    if (auth?.user) navigate("/profile", { replace: true });
  }, [auth, navigate]);

  useEffect(() => {
    if (!token && !resetSessionToken) {
      showErrorAlert("Reset session missing. Please verify OTP again.");
      navigate("/forgot-password", { replace: true });
    }
  }, [token, resetSessionToken, navigate]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const { mutate: submitReset, isPending: isResetPending } = useMutation({
    mutationFn: async (data) => {
      const payload = {
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      const response = isOtpFlow
        ? await axios.post("auth/forgot-password/reset", {
            ...payload,
            resetSessionToken,
          })
        : await axios.patch(`auth/reset-password/${token}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      showSuccessAlert(data?.message || "Password reset successful");
      reset();
      navigate("/login");
    },
    onError: (error) => {
      if (error.response) {
        const { status, data } = error.response;
        let message = "Something went wrong";
        if (status === 400) message = data.message || "All fields are required";
        else if (status === 401 && data?.message) message = data.message;
        else if (status === 500)
          message = "Internal server error. Please try again.";
        showErrorAlert(message);
      } else {
        showErrorAlert("Network error. Please check your connection.");
      }
    },
  });

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      showErrorAlert("Passwords do not match");
      return;
    }
    submitReset(data);
  };

  const passwordChecks = [
    {
      key: "length",
      label: "Must be at least 8 characters long.",
      passed: password.length >= 8,
    },
    {
      key: "case",
      label: "Should include uppercase and lowercase letters.",
      passed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    {
      key: "digitOrSpecial",
      label: "Must contain at least one number or special character.",
      passed: /[\d\W]/.test(password),
    },
  ];
  const hasConfirmValue = confirmPassword.length > 0;
  const isPasswordMatch = password === confirmPassword;

  return (
    <div className="flex items-center justify-center flex-col gap-14 h-[65vh] md:h-[70vh] lg:h-[85vh] border-gray-300 rounded-lg p-8">
      <div className="flex flex-col items-center gap-10 w-full max-w-6xl">
        <h1 className="text-hero text-center font-play min-h-[3rem]" style={{ marginBottom: "revert" }}>
          Reset Password
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* New Password */}
          <Controller
            name="password"
            control={control}
            rules={{ required: "New password is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="New Password"
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

          {/* Confirm Password */}
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                required
                variant="standard"
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

          {hasConfirmValue ? (
            <div
              className={`col-span-1 md:col-span-2 -mt-4 text-left text-xs ${
                isPasswordMatch ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPasswordMatch ? "Passwords match." : "Passwords do not match."}
            </div>
          ) : null}

          <div className="col-span-1 md:col-span-2 -mt-2 text-left text-xs leading-6">
            {passwordChecks.map((rule) => (
              <p
                key={rule.key}
                className={`flex items-center gap-1 ${
                  rule.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {rule.passed ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                <span>{rule.label}</span>
              </p>
            ))}
          </div>

          {/* Submit Button */}
          <div className="col-span-1 md:col-span-2 flex justify-center items-center mt-2 py-2">
            <AiPrimaryButton
              title="Reset"
              type="submit"
              isLoading={isResetPending}
              disabled={isResetPending}
              bgColor="bg-black"
              hoverColor="hover:bg-gray-800"
              fontSize="text-lg"
              padding="px-8 py-2"
              className="flex text-white font-[500] capitalize w-40"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
