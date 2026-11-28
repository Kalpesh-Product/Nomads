import { createHash, randomInt, randomUUID, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import BecomeContributor from "../../models/BecomeContributor.js";
import Otp from "../../models/Otp.js";
import { sendAdminFormNotification, sendMail } from "../../config/mailer.js";
import { renderNotificationEmail } from "../../utils/emailTemplates.js";
import {
  getRequestedContributorRoles,
  PARTNER_ROLE_KEYS,
} from "../../utils/contributorRoles.js";
import { aiBecomeContributorSchema } from "./b2cFormControllers.js";
import { checkPartnerPanelEmail } from "../../utils/partnerPanelAccounts.js";

const TOKEN_PURPOSE = "contributor-submission-verification";
const LINK_EXPIRY = "24h";
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_COOLDOWN_MS = 45 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const tokenSecret = () =>
  process.env.CONTRIBUTOR_EMAIL_VERIFY_SECRET || process.env.ACCESS_TOKEN_SECRET;

const nomadsSiteUrl = () => {
  const configured = String(process.env.NOMADS_SITE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");
  return process.env.NODE_ENV === "production"
    ? "https://www.wono.co"
    : "http://localhost:5173";
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

const hashOtp = (code) => createHash("sha256").update(String(code)).digest("hex");
const otpMatches = (submitted, storedHash) => {
  const a = Buffer.from(hashOtp(submitted), "hex");
  const b = Buffer.from(String(storedHash || ""), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
};

const resolveToken = (token) => {
  if (!token || typeof token !== "string") {
    return { error: { status: 400, code: "LINK_INVALID", message: "This verification link is invalid." } };
  }
  try {
    const decoded = jwt.verify(token, tokenSecret());
    if (decoded?.purpose !== TOKEN_PURPOSE || !decoded?.submission || !decoded?.verificationId) {
      throw new Error("Invalid verification payload");
    }
    return { decoded };
  } catch (error) {
    const expired = error?.name === "TokenExpiredError";
    return {
      error: {
        status: 400,
        code: expired ? "LINK_EXPIRED" : "LINK_INVALID",
        message: expired
          ? "This verification link has expired. Please submit the form again."
          : "This verification link is invalid.",
      },
    };
  }
};

const isPartnerSubmission = (contributionType) =>
  getRequestedContributorRoles(contributionType).some((role) =>
    PARTNER_ROLE_KEYS.includes(role),
  );

const partnerEmailConflictMessage =
  "This email already has a WONO Partner account. Please sign in to Partners Panel or use a different email.";

const partnerEmailIsUnavailable = async (submission) =>
  isPartnerSubmission(submission.contributionType) &&
  (await checkPartnerPanelEmail(submission.email));

export const checkPartnerUserEmail = async (req, res, next) => {
  try {
    const email = String(req.query?.email || "").trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "A valid email is required." });
    }

    const exists = await checkPartnerPanelEmail(email);
    return res.status(200).json({
      exists,
      message: exists ? partnerEmailConflictMessage : "Email is available.",
    });
  } catch (error) {
    return next(error);
  }
};

const buildVerificationLinkEmail = ({ submission, verifyUrl }) => ({
  subject: "Verify your WONO submission",
  text: `Hi ${submission.fullName}, verify your email address to continue your WONO submission: ${verifyUrl}`,
  html: renderNotificationEmail({
    heroTitle: "Verify Your Email Address",
    heroSubtitle: "One quick step to confirm your WONO submission.",
    greetingHtml: `
      <p style="margin:0 0 18px;">Hi <b>${escapeHtml(submission.fullName)}</b>,</p>
      <p class="email-text" style="margin:0;">Thanks for submitting your interest to <b class="email-heading">${escapeHtml(submission.contributionType)}</b>. Please confirm this is your email address to continue.</p>
    `,
    ctaButton: {
      label: "Verify Email Address",
      href: verifyUrl,
      caption: "This link expires in 24 hours. If you didn't request this, you can safely ignore this email.",
    },
    noteTitle: "Why We Ask",
    noteHtml: "Verifying your email keeps your submission secure and ensures WONO can reach you about your application.",
  }),
});

const buildVerificationOtpEmail = ({ submission, code }) => ({
  subject: "Your WONO submission verification code",
  text: `Hi ${submission.fullName}, your WONO verification code is ${code}. It expires in 10 minutes.`,
  html: renderNotificationEmail({
    heroTitle: "Verify Your WONO Submission",
    heroSubtitle: "Use the verification code below to continue.",
    greetingHtml: `
      <p style="margin:0 0 18px;">Hi <b>${escapeHtml(submission.fullName)}</b>,</p>
      <p class="email-text" style="margin:0;">Enter this one-time code on the verification screen to confirm your identity.</p>
    `,
    otpCode: { code, expiryMinutes: OTP_TTL_MS / 60000 },
    noteHtml: "For your security, never share this verification code with anyone.<br/>WONO will never ask you to share your OTP, password, or account credentials.<br/><br/><b>Didn't request this verification?</b> You can safely ignore this email.",
  }),
});

export const buildVerifiedSubmissionEmail = (submission) => {
  const partnerSubmission = isPartnerSubmission(submission.contributionType);
  const contact = `${submission.contactCode || ""} ${submission.contactNumber || ""}`.trim();
  return {
    subject: "Welcome to WONO — email verified",
    text: `Hi ${submission.fullName}, your email has been verified and your WONO submission is now with our team.`,
    html: renderNotificationEmail({
      heroTitle: "Welcome to WONO!",
      heroSubtitle: "Your email has been verified successfully.",
      greetingHtml: `
        <p style="margin:0 0 18px;">Hi <b>${escapeHtml(submission.fullName)}</b>,</p>
        <p class="email-text" style="margin:0;">Thank you for wanting to support our cause. Here's a quick recap of what you submitted.</p>
      `,
      referenceLabel: "Contribution Towards WONO",
      referenceValue: escapeHtml(submission.contributionType),
      detailsTitle: "Your Details",
      detailRows: [
        ["Full Name", escapeHtml(submission.fullName)],
        ["Current Country", escapeHtml(submission.currentCountry)],
        ["LinkedIn Profile", escapeHtml(submission.linkedinProfile)],
        ["Contact Number", escapeHtml(contact)],
        ["Email", escapeHtml(submission.email)],
      ],
      whatNextItems: partnerSubmission
        ? [
            "Our team will review your submission.",
            "A WONO representative will contact you soon to discuss next steps.",
            "You'll be onboarded as a Partner once approved.",
          ]
        : [
            "Our team will review your submission.",
            "A WONO representative will contact you if any more information is needed.",
            "Your contribution access will be activated once approved.",
          ],
      signOffHtml: "Warm regards,<br/>Team WONO",
    }),
  };
};

export const sendContributorVerificationLink = async (req, res, next) => {
  try {
    const submission = await aiBecomeContributorSchema.validate(
      { ...req.body, sheetName: "AI_Become_Contributor" },
      { abortEarly: false, stripUnknown: true },
    );
    submission.email = submission.email.trim().toLowerCase();
    if (await partnerEmailIsUnavailable(submission)) {
      return res.status(409).json({ message: partnerEmailConflictMessage });
    }
    const verificationId = randomUUID();
    const token = jwt.sign(
      {
        purpose: TOKEN_PURPOSE,
        verificationId,
        submission,
        nomadUser: req.userData?._id ? String(req.userData._id) : null,
      },
      tokenSecret(),
      { expiresIn: LINK_EXPIRY },
    );
    const verifyUrl = `${nomadsSiteUrl()}/verify-contributor-email?token=${encodeURIComponent(token)}`;
    const email = buildVerificationLinkEmail({ submission, verifyUrl });
    await sendMail({ to: submission.email, ...email });
    return res.status(200).json({
      message: "Verification link sent. Please check your email to continue.",
      email: maskEmail(submission.email),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.errors[0] });
    }
    return next(error);
  }
};

export const sendContributorVerificationOtp = async (req, res, next) => {
  try {
    const resolved = resolveToken(req.body?.token);
    if (resolved.error) {
      const { status, ...body } = resolved.error;
      return res.status(status).json(body);
    }
    const { decoded } = resolved;
    const submission = decoded.submission;
    if (await partnerEmailIsUnavailable(submission)) {
      return res.status(409).json({ message: partnerEmailConflictMessage });
    }
    if (await BecomeContributor.exists({ verificationId: decoded.verificationId })) {
      return res.status(200).json({ alreadyVerified: true, email: maskEmail(submission.email) });
    }
    const resend = req.body?.resend === true;
    const lastOtp = await Otp.findOne({
      email: submission.email,
      purpose: "contributor_submission",
      isUsed: false,
      "payload.verificationId": decoded.verificationId,
    }).sort({ createdAt: -1 });
    if (lastOtp && lastOtp.expiresAt.getTime() > Date.now() && lastOtp.attempts < OTP_MAX_ATTEMPTS) {
      const waitMs = lastOtp.createdAt.getTime() + OTP_COOLDOWN_MS - Date.now();
      if (!resend || waitMs > 0) {
        return res.status(200).json({
          sent: false,
          alreadySent: true,
          email: maskEmail(submission.email),
          retryAfterSeconds: Math.max(0, Math.ceil(waitMs / 1000)),
        });
      }
    }
    await Otp.updateMany(
      { email: submission.email, purpose: "contributor_submission", isUsed: false },
      { $set: { isUsed: true } },
    );
    const code = String(randomInt(100000, 1000000));
    await Otp.create({
      email: submission.email,
      code: hashOtp(code),
      purpose: "contributor_submission",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      payload: { verificationId: decoded.verificationId },
    });
    const email = buildVerificationOtpEmail({ submission, code });
    await sendMail({ to: submission.email, ...email });
    return res.status(200).json({
      sent: true,
      email: maskEmail(submission.email),
      retryAfterSeconds: OTP_COOLDOWN_MS / 1000,
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyContributorSubmissionOtp = async (req, res, next) => {
  try {
    const otp = String(req.body?.otp || "").trim();
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Enter the 6-digit code from your email." });
    }
    const resolved = resolveToken(req.body?.token);
    if (resolved.error) {
      const { status, ...body } = resolved.error;
      return res.status(status).json(body);
    }
    const { decoded } = resolved;
    const submission = decoded.submission;
    const existing = await BecomeContributor.findOne({ verificationId: decoded.verificationId });
    if (existing) return res.status(200).json({ verified: true, alreadyVerified: true });
    if (await partnerEmailIsUnavailable(submission)) {
      return res.status(409).json({ message: partnerEmailConflictMessage });
    }

    const record = await Otp.findOne({
      email: submission.email,
      purpose: "contributor_submission",
      isUsed: false,
      "payload.verificationId": decoded.verificationId,
    }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: "Please request a verification code first." });
    if (record.expiresAt.getTime() < Date.now()) {
      record.isUsed = true;
      await record.save();
      return res.status(400).json({ message: "This code has expired. Request a new one." });
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      record.isUsed = true;
      await record.save();
      return res.status(429).json({ message: "Too many attempts. Request a new code." });
    }
    if (!otpMatches(otp, record.code)) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Incorrect code. Try again." });
    }
    record.isUsed = true;
    await record.save();

    const submittedAt = new Date();
    const lead = await BecomeContributor.create({
      ...submission,
      email: submission.email.trim().toLowerCase(),
      nomadUser: decoded.nomadUser || null,
      verificationId: decoded.verificationId,
      submittedAt,
    });

    setImmediate(async () => {
      try {
        const sheetPayload = { ...submission, submittedAt };
        if (process.env.B2C_APPS_SCRIPT_URL) {
          const result = await fetch(process.env.B2C_APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sheetPayload),
          }).then((response) => response.json());
          if (result.status !== "success") {
            console.warn("Contributor Google Sheets sync failed:", result.message || "Unknown error");
          }
        }
        const confirmation = buildVerifiedSubmissionEmail(submission);
        await sendMail({ to: submission.email, ...confirmation });
        await sendAdminFormNotification({
          subject: "New verified contributor or partner submission",
          formName: "AI_Become_Contributor",
          data: sheetPayload,
        });
      } catch (error) {
        console.error("Verified contributor submission follow-up failed:", error.message);
      }
    });

    return res.status(201).json({
      verified: true,
      message: "Email verified and submission completed successfully.",
      data: lead,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(200).json({ verified: true, alreadyVerified: true });
    }
    return next(error);
  }
};
