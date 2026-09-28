import { uploadFileToS3 } from "../../config/s3Config.js";
import { randomUUID, randomInt, createHash, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import yup from "yup";
import mongoose from "mongoose";
import WebsiteTemplate from "../../models/WebsiteTemplate.js";
import HostUser from "../../models/HostUser.js";
import Otp from "../../models/Otp.js";
import {
  attachHostUserToClick,
  findUnusedVerifyClick,
} from "../verifyBusinessClickController.js";
import sharp from "sharp";
import { sendMail, sendAdminFormNotification } from "../../config/mailer.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  referenceDateStamp,
  formatSubmittedOn,
  renderNotificationEmail,
} from "../../utils/emailTemplates.js";
import { checkHostPanelEmail } from "../../utils/hostPanelAccounts.js";
import { getProfessionalPlanPricing } from "../../utils/planPricing.js";

// Matches unverified leads whose verification link (7 days, see
// HOST_EMAIL_LINK_EXPIRY) has run out. They were never visible to staff, so the
// email is treated as free again and the stale row is replaced on re-signup.
const HOST_EMAIL_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const staleUnverifiedLeadFilter = (email) => {
  const cutoff = new Date(Date.now() - HOST_EMAIL_LINK_TTL_MS);
  return {
    email,
    emailVerified: false,
    $or: [
      { verificationLinkSentAt: { $lt: cutoff } },
      { verificationLinkSentAt: null, createdAt: { $lt: cutoff } },
    ],
  };
};

const hostSignupEmailExists = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const [existingSignupLead, existingHostPanelAccount] = await Promise.all([
    HostUser.exists({
      email: normalizedEmail,
      $nor: [staleUnverifiedLeadFilter(normalizedEmail)],
    }),
    checkHostPanelEmail(normalizedEmail),
  ]);
  return Boolean(existingSignupLead || existingHostPanelAccount);
};

// Professional's price is fetched live (see planDisplayName below) — this
// only covers Basic/Custom, which have no dollar figure to keep in sync.
const PLAN_DISPLAY_NAMES = {
  BASIC: "Basic - Free",
  CUSTOMISE: "Customise - Personalised",
};

const normalizeBillingCycle = (value) =>
  ["monthly", "annual"].includes(String(value || "").trim().toLowerCase())
    ? String(value).trim().toLowerCase()
    : "monthly";

async function planDisplayName(goals, billingCycle = "monthly") {
  const key = (goals || "").trim().toUpperCase();
  if (key === "PROFESSIONAL") {
    const { professionalPlanPriceUsd, professionalAnnualPlanPriceUsd } =
      await getProfessionalPlanPricing();
    return normalizeBillingCycle(billingCycle) === "annual"
      ? `Professional - $${Number(professionalAnnualPlanPriceUsd).toLocaleString("en-US")}/year billed annually`
      : `Professional - $${professionalPlanPriceUsd}/month`;
  }
  return PLAN_DISPLAY_NAMES[key] || goals || "-";
}

// GET /api/forms/plan-pricing — public, no auth. Proxies MasterPanel's own
// public price endpoint so the frontend never has to call MasterPanel
// directly (avoids CORS and keeps the "which service owns pricing" line
// clean — Nomads' backend, not its frontend, talks cross-service).
export const getPublicPlanPricing = async (req, res) => {
  const { professionalPlanPriceUsd, professionalAnnualPlanPriceUsd } =
    await getProfessionalPlanPricing();
  return res.status(200).json({
    professionalPlanPriceUsd,
    professionalAnnualPlanPriceUsd,
  });
};

// ---------------------------------------------------------------------------
// Host lead email verification
//
// After signing up, the submitter gets (1) a welcome email and (2) a "verify
// your email" email whose link opens the host site's /verify-email page. That
// page requests an OTP by email and submits it here. Only verified leads are
// listed to the master panel (see getHostUsers).
// ---------------------------------------------------------------------------
const HOST_EMAIL_TOKEN_PURPOSE = "host-email-verification";
const HOST_EMAIL_LINK_EXPIRY = "7d";
const HOST_EMAIL_OTP_TTL_MS = 10 * 60 * 1000;
const HOST_EMAIL_OTP_COOLDOWN_MS = 45 * 1000;
const HOST_EMAIL_LINK_COOLDOWN_MS = 60 * 1000;
const HOST_EMAIL_OTP_MAX_ATTEMPTS = 5;

const hostEmailTokenSecret = () =>
  process.env.HOST_EMAIL_VERIFY_SECRET || process.env.ACCESS_TOKEN_SECRET;

const hostSiteBaseUrl = () => {
  const configured = String(process.env.HOST_SITE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");
  return process.env.NODE_ENV === "production"
    ? "https://host.wono.co"
    : "http://host.localhost:5173";
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const maskEmail = (email) => {
  const [local = "", domain = ""] = String(email || "").split("@");
  if (!domain) return "";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
};

const hashOtpCode = (code) =>
  createHash("sha256").update(String(code)).digest("hex");

const otpMatches = (submitted, storedHash) => {
  const a = Buffer.from(hashOtpCode(submitted), "hex");
  const b = Buffer.from(String(storedHash || ""), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
};

const signHostEmailToken = (hostUser) =>
  jwt.sign(
    {
      purpose: HOST_EMAIL_TOKEN_PURPOSE,
      hostUserId: String(hostUser._id),
      email: hostUser.email,
    },
    hostEmailTokenSecret(),
    { expiresIn: HOST_EMAIL_LINK_EXPIRY },
  );

// Resolves the HostUser a verification link belongs to, or an { error } that
// can be sent straight back to the client.
const resolveHostUserFromToken = async (token) => {
  if (!token || typeof token !== "string") {
    return {
      error: {
        status: 400,
        code: "LINK_INVALID",
        message: "This verification link is invalid.",
      },
    };
  }
  let decoded;
  try {
    decoded = jwt.verify(token, hostEmailTokenSecret());
  } catch (err) {
    const expired = err?.name === "TokenExpiredError";
    return {
      error: {
        status: 400,
        code: expired ? "LINK_EXPIRED" : "LINK_INVALID",
        message: expired
          ? "This verification link has expired. Request a new one below."
          : "This verification link is invalid.",
      },
    };
  }
  if (decoded?.purpose !== HOST_EMAIL_TOKEN_PURPOSE) {
    return {
      error: {
        status: 400,
        code: "LINK_INVALID",
        message: "This verification link is invalid.",
      },
    };
  }
  const hostUser = await HostUser.findById(decoded.hostUserId);
  if (!hostUser) {
    return {
      error: {
        status: 404,
        code: "LINK_INVALID",
        message: "We couldn't find this registration.",
      },
    };
  }
  return { hostUser };
};

const buildHostVerifyUrl = (hostUser) =>
  `${hostSiteBaseUrl()}/verify-email?token=${encodeURIComponent(
    signHostEmailToken(hostUser),
  )}`;

const markVerificationLinkSent = (hostUser) =>
  HostUser.updateOne(
    { _id: hostUser._id },
    { $set: { verificationLinkSentAt: new Date() } },
  );

// Standalone verification email — only used to re-send a lost/expired link.
// The first link goes out inside the welcome email (sendHostSignupEmails).
const sendHostVerificationLinkEmail = async (hostUser) => {
  const verifyUrl = buildHostVerifyUrl(hostUser);
  const name = escapeHtml(hostUser.name || "there");

  await sendMail({
    to: hostUser.email,
    subject: "Verify your email address - WONO",
    text: `Hi ${hostUser.name || "there"}, please verify your email address to get your WONO host request reviewed: ${verifyUrl}`,
    html: renderNotificationEmail({
      heroTitle: "Verify Your Email",
      heroSubtitle: "Thank you for submitting your request.",
      greetingHtml: `
        <p style="margin:0 0 4px;">Hello ${name},</p>
        <p class="email-text" style="margin:0;">Thank you for submitting your request to become a WONO host. Please use the button below to verify your email address — once it's verified, our team will review your request and contact you shortly.</p>
      `,
      referenceLabel: "Registration ID",
      referenceValue: hostUser.registrationId || undefined,
      ctaButton: {
        label: "Verify Email",
        href: verifyUrl,
        caption:
          "You'll be asked to enter a 6-digit code we email you. This link expires in 7 days.",
      },
      whatNextTitle: "What Happens Next?",
      whatNextItems: [
        "Click the button above to open the verification page",
        "Enter the one-time code we send to this email",
        "Our team will contact you shortly",
      ],
      noteHtml:
        "If you didn't submit a WONO host request, you can safely ignore this email.",
    }),
  });

  await markVerificationLinkSent(hostUser);
};

const sendHostEmailOtp = async (hostUser) => {
  const code = String(randomInt(100000, 1000000));
  await Otp.updateMany(
    {
      email: hostUser.email,
      purpose: "host_email_verification",
      isUsed: false,
    },
    { $set: { isUsed: true } },
  );
  await Otp.create({
    email: hostUser.email,
    code: hashOtpCode(code),
    purpose: "host_email_verification",
    expiresAt: new Date(Date.now() + HOST_EMAIL_OTP_TTL_MS),
    payload: { hostUserId: String(hostUser._id) },
  });

  await sendMail({
    to: hostUser.email,
    subject: "Your WONO verification code",
    text: `Your WONO email verification code is ${code}. It expires in 10 minutes.`,
    html: renderNotificationEmail({
      heroTitle: "Verify Your Email",
      heroSubtitle: "Use the code below to verify your email address.",
      greetingHtml: `
        <p style="margin:0 0 4px;">Hello ${escapeHtml(hostUser.name || "there")},</p>
        <p class="email-text" style="margin:0;">Enter this code on the verification page to confirm your email address.</p>
      `,
      otpCode: { code, expiryMinutes: HOST_EMAIL_OTP_TTL_MS / 60000 },
      noteHtml:
        "For your security, never share this code with anyone.<br/>WONO will never ask you for your OTP or password.<br/><br/><b>Didn't request this?</b> You can safely ignore this email.",
    }),
  });
};

// Stable reference shown in the lead's emails. Assigned once, at signup.
const ensureRegistrationId = async (hostUser) => {
  if (hostUser.registrationId) return hostUser.registrationId;
  const total = await HostUser.countDocuments({});
  const registrationId = `WN-REG-${referenceDateStamp(
    hostUser.createdAt || new Date(),
  )}-${String(total).padStart(5, "0")}`;
  await HostUser.updateOne({ _id: hostUser._id }, { $set: { registrationId } });
  hostUser.registrationId = registrationId;
  return registrationId;
};

// At signup the lead gets ONE email: thank-you + the verify-your-email button.
// "Welcome to WONO!" is sent only once the address is verified (see
// sendHostWelcomeEmail / verifyHostEmailOtp).
const sendHostSignupEmails = async ({ hostUser }) => {
  try {
    await ensureRegistrationId(hostUser);
    await sendHostVerificationLinkEmail(hostUser);
    console.log("✅ Verification email sent to", hostUser.email);
  } catch (err) {
    console.error("❌ Failed to send verification email:", err.message);
  }
};

// Sent right after the lead verifies their email: the welcome + what happens next.
const sendHostWelcomeEmail = async (hostUser) => {
  const registeredAt = hostUser.createdAt || new Date();
  const { submittedDate, submittedTime } = formatSubmittedOn(registeredAt);
  const selectedPlanDisplayName = await planDisplayName(
    hostUser.goals,
    hostUser.billingCycle,
  );
  await sendMail({
    to: hostUser.email,
    subject: "Welcome to WONO!",
    text: `Hi ${hostUser.name || "there"}, your email is verified and your request is with our team. Registration ID: ${hostUser.registrationId || "-"}. We will contact you shortly.`,
    html: renderNotificationEmail({
      heroTitle: "Welcome to WONO!",
      heroSubtitle: "Your email is verified and your request is with our team.",
      greetingHtml: `
        <p style="margin:0 0 4px;">Hello ${escapeHtml(hostUser.name || "there")},</p>
        <p class="email-text" style="margin:0;">Thank you for registering with WONO. Your email address is verified and our team will contact you shortly.</p>
      `,
      referenceLabel: "Registration ID",
      referenceValue: hostUser.registrationId || undefined,
      detailsTitle: "Registration Details",
      detailRows: [
        ["Name", escapeHtml(hostUser.name || "-")],
        ["Email", escapeHtml(hostUser.email)],
        ["Selected Plan", selectedPlanDisplayName],
        ["Company", escapeHtml(hostUser.companyName || "-")],
        ["Registration Date", `${submittedDate}<br/>${submittedTime}`],
      ],
      whatNextTitle: "What Happens Next?",
      whatNextItems: [
        "Request submitted successfully",
        "Email verified",
        "Our team will review your information and contact you shortly",
      ],
    }),
  });
};

// POST /api/forms/host-email/send-otp  { token }
// Called when the verify-email page opens (and by its "resend" button).
export const sendHostEmailVerificationOtp = async (req, res, next) => {
  try {
    const resolved = await resolveHostUserFromToken(req.body?.token);
    if (resolved.error) {
      const { status, ...body } = resolved.error;
      return res.status(status).json(body);
    }
    const { hostUser } = resolved;
    const email = maskEmail(hostUser.email);

    if (hostUser.emailVerified) {
      return res.status(200).json({ alreadyVerified: true, email });
    }

    // Opening the verify page asks for a code once. Reloading or revisiting
    // it while that code is still usable must NOT email another one — a new
    // code goes out only when the person explicitly presses "Resend"
    // (resend: true), and then only after the cooldown.
    const resend = req.body?.resend === true;
    const lastOtp = await Otp.findOne({
      email: hostUser.email,
      purpose: "host_email_verification",
      isUsed: false,
    })
      .sort({ createdAt: -1 })
      .lean();
    const codeStillUsable =
      lastOtp &&
      new Date(lastOtp.expiresAt).getTime() > Date.now() &&
      lastOtp.attempts < HOST_EMAIL_OTP_MAX_ATTEMPTS;
    if (codeStillUsable) {
      const waitMs =
        new Date(lastOtp.createdAt).getTime() +
        HOST_EMAIL_OTP_COOLDOWN_MS -
        Date.now();
      if (!resend || waitMs > 0) {
        return res.status(200).json({
          sent: false,
          alreadySent: true,
          email,
          retryAfterSeconds: Math.max(0, Math.ceil(waitMs / 1000)),
          message: "We've already emailed you a code. Check your inbox.",
        });
      }
    }

    await sendHostEmailOtp(hostUser);
    return res.status(200).json({
      sent: true,
      email,
      retryAfterSeconds: HOST_EMAIL_OTP_COOLDOWN_MS / 1000,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/forms/host-email/verify-otp  { token, otp }
export const verifyHostEmailOtp = async (req, res, next) => {
  try {
    const otp = String(req.body?.otp || "").trim();
    if (!/^\d{6}$/.test(otp)) {
      return res
        .status(400)
        .json({ message: "Enter the 6-digit code from your email." });
    }

    const resolved = await resolveHostUserFromToken(req.body?.token);
    if (resolved.error) {
      const { status, ...body } = resolved.error;
      return res.status(status).json(body);
    }
    const { hostUser } = resolved;

    if (hostUser.emailVerified) {
      return res.status(200).json({ verified: true, alreadyVerified: true });
    }

    const record = await Otp.findOne({
      email: hostUser.email,
      purpose: "host_email_verification",
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!record) {
      return res
        .status(400)
        .json({ message: "Please request a verification code first." });
    }
    if (record.expiresAt.getTime() < Date.now()) {
      record.isUsed = true;
      await record.save();
      return res
        .status(400)
        .json({ message: "This code has expired. Request a new one." });
    }
    if (record.attempts >= HOST_EMAIL_OTP_MAX_ATTEMPTS) {
      record.isUsed = true;
      await record.save();
      return res
        .status(429)
        .json({ message: "Too many attempts. Request a new code." });
    }
    if (!otpMatches(otp, record.code)) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Incorrect code. Try again." });
    }

    record.isUsed = true;
    await record.save();
    hostUser.emailVerified = true;
    hostUser.emailVerifiedAt = new Date();
    await hostUser.save();

    try {
      await sendHostWelcomeEmail(hostUser);
    } catch (err) {
      console.error("❌ Failed to send welcome email:", err.message);
    }

    try {
      await sendAdminFormNotification({
        subject: "Host lead email verified",
        formName: hostUser.formName || "register",
        data: {
          name: hostUser.name,
          email: hostUser.email,
          companyName: hostUser.companyName,
          plan: hostUser.goals,
        },
      });
    } catch (err) {
      console.error("❌ Failed to send verification admin notice:", err.message);
    }

    return res.status(200).json({
      verified: true,
      message: "Email verified. Our team will review your request shortly.",
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/forms/host-email/resend-link  { email }
// For an expired/lost link. Always answers 200 so it can't be used to probe
// which emails have signed up.
export const resendHostEmailVerificationLink = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const generic = {
      message:
        "If this email has a pending request, a new verification link is on its way.",
    };
    if (!email) return res.status(200).json(generic);

    const hostUser = await HostUser.findOne({ email, emailVerified: false });
    if (!hostUser) return res.status(200).json(generic);

    const lastSent = hostUser.verificationLinkSentAt?.getTime() || 0;
    if (Date.now() - lastSent < HOST_EMAIL_LINK_COOLDOWN_MS) {
      return res.status(200).json(generic);
    }

    await sendHostVerificationLinkEmail(hostUser);
    return res.status(200).json(generic);
  } catch (error) {
    return next(error);
  }
};

const istNowPieces = () => {
  const tz = "Asia/Kolkata";
  const now = new Date();
  // en-CA -> yyyy-mm-dd
  const submissionDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  // 24h HH:mm:ss
  const submissionTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/\u202F/g, ""); // fix narrow no-break space on some Node versions

  return { submissionDate, submissionTime };
};

const jobApplicationSchema = yup
  .object({
    jobPosition: yup.string().trim().required("Job Position is required"),
    name: yup.string().trim().required("Name is required"),
    email: yup.string().trim().email().required("Valid email is required"),
    dob: yup
      .string()
      .trim()
      .nullable()
      .matches(
        /^\d{4}-\d{2}-\d{2}$/,
        "Date of Birth must be YYYY-MM-DD (use 0-padding)",
      ),
    mobile: yup
      .string()
      .trim()
      .required("Mobile Number is required")
      .test(
        "is-valid-phone",
        "Please provide a valid phone number",
        function (value) {
          if (!value) return false;
          try {
            const number = parsePhoneNumberFromString(value);
            if (!number?.isValid()) return false;

            // store the normalized version on the validated data
            this.parent.mobile = number.number;
            return true;
          } catch {
            return false;
          }
        },
      ),
    // .matches(/^[0-9+\-\s()]{8,20}$/, "Invalid mobile number"),
    location: yup.string().trim().required("Location is required"),
    experienceYears: yup
      .number()
      .typeError("Experience (in years) must be a number")
      .min(0)
      .max(60)
      .required("Experience (in years) is required"),
    linkedin: yup.string().trim().url().nullable(),
    currentMonthlySalary: yup
      .number()
      .typeError("Current Monthly Salary must be a number")
      .min(0)
      .nullable(),
    expectedMonthlySalary: yup
      .number()
      .typeError("Expected Monthly Salary must be a number")
      .min(0)
      .nullable(),
    joinInDays: yup
      .string()
      .typeError("How Soon You Can Join (Days) must be a number")
      .min(0)
      .required("Join-in days is required"),
    relocateGoa: yup
      .string()
      .trim()
      .oneOf(["Yes", "No"], "Relocate must be 'Yes' or 'No'")
      .required("Relocate to Goa is required"),
    personality: yup.string().trim().required("Tell us about yourself"),
    skills: yup.string().trim().required("Skills are required"),
    whyConsider: yup
      .string()
      .trim()
      .required("Why should we consider you is required"),
    willingToBootstrap: yup
      .string()
      .trim()
      .required("Willing to bootstrap is required"),
    message: yup.string().trim().nullable(),
    remarks: yup.string().trim().default(""),
    submissionDate: yup
      .string()
      .trim()
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Submission Date must be YYYY-MM-DD")
      .optional(),
    submissionTime: yup
      .string()
      .trim()
      .matches(/^\d{2}:\d{2}:\d{2}$/, "Submission Time must be HH:mm:ss")
      .optional(),
  })
  .noUnknown(true, "Unknown field in payload");

const enquirySchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),

  mobile: yup
    .string()
    .trim()
    .required("Mobile number is required")
    .test(
      "is-valid-phone",
      "Please provide a valid phone number",
      function (value) {
        if (!value) return false;
        try {
          const number = parsePhoneNumberFromString(value);
          if (!number?.isValid()) return false;

          // store the normalized version on the validated data
          this.parent.mobile = number.number;
          return true;
        } catch {
          return false;
        }
      },
    ),
  // .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),

  partnerstype: yup.string().trim().required("Partner Type is required"),

  message: yup
    .string()
    .trim()
    .required("Message is required")
    .min(5, "Message must be at least 5 characters long"),

  formName: yup.string().trim().required("Form Name is required"),
});

// controllers/b2bFormController.js

export const addB2BFormSubmission = async (req, res, next) => {
  const url = process.env.B2B_APPS_SCRIPT_URL;
  if (!url) {
    return res
      .status(500)
      .json({ error: "Server misconfiguration: Web App URL not set" });
  }

  // --- shared helpers -------------------------------------------------------

  const validate = async (schema, body) => {
    return schema.validate(body, { abortEarly: false, stripUnknown: true });
  };

  const addIstSubmissionStampsIfMissing = (payload) => {
    const { submissionDate, submissionTime } = istNowPieces();
    if (!payload.submissionDate) payload.submissionDate = submissionDate;
    if (!payload.submissionTime) payload.submissionTime = submissionTime;
    return payload;
  };

  const parseAppsScriptResponse = async (resp) => {
    const text = await resp.text();
    try {
      return { ok: resp.ok, data: JSON.parse(text) };
    } catch {
      return { ok: resp.ok, data: { raw: text } };
    }
  };

  const postToAppsScript = async (body) => {
    const signal =
      typeof AbortSignal?.timeout === "function"
        ? AbortSignal.timeout(15_000)
        : undefined;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

    const { ok, data } = await parseAppsScriptResponse(resp);
    if (!ok || data?.error) {
      const detail = data?.error || data?.raw || "Unknown upstream error";
      const err = new Error("Upstream write failed");
      err.status = 502;
      err.detail = detail;
      throw err;
    }
    return data;
  };

  // --- individual form handlers --------------------------------------------

  const handleJobApplication = async () => {
    // 1) validate + coerce
    const payload = await validate(jobApplicationSchema, req.body);

    // 2) ensure IST stamps if missing
    addIstSubmissionStampsIfMissing(payload);

    // 3) required resume upload
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload your resume before submitting.",
      });
    }

    const data = await uploadFileToS3(
      `job-applications/${payload.jobPosition}/${
        payload.name + randomUUID()
      }/${req.file.originalname}`,
      req.file,
    );
    const resumeLink = data.url;

    // 4) forward to Apps Script
    const apsBody = {
      formName: "jobApplication",
      jobPosition: payload.jobPosition,
      name: payload.name,
      email: payload.email,
      dob: payload.dob ?? "",
      mobile: payload.mobile,
      location: payload.location,
      experienceYears: payload.experienceYears,
      linkedin: payload.linkedin ?? "",
      currentMonthlySalary: payload.currentMonthlySalary ?? "",
      expectedMonthlySalary: payload.expectedMonthlySalary ?? "",
      joinInDays: payload.joinInDays,
      relocateGoa: payload.relocateGoa,
      personality: payload.personality,
      skills: payload.skills,
      whyConsider: payload.whyConsider,
      willingToBootstrap: payload.willingToBootstrap,
      message: payload.message ?? "",
      submissionDate: payload.submissionDate,
      submissionTime: payload.submissionTime,
      resumeLink,
      remarks: payload.remarks ?? "",
    };

    await postToAppsScript(apsBody);

    try {
      await sendMail({
        to: payload.email,
        subject: `Application Received for ${payload.jobPosition}`,
        text: `Hi ${payload.name}, your application for ${payload.jobPosition} has been received.`,
        html: `
            <h2>Application Received</h2>
            <p>Hi ${payload.name},</p>
            <p>Thank you for applying for the position of <b>${payload.jobPosition}</b>.</p>
            <p>Our HR team will review your profile and get back to you soon.</p>
             <p>Cheers,<br/>The WONO Team</p>
          `,
      });
      console.log("✅ Application email sent to", payload.email);
    } catch (err) {
      console.error("❌ Failed to send email:", err.message);
    }

    await sendAdminFormNotification({
      subject: "New job application submitted",
      formName: "Job_Application",
      data: apsBody,
    });

    // 5) response
    return res.status(201).json({
      message: "Application submitted",
      submissionDate: payload.submissionDate,
      submissionTime: payload.submissionTime,
    });
  };

  const handleEnquiry = async () => {
    const payload = await validate(enquirySchema, req.body);

    const apsBody = {
      name: payload.name,
      email: payload.email,
      mobile: payload.mobile,
      partnerstype: payload.partnerstype,
      message: payload.message,
      formName: "connect",
    };

    const result = await postToAppsScript(apsBody);

    await sendMail({
      to: payload.email,
      subject: "We Received Your Message",
      html: `
        <h2>Thank You For Connecting</h2>
        <p>Hi ${payload.name},</p>
        <p>We’ve received your message regarding <b>${payload.partnerstype}</b>.</p>
        <p>Our team will respond shortly.</p>
        <p>Cheers,<br/>The WONO Team</p>
      `,
    });

    await sendAdminFormNotification({
      subject: "New B2B enquiry received",
      formName: payload.formName || "connect",
      data: apsBody,
    });

    return res.json(result);
  };

  // --- router-like dispatch -------------------------------------------------

  try {
    const formName = req.body?.formName;

    const handlers = {
      jobApplication: handleJobApplication,
      connect: handleEnquiry,
    };

    if (!formName || !handlers[formName]) {
      return res.status(400).json({
        error: "Unsupported form",
        detail: `Expected one of: ${Object.keys(handlers).join(", ")}`,
      });
    }

    await handlers[formName]();
  } catch (err) {
    // if (err?.name === "ValidationError") {
    //   const errors = err.inner?.length
    //     ? err.inner.reduce((acc, e) => {
    //         if (e.path && !acc[e.path]) acc[e.path] = e.message;
    //         return acc;
    //       }, {})
    //     : { message: err.message };
    //   return res.status(400).json({ error: "Validation failed", errors });
    // }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.errors[0], // only the first message
      });
    }

    if (err?.status === 502) {
      return res
        .status(502)
        .json({ error: "Upstream write failed", detail: err.detail });
    }

    return next(err);
  }
};

// controllers/registerController.js

export const getHostUsers = async (req, res, next) => {
  try {
    // Leads appear in the master panel only after the submitter verified
    // their email. `$ne: false` (not `: true`) keeps legacy leads, which were
    // created before verification existed and have no emailVerified field.
    const hostUsers = await HostUser.find({ emailVerified: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: hostUsers.length,
      data: hostUsers,
    });
  } catch (error) {
    return next(error);
  }
};

export const checkHostUserEmail = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const exists = await hostSignupEmailExists(normalizedEmail);

    return res.status(200).json({
      exists,
      message: exists
        ? "This email is already registered. Please use a different email."
        : "Email is available",
    });
  } catch (error) {
    return next(error);
  }
};

export const updateHostUserStatusAndComment = async (req, res, next) => {
  try {
    const { hostUserId } = req.params;
    const { status, comment, goals } = req.body;
    const allowedStatuses = ["pending", "contacted", "closed", "rejected"];
    const allowedGoals = ["basic", "professional", "customise"];

    if (!hostUserId) {
      return res.status(400).json({ message: "hostUserId is required" });
    }

    if (
      typeof status === "undefined" &&
      typeof comment === "undefined" &&
      typeof goals === "undefined"
    ) {
      return res.status(400).json({
        message: "At least one field is required: status, comment or goals",
      });
    }

    const updates = {};
    if (typeof status !== "undefined") {
      if (typeof status !== "string") {
        return res.status(400).json({
          message:
            "Status must be a string (pending, contacted, closed, rejected)",
        });
      }

      const normalizedStatus = status.trim().toLowerCase();
      if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
          message:
            "Invalid status. Allowed values: pending, contacted, closed, rejected",
        });
      }

      updates.status = normalizedStatus;
    }
    if (typeof comment !== "undefined") updates.comment = comment;
    if (typeof goals !== "undefined") {
      if (typeof goals !== "string") {
        return res.status(400).json({
          message: "Goals must be a string (basic, professional, customise)",
        });
      }

      const normalizedGoals = goals.trim().toLowerCase();
      if (!allowedGoals.includes(normalizedGoals)) {
        return res.status(400).json({
          message:
            "Invalid goals. Allowed values: basic, professional, customise",
        });
      }

      updates.goals = normalizedGoals;
    }

    const hostUser = await HostUser.findByIdAndUpdate(hostUserId, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!hostUser) {
      return res.status(404).json({ message: "Host user not found" });
    }

    return res.status(200).json({
      message: "Host user updated successfully",
      data: hostUser,
    });
  } catch (error) {
    return next(error);
  }
};

export const registerFormSubmission = async (req, res) => {
  const url = process.env.B2B_APPS_SCRIPT_URL;
  if (!url) {
    return res
      .status(500)
      .json({ error: "Server misconfiguration: Web App URL not set" });
  }
  let responseSent = false;

  // --- helpers ------------------------------------------------------
  const parseAppsScriptResponse = async (resp) => {
    const text = await resp.text();
    try {
      return { ok: resp.ok, data: JSON.parse(text) };
    } catch {
      return { ok: resp.ok, data: { raw: text } };
    }
  };

  const postToAppsScript = async (body) => {
    const signal =
      typeof AbortSignal?.timeout === "function"
        ? AbortSignal.timeout(15_000)
        : undefined;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

    const { ok, data } = await parseAppsScriptResponse(resp);
    if (!ok || data?.error) {
      const detail = data?.error || data?.raw || "Unknown upstream error";
      const err = new Error("Upstream write failed");
      err.status = 502;
      err.detail = detail;
      throw err;
    }

    return data;
  };

  try {
    const payload = req.body;
    const normalizedEmail = String(payload.email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (await hostSignupEmailExists(normalizedEmail)) {
      return res
        .status(409)
        .json({
          message: "This email is already registered. Please sign in or use a different email.",
        });
    }
    payload.email = normalizedEmail;

    await HostUser.deleteMany(staleUnverifiedLeadFilter(normalizedEmail));

    const safeParse = (val, fallback) => {
      try {
        return typeof val === "string" ? JSON.parse(val) : val || fallback;
      } catch {
        return fallback;
      }
    };

    payload.verticalType = safeParse(payload.verticalType, []);

    try {
      const num = parsePhoneNumberFromString(payload.mobile);
      if (num?.isValid()) payload.mobile = num.number; // normalize
    } catch {}

    // STEP 1: send registration data to Google Sheet
    const apsBody = {
      name: payload.name,
      email: payload.email,
      mobile: payload.mobile,
      country: payload.country,
      city: payload.city,
      state: payload.state,
      companyName: payload.companyName,
      industry: payload.industry,
      companySize: payload.companySize,
      companyType: Array.isArray(payload.verticalType)
        ? payload.verticalType.join(", ")
        : payload.verticalType || "",
      companyCity: payload.companyCity,
      companyState: payload.companyState,
      websiteURL: payload.websiteUrl,
      linkedinURL: payload.linkedInUrl,
      selectedServices: payload.selectedServices,
      formName: "register",
    };

    const sheetWritePromise = postToAppsScript(apsBody).catch((error) => {
      console.error(
        "Google Sheet write failed:",
        error?.detail || error.message,
      );
    });

    // Came from "Verify Business" on a wono.co listing? Carry that company
    // through so staff can link its listings when they invite the host.
    const verifyClick = await findUnusedVerifyClick(payload.verifyClickId);

    // STEP 1.5: also persist host signup user in MongoDB
    const hostUser = await HostUser.create({
      ...(verifyClick
        ? {
            nomadsCompanyId: verifyClick.companyId,
            verifyClickId: String(verifyClick._id),
            sourceListing: {
              businessId: verifyClick.businessId || "",
              companyType: verifyClick.companyType || "",
              companyName: verifyClick.companyName || "",
            },
          }
        : {}),
      name: payload.name,
      email: payload.email,
      mobile: payload.mobile,
      country: payload.country,
      state: payload.state,
      city: payload.city,
      role: payload.role,
      goals: payload.Goals,
      billingCycle: normalizeBillingCycle(payload.billingCycle),
      companyName: payload.companyName,
      industry: payload.industry,
      verticalType: payload.verticalType,
      companyCountry: payload.companyCountry,
      companyState: payload.companyState,
      companyCity: payload.companyCity,
      formName: payload.formName || "register",
      source: "AiHostSignup",
      comment: "",
      status: "pending",
      payload,
    });

    if (verifyClick) {
      try {
        await attachHostUserToClick(verifyClick._id, hostUser._id);
      } catch (err) {
        console.error("Failed to link signup to verify-business click:", err.message);
      }
    }

    // STEP 2: normalize incoming JSON strings
    let { products, testimonials, about } = payload;
    products = safeParse(products, []);
    testimonials = safeParse(testimonials, []);
    about = safeParse(about, []);

    for (const k of Object.keys(payload)) {
      if (/^(products|testimonials)\.\d+\./.test(k)) delete payload[k];
    }

    // ---------------- Website Data Save Logic ----------------
    const session = await mongoose.startSession();
    session.startTransaction();
    let sessionEnded = false;

    try {
      const company = req.body.companyName || null;

      const formatCompanyName = (name) => {
        if (!name) return "";

        const trimmed = name.trim().toLowerCase();

        const invalids = ["n/a", "na", "none", "undefined", "null", "-"];
        if (invalids.includes(trimmed)) return "";

        return trimmed.split("-")[0].replace(/\s+/g, "");
      };

      const searchKey = formatCompanyName(payload.companyName);
      const baseFolder = `hosts/template/${searchKey}`;

      let template = {
        searchKey,
        companyName: payload.companyName,
        title: payload.title,
        subTitle: payload.subTitle,
        CTAButtonText: payload.CTAButtonText,
        about,
        productTitle: payload?.productTitle,
        galleryTitle: payload?.galleryTitle,
        testimonialTitle: payload.testimonialTitle,
        contactTitle: payload.contactTitle,
        mapUrl: payload.mapUrl,
        websiteEmail: payload.websiteEmail,
        phone: payload.phone,
        address: payload.address,
        registeredCompanyName: payload.registeredCompanyName,
        copyrightText: payload.copyrightText,
        products: [],
        testimonials: [],
        source: "Nomad",
      };

      // Helper: upload an array of files to S3
      const uploadImages = async (files = [], folder) => {
        const arr = [];
        for (const file of files) {
          const buffer = await sharp(file.buffer)
            .webp({ quality: 80 })
            .toBuffer();

          const route = `${folder}/${Date.now()}_${file.originalname.replace(
            /\s+/g,
            "_",
          )}`;
          const data = await uploadFileToS3(route, {
            buffer,
            mimetype: "image/webp",
          });
          arr.push({ url: data.url, id: data.id });
        }
        return arr;
      };

      // Index multer files
      const filesByField = {};
      for (const f of req.files || []) {
        if (!filesByField[f.fieldname]) filesByField[f.fieldname] = [];
        filesByField[f.fieldname].push(f);
      }

      // IMAGE COUNT VALIDATION

      // Hero Images: max 5
      if (filesByField.heroImages && filesByField.heroImages.length > 5) {
        return res.status(400).json({
          error: "You can upload a maximum of 5 hero images.",
        });
      }

      // Gallery Images: max 40
      if (filesByField.gallery && filesByField.gallery.length > 40) {
        return res.status(400).json({
          error: "You can upload a maximum of 40 gallery images.",
        });
      }

      // Product Images: each product max 10
      for (const key of Object.keys(filesByField)) {
        if (key.startsWith("productImages_")) {
          const productNumber = Number(key.split("productImages_")[1]) + 1;

          const count = filesByField[key].length;
          if (count > 10) {
            return res.status(400).json({
              error: `Product ${productNumber} has ${count} images. Max allowed is 10.`,
            });
          }
        }
      }

      // The lead is recorded and upload counts are validated, so the browser
      // can show success while website setup, file uploads, and emails finish.
      responseSent = true;
      res.status(201).json({
        message: "Form submitted successfully",
      });

      // Sent before the slow upload/website work so a failure there can't
      // strand the lead without its verification email.
      if (payload.email) {
        await sendHostSignupEmails({ hostUser, payload });
      }

      // companyLogo
      if (filesByField.companyLogo && filesByField.companyLogo[0]) {
        const logoFile = filesByField.companyLogo[0];
        const buffer = await sharp(logoFile.buffer)
          .webp({ quality: 80 })
          .toBuffer();
        const route = `${baseFolder}/companyLogo/${Date.now()}_${
          logoFile.originalname
        }`;
        const data = await uploadFileToS3(route, {
          buffer,
          mimetype: "image/webp",
        });
        template.companyLogo = { url: data.url, id: data.id };
      }

      // heroImages
      if (filesByField.heroImages?.length) {
        template.heroImages = await uploadImages(
          filesByField.heroImages,
          `${baseFolder}/heroImages`,
        );
      }

      // gallery
      if (filesByField.gallery?.length) {
        template.gallery = await uploadImages(
          filesByField.gallery,
          `${baseFolder}/gallery`,
        );
      }

      // products
      if (Array.isArray(products) && products.length) {
        for (let i = 0; i < products.length; i++) {
          const p = products[i] || {};
          const pFiles = filesByField[`productImages_${i}`] || [];
          const uploaded = await uploadImages(
            pFiles,
            `${baseFolder}/productImages/${i}`,
          );

          template.products.push({
            type: p.type,
            name: p.name,
            cost: p.cost,
            description: p.description,
            images: uploaded,
          });
        }
      }

      // testimonials
      let tUploads = [];
      if (filesByField.testimonialImages?.length) {
        tUploads = await uploadImages(
          filesByField.testimonialImages,
          `${baseFolder}/testimonialImages`,
        );
      } else {
        for (let i = 0; i < testimonials.length; i++) {
          const tFiles = filesByField[`testimonialImages_${i}`] || [];
          const uploaded = await uploadImages(
            tFiles,
            `${baseFolder}/testimonialImages/${i}`,
          );

          tUploads[i] = uploaded[0];
        }
      }

      template.testimonials = (testimonials || []).map((t, i) => ({
        image: tUploads[i],
        name: t.name,
        jobPosition: t.jobPosition,
        testimony: t.testimony,
        rating: t.rating,
      }));

      // STEP 3: send Mongo saved data to external API
      let websiteResult = "";
      let websiteCreatedOk = false; // track real HTTP success

      if (searchKey) {
        try {
          const submit = await fetch(
            `http://localhost:5007/api/editor/create-website`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(template),
            },
          );
          websiteCreatedOk = submit.ok; // true only for 2xx HTTP status
          const raw = await submit.text();
          try {
            websiteResult = JSON.parse(raw);
          } catch {
            console.error("Non-JSON response:", raw);
            websiteResult = { message: "Invalid JSON response", raw };
          }

          if (!websiteCreatedOk) {
            console.error(
              `❌ create-website returned HTTP ${submit.status}:`,
              websiteResult,
            );
          }

          await session.commitTransaction();
          session.endSession();
          sessionEnded = true;
        } catch (err) {
          console.error("create-template call failed:", err);
          websiteResult = { message: "create-template call failed" };
        }
      }

      await sendAdminFormNotification({
        subject: "New registration received",
        formName: payload.formName || "register",
        data: payload,
      });
      await sheetWritePromise;

      if (!sessionEnded) {
        if (session.inTransaction()) {
          await session.commitTransaction();
        }
        session.endSession();
        sessionEnded = true;
      }

      // STEP 4: respond
      // Lead + email are already saved/sent above regardless of website creation.
      // Always return success to the user — if website creation failed, our team
      // will handle it manually (the lead is in MongoDB & Google Sheet).
      if (searchKey) {
        if (websiteCreatedOk) {
          if (responseSent) return;
          return res.status(201).json({
            message: "Form submitted successfully",
          });
        } else {
          // Lead is saved; website setup will be done manually by the team.
          console.error(
            "⚠️ Website creation failed but lead was saved. Returning success to user.",
          );
          if (responseSent) return;
          return res.status(201).json({
            message:
              "Form submitted successfully, our team will get back to you soon",
          });
        }
      }
    } catch (error) {
      if (!sessionEnded && session.inTransaction()) {
        await session.abortTransaction();
      }
      if (!sessionEnded) {
        session.endSession();
        sessionEnded = true;
      }
      console.error("❌ Inner transaction error:", error);
      if (responseSent) return;
      return res
        .status(500)
        .json({ error: "Transaction failed", detail: error.message });
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      if (responseSent) return;
      return res.status(400).json({
        message: err.errors[0], // only the first message
      });
    }
    if (err?.status === 503) {
      return res.status(503).json({
        message:
          "We could not verify this email with HostPanel. Please try again.",
      });
    }

    if (err?.status === 502) {
      if (responseSent) return;
      return res
        .status(502)
        .json({ error: "Upstream write failed", detail: err.detail });
    }
    console.error("❌ Outer error:", err);
    if (responseSent) return;
    return res
      .status(500)
      .json({ error: "Unexpected server error", detail: err.message });
  }
};
