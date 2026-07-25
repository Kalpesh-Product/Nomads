import { TextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect } from "react";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import AiPrimaryButton from "./../components/AiPrimaryButton";

export default function AiForgotPassword() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm({
    defaultValues: { email: "" },
  });

  // inside your component
  useEffect(() => {
    if (auth?.user) navigate("/profile", { replace: true });
  }, [auth, navigate]);

  const { mutate: sendOtp, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("auth/forgot-password/start", data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      showSuccessAlert(data?.message || "OTP sent to your email");
      navigate("/forgot-password/verify", {
        state: { email: variables.email },
      });
    },
    onError: (error) => {
      showErrorAlert(
        error.response?.data?.message ||
          "Failed to send email. Please try again.",
      );
    },
  });

  const onSubmit = (data) => sendOtp(data);

  return (
    <div className="flex items-center justify-center flex-col gap-14 h-[55vh] md:h-[60vh] lg:h-[75vh] border-gray-300 rounded-lg p-8">
      <div className="flex flex-col items-center gap-10 w-full max-w-6xl">
        <h1 className="text-hero text-center font-play min-h-[3rem]">Forgot Password?</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col items-center gap-6"
        >
          {/* Email Input */}
          <div className="w-full sm:w-1/2">
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
          </div>

          {/* Submit Button */}
          <div className="w-full sm:w-auto flex justify-center items-center mt-2 py-2">
            <AiPrimaryButton
              title="Send"
              type="submit"
              isLoading={isPending}
              disabled={isPending}
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
