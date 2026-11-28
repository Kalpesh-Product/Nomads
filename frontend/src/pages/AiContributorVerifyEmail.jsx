import { useCallback, useEffect, useRef, useState } from "react";
import { TextField } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import AiPrimaryButton from "../components/AiPrimaryButton";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { api } from "../utils/axios";

const OTP_LENGTH = 6;
const inheritFontSx = {
  "& .MuiInputBase-root, & .MuiInputLabel-root, & .MuiFormHelperText-root": {
    fontFamily: "inherit",
  },
};

const getErrorInfo = (error) => ({
  code: error?.response?.data?.code,
  message:
    error?.response?.data?.message ||
    (error?.response ? "Something went wrong." : "Network error. Please try again."),
});

export default function AiContributorVerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [stage, setStage] = useState("sending");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [linkError, setLinkError] = useState(null);
  const didAutoSend = useRef(false);

  useEffect(() => {
    if (stage !== "verified") return;
    showSuccessAlert(
      "Your email is verified and your submission is now with our team.",
      { title: "Email Verified!" },
    ).then(() => navigate("/become-a-contributor", { replace: true }));
  }, [stage, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendOtp = useCallback(async (resend = false) => {
    if (!token) {
      setLinkError({ code: "LINK_INVALID", message: "This verification link is invalid." });
      return false;
    }
    try {
      const { data } = await api.post("/forms/contributor-email/send-otp", { token, resend });
      setMaskedEmail(data.email || "");
      if (data.alreadyVerified) {
        setStage("verified");
        return true;
      }
      setCooldown(Number(data.retryAfterSeconds) || 0);
      setStage("otp");
      return true;
    } catch (error) {
      const info = getErrorInfo(error);
      if (info.code === "LINK_EXPIRED" || info.code === "LINK_INVALID") setLinkError(info);
      else {
        void showErrorAlert(info.message);
        setStage("otp");
      }
      return false;
    }
  }, [token]);

  useEffect(() => {
    if (didAutoSend.current) return;
    didAutoSend.current = true;
    void sendOtp();
  }, [sendOtp]);

  const handleResend = async () => {
    setIsResending(true);
    setOtpError("");
    await sendOtp(true);
    setIsResending(false);
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }
    setIsVerifying(true);
    setOtpError("");
    try {
      await api.post("/forms/contributor-email/verify-otp", { token, otp });
      setStage("verified");
    } catch (error) {
      const info = getErrorInfo(error);
      if (info.code === "LINK_EXPIRED" || info.code === "LINK_INVALID") setLinkError(info);
      else setOtpError(info.message);
    } finally {
      setIsVerifying(false);
    }
  };

  let content;
  if (linkError) {
    content = (
      <>
        <h1 className="min-h-[3rem] text-center font-play text-hero">
          {linkError.code === "LINK_EXPIRED" ? "Link Expired" : "Invalid Link"}
        </h1>
        <p className="max-w-lg text-center text-gray-600">{linkError.message}</p>
        <button type="button" onClick={() => navigate("/become-a-contributor", { replace: true })} className="text-sm text-primary-blue underline">
          Return to Become a Contributor
        </button>
      </>
    );
  } else if (stage === "verified") {
    content = null;
  } else if (stage === "sending") {
    content = (
      <>
        <h1 className="min-h-[3rem] text-center font-play text-hero">Verify Your Submission</h1>
        <p className="text-center text-gray-600">Sending a verification code to your email…</p>
      </>
    );
  } else {
    content = (
      <>
        <h1 className="min-h-[3rem] text-center font-play text-hero">Verify Your Submission</h1>
        <div className="text-center text-gray-600">
          <p>We&apos;ve sent a {OTP_LENGTH}-digit code to</p>
          <p className="break-all font-semibold text-gray-800">{maskedEmail || "your email"}</p>
          <p>Enter it below to complete your submission.</p>
        </div>
        <form onSubmit={handleVerify} className="flex w-full max-w-xs flex-col gap-5">
          <TextField
            label="Verification code"
            variant="standard"
            sx={inheritFontSx}
            fullWidth
            autoFocus
            value={otp}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
              setOtpError("");
            }}
            onPaste={(event) => {
              event.preventDefault();
              setOtp(event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH));
              setOtpError("");
            }}
            error={Boolean(otpError)}
            helperText={otpError}
            inputProps={{
              inputMode: "numeric",
              autoComplete: "one-time-code",
              maxLength: OTP_LENGTH,
              "data-allow-context-menu": true,
              style: { letterSpacing: "0.5em", textAlign: "center" },
            }}
          />
          <div className="flex justify-center">
            <AiPrimaryButton title="Verify" type="submit" isLoading={isVerifying} disabled={otp.length !== OTP_LENGTH} className="px-8 font-[500] text-white" />
          </div>
        </form>
        <button type="button" onClick={handleResend} disabled={cooldown > 0 || isResending} className="text-sm text-primary-blue underline disabled:text-gray-400 disabled:no-underline">
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </>
    );
  }

  return (
    <div className="flex h-[55vh] flex-col items-center justify-center gap-14 rounded-lg border-gray-300 p-8 md:h-[60vh] lg:h-[75vh]">
      <div className="flex w-full max-w-4xl flex-col items-center gap-6">{content}</div>
    </div>
  );
}
