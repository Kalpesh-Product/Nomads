import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import axios from "../utils/axios";
import AiPrimaryButton from "../components/AiPrimaryButton";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";

// Matches AiHostSignup's label styling: black until focused/filled, then blue.
const floatingLabelSx = {
  color: "black",
  "&.Mui-focused": { color: "#1976d2" },
  "&.MuiInputLabel-shrink": { color: "#1976d2" },
};

export default function AiVerifyForgotPasswordOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationFn: async () => {
      const response = await axios.post("auth/forgot-password/verify-otp", {
        email,
        otp,
      });
      return response.data;
    },
    onSuccess: (data) => {
      showSuccessAlert(data?.message || "OTP verified successfully.");
      navigate("/forgot-password/reset", {
        state: { email, resetSessionToken: data?.resetSessionToken || "" },
      });
    },
    onError: (error) => {
      showErrorAlert(error.response?.data?.message || "OTP verification failed.");
    },
  });

  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationFn: async () => {
      const response = await axios.post("auth/forgot-password/start", { email });
      return response.data;
    },
    onSuccess: (data) => {
      showSuccessAlert(data?.message || "OTP resent successfully.");
      setResendCooldown(30);
    },
    onError: (error) => {
      showErrorAlert(error.response?.data?.message || "Failed to resend OTP.");
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    verifyOtp();
  };

  return (
    <div className="flex items-center justify-center flex-col gap-14 h-[55vh] md:h-[60vh] lg:h-[75vh] border-gray-300 rounded-lg p-8">
      <div className="flex flex-col items-center gap-10 w-full max-w-6xl">
        <h1 className="text-hero text-center font-play min-h-[3rem]" style={{ marginBottom: "revert" }}>
          Verify OTP
        </h1>
        <p className="text-center text-sm text-gray-700 -mt-6">
          {email ? (
            <>
              Enter the OTP sent to <span className="font-semibold text-gray-900">{email}</span>
            </>
          ) : (
            "Enter the OTP sent to your email"
          )}
        </p>

        <form onSubmit={onSubmit} className="w-full flex flex-col items-center gap-6">
          <div className="w-full sm:w-1/2 flex flex-col gap-2">
            <TextField
              label="OTP"
              variant="standard"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onPaste={(e) => {
                e.preventDefault();
                setOtp(e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6));
              }}
              inputProps={{
                inputMode: "numeric",
                maxLength: 6,
                "data-allow-context-menu": true,
              }}
              InputLabelProps={{ sx: floatingLabelSx }}
              fullWidth
            />

            <div className="text-end">
              {resendCooldown > 0 ? (
                <span className="text-black/60 text-sm">Resend OTP in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  disabled={isResending}
                  onClick={() => resendOtp()}
                  className="hover:underline text-black text-sm disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-center items-center">
            <AiPrimaryButton
              title="Verify"
              type="submit"
              isLoading={isVerifying}
              disabled={isVerifying || otp.length !== 6}
              bgColor="bg-black"
              hoverColor="hover:bg-gray-800"
              fontSize="text-lg"
              padding="px-8 py-2"
              className="flex text-white font-[500] capitalize w-40"
            />
          </div>

          <p className="text-center">
            Already have an account?&nbsp;
            <span className="underline">
              <Link to="/login">Login</Link>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
