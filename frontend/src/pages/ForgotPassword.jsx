import { TextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "../utils/axios";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { email: "" },
  });

  const { mutate: sendEmail, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("auth/forgot-password", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Password reset link sent to your email");
      reset();
      // Optional: navigate("/login");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to send email. Please try again."
      );
    },
  });

  const onSubmit = (data) => sendEmail(data);

  return (
    <div className="flex items-center justify-center flex-col gap-14 h-[55vh] md:h-[60vh] lg:h-[75vh] border-gray-300 rounded-lg p-8">
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
        <h1 className="text-hero text-center">Forgot Password</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-1/2 grid grid-cols-1 md:grid-cols-1 gap-6"
        >
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

          <div className="col-span-1 md:col-span-2 flex justify-center items-center mt-2 py-2">
            <PrimaryButton
              title="Send"
              type="submit"
              isLoading={isPending}
              disabled={isPending}
              className="bg-[#FF5757] flex text-white font-[500] capitalize hover:bg-[#E14C4C] w-[7rem] px-6"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
