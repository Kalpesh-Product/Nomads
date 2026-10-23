import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TextField } from "@mui/material";
import { api } from "../../utils/axios";
import { showErrorAlert, showSuccessAlert } from "../../utils/alerts";
import AiPrimaryButton from "../../components/AiPrimaryButton";

const OTP_LENGTH = 6;

// MUI inputs default to Roboto; keep them on the site font like the rest of the page.
const inheritFontSx = {
  "& .MuiInputBase-root, & .MuiInputLabel-root, & .MuiFormHelperText-root": {
    fontFamily: "inherit",
  },
};

const getErrorInfo = (error) => ({
  code: error?.response?.data?.code,
  message:
    error?.response?.data?.message ||
    (error?.response ? "Something went wrong" : "Network error. Please try again."),
});

// Landing page for the "Verify your email" link sent after a host signup:
// requests an OTP by email, then takes the code. States:
// sending -> otp -> verified, with `linkError` for an invalid/expired link.
export default function AiHostVerifyEmail() {
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
  const [requestEmail, setRequestEmail] = useState("");
  const [linkRequested, setLinkRequested] = useState(false);
  const [isRequestingLink, setIsRequestingLink] = useState(false);
  const didAutoSend = useRef(false);

  // Verified: confirm with the standard success popup, then send them on to
  // the become-a-host page (instead of a static "verified" screen).
  useEffect(() => {
    if (stage !== "verified") return;
    showSuccessAlert(
      "Your email is verified. Our team will review your request and contact you shortly.",
      { title: "Email Verified!" },
    ).then(() => navigate("/", { replace: true }));
  }, [stage, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // resend=false: the automatic request when the page opens (the server won't
  // email a second code if one is still usable). resend=true: the Resend button.
  const sendOtp = useCallback(async (resend = false) => {
    if (!token) {
      setLinkError({
        code: "LINK_INVALID",
        message: "This verification link is invalid.",
      });
      return false;
    }
    try {
      const { data } = await api.post("/forms/host-email/send-otp", { token, resend });
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
      if (info.code === "LINK_EXPIRED" || info.code === "LINK_INVALID") {
        setLinkError(info);
      } else {
        showErrorAlert(info.message);
        setStage("otp");
      }
      return false;
    }
  }, [token]);

  // The link is the user's request to verify, so the code goes out as soon as
  // the page opens (guarded so StrictMode's double-mount can't send two).
  useEffect(() => {
    if (didAutoSend.current) return;
    didAutoSend.current = true;
    sendOtp();
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
      await api.post("/forms/host-email/verify-otp", { token, otp });
      setStage("verified");
    } catch (error) {
      const info = getErrorInfo(error);
      if (info.code === "LINK_EXPIRED" || info.code === "LINK_INVALID") {
        setLinkError(info);
      } else {
        setOtpError(info.message);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRequestLink = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestEmail)) {
      showErrorAlert("Enter the email address you signed up with.");
      return;
    }
    setIsRequestingLink(true);
    try {
      await api.post("/forms/host-email/resend-link", { email: requestEmail });
      setLinkRequested(true);
    } catch (error) {
      showErrorAlert(getErrorInfo(error).message);
    } finally {
      setIsRequestingLink(false);
    }
  };

  let content;
  if (linkError) {
    content = (
      <>
        <h1 className="text-hero text-center font-play min-h-[3rem]">
          {linkError.code === "LINK_EXPIRED" ? "Link Expired" : "Invalid Link"}
        </h1>
        <p className="text-center text-gray-600">{linkError.message}</p>
        {linkRequested ? (
          <p className="text-center text-gray-800">
            If that email has a pending request, a new verification link is on
            its way. Please check your inbox.
          </p>
        ) : (
          <form
            onSubmit={handleRequestLink}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            <TextField
              label="Email address"
              type="email"
              variant="standard"
              sx={inheritFontSx}
              fullWidth
              value={requestEmail}
              onChange={(event) => setRequestEmail(event.target.value.replace(/\s/g, ""))}
            />
            <div className="flex justify-center">
              <AiPrimaryButton
                title="Send new link"
                type="submit"
                isLoading={isRequestingLink}
                className="text-white font-[500] px-6"
              />
            </div>
          </form>
        )}
      </>
    );
  } else if (stage === "verified") {
    // The success popup (see the effect above) takes over from here.
    content = null;
  } else if (stage === "sending") {
    content = (
      <>
        <h1 className="text-hero text-center font-play min-h-[3rem]">Verify Your Email</h1>
        <p className="text-center text-gray-600">
          Sending a verification code to your email…
        </p>
      </>
    );
  } else {
    content = (
      <>
        <h1 className="text-hero text-center font-play min-h-[3rem]">Verify Your Email</h1>
        <div className="text-center text-gray-600">
          <p>We&apos;ve sent a {OTP_LENGTH}-digit code to</p>
          <p className="font-semibold text-gray-800 break-all">
            {maskedEmail || "your email"}
          </p>
          <p>Enter it below to verify your address.</p>
        </div>
        <form
          onSubmit={handleVerify}
          className="w-full max-w-xs flex flex-col gap-5"
        >
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
            error={Boolean(otpError)}
            helperText={otpError}
            inputProps={{
              inputMode: "numeric",
              autoComplete: "one-time-code",
              style: { letterSpacing: "0.5em", textAlign: "center" },
            }}
          />
          <div className="flex justify-center">
            <AiPrimaryButton
              title="Verify"
              type="submit"
              isLoading={isVerifying}
              disabled={otp.length !== OTP_LENGTH}
              className="text-white font-[500] px-8"
            />
          </div>
        </form>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="text-sm text-primary-blue underline disabled:text-gray-400 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </>
    );
  }

  return (
    <div className="flex items-center justify-center flex-col gap-14 h-[55vh] md:h-[60vh] lg:h-[75vh] border-gray-300 rounded-lg p-8">
      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
        {content}
      </div>
    </div>
  );
}
