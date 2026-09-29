import Company from "../models/Company.js";
import BusinessVerificationRequest from "../models/BusinessVerificationRequest.js";
import { sendMail } from "../config/mailer.js";
import { renderNotificationEmail, formatLongDate } from "../utils/emailTemplates.js";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const hostPanelUrl = () =>
  String(process.env.HOST_PANEL_FRONTEND_URL || "https://hostpanel.wono.co").replace(
    /\/+$/,
    "",
  );

// Sent once, when a HostPanel request is approved and its free period begins.
const sendFreeBadgeActiveEmail = async (request, startsAt, endsAt) => {
  const company = escapeHtml(request.companyName);
  await sendMail({
    to: request.email,
    subject: "Your Verified Badge Is Live",
    text: `Your verified badge for ${request.companyName} is live — free until ${formatLongDate(endsAt)}.`,
    html: renderNotificationEmail({
      heroTitle: "Your Verified Badge Is Live",
      heroSubtitle: "Approved — free for your first 3 months.",
      greetingHtml: `
        <p style="margin:0 0 4px;">Hello ${escapeHtml(request.fullName)},</p>
        <p class="email-text" style="margin:0;">Our team has approved your documents. The verified badge for <b class="email-heading">${company}</b> is now shown on your listings — free for the first 3 months.</p>
      `,
      detailsTitle: "Your Verified Badge",
      detailRows: [
        ["Company", company],
        ["Plan", "Free · 3 months"],
        ["Started", formatLongDate(startsAt)],
        ["Ends", formatLongDate(endsAt)],
      ],
      ctaButton: {
        label: "Manage Verification",
        href: `${hostPanelUrl()}/key-apps/verify-business`,
        caption: "We'll remind you a month before it ends. Renew for 1 month or 1 year to keep it.",
      },
    }),
  });
};

// Only 1 month and 1 year can be purchased now. VERIFICATION_TIER_MONTHS
// below still lists the retired 3m / 6m plans so payments already in flight
// (and existing verifications) on them keep working.
const VERIFICATION_TIER_AMOUNTS_USD = {
  "1m": 10,
  "1y": 50,
};

const VERIFICATION_TIER_MONTHS = {
  "1m": 1,
  "3m": 3,
  "6m": 6,
  "1y": 12,
};

// Company decision: every plan gets the verified badge free for the first 3
// months after approval. Stored under the legacy "3m" tier so all existing
// display / expiry / reminder logic keeps working unchanged.
const FREE_VERIFICATION_MONTHS = 3;
// The "ending soon" email/banner goes out once this many days remain, i.e.
// after roughly 2 of the 3 free months.
const TRIAL_ENDING_NOTICE_DAYS = 30;

// POST /api/admin/verification-requests — a host's verification submission
// from HostPanel. Lands as "pending" for staff review (Company Verification
// Leads in the master panel); payment only opens up once staff approve it.
// A company only ever has one request: a rejected one is reopened in place
// (so the host can fix documents and resubmit), a pending one blocks a
// duplicate, and an approved one goes through the payment path instead.
export const createVerificationRequestAdmin = async (req, res, next) => {
  try {
    const {
      companyId,
      companyName,
      businessName,
      verticalsSnapshot,
      fullName,
      email,
      mobile,
      role,
      country,
      industry,
      registeredCompanyName,
      companyCountry,
      companyState,
      companyCity,
      continent,
      websiteUrl,
      requestedTier,
      proofDocuments,
    } = req.body;

    const requiredFields = {
      companyId,
      companyName,
      fullName,
      email,
      role,
      country,
      registeredCompanyName,
      companyCountry,
      companyState,
      companyCity,
      continent,
      requestedTier,
    };

    const missingField = Object.entries(requiredFields).find(
      ([, value]) => !value,
    );
    if (missingField) {
      return res
        .status(400)
        .json({ message: `${missingField[0]} is required` });
    }

    if (!Array.isArray(industry) || !industry.length) {
      return res
        .status(400)
        .json({ message: "At least one industry/vertical is required" });
    }

    if (!Array.isArray(proofDocuments) || !proofDocuments.length) {
      return res
        .status(400)
        .json({ message: "At least one proof document is required" });
    }

    const requestedAmountUsd = VERIFICATION_TIER_AMOUNTS_USD[requestedTier];
    if (!requestedAmountUsd) {
      return res.status(400).json({ message: "Invalid requestedTier" });
    }

    const fields = {
      submittedVia: "host_panel",
      companyId,
      companyName,
      businessName,
      verticalsSnapshot: Array.isArray(verticalsSnapshot)
        ? verticalsSnapshot
        : [],
      fullName,
      email,
      mobile,
      role,
      country,
      industry,
      registeredCompanyName,
      companyCountry,
      companyState,
      companyCity,
      continent,
      websiteUrl,
      requestedTier,
      requestedAmountUsd,
      proofDocuments: proofDocuments.map(({ label, url, id }) => ({
        label,
        url,
        id,
      })),
      status: "pending",
      paymentStatus: "not_required",
      rejectionReason: "",
    };

    const existing = await BusinessVerificationRequest.findOne({ companyId });
    if (existing) {
      if (existing.status !== "rejected") {
        return res.status(409).json({
          message:
            existing.status === "pending"
              ? "A verification request for this company is already under review."
              : "This company's verification request was already approved.",
        });
      }
      existing.set(fields);
      await existing.save();
      return res.status(200).json({ data: existing });
    }

    const request = await BusinessVerificationRequest.create(fields);
    return res.status(201).json({ data: request });
  } catch (error) {
    next(error);
  }
};

// Internal admin surface — gated by verifyAdminApiKey, called by the master
// panel's server (not a signed-in Nomad app user). Mirrors the shape of
// getHostUsers/updateHostUserStatusAndComment in b2bFormControllers.js.
// Optional ?companyId= filter — used by the HostPanel proxy to check for an
// existing request before creating a duplicate for the same company.
export const getVerificationRequestsAdmin = async (req, res, next) => {
  try {
    const { companyId } = req.query;
    const query = companyId ? { companyId } : {};
    const requests = await BusinessVerificationRequest.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

export const updateVerificationRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const allowedStatuses = ["pending", "approved", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be one of: pending, approved, rejected",
      });
    }

    const request = await BusinessVerificationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Verification request not found" });
    }

    request.status = status;
    request.rejectionReason =
      status === "rejected" ? String(rejectionReason || "").trim() : "";

    // A HostPanel request that is approved for the first time is activated
    // straight away for FREE_VERIFICATION_MONTHS, with no payment. Payment only
    // comes in when the host renews (1 month / 1 year). Everything else keeps
    // the original rule: approve only opens the door to a payment link, and
    // the badge is switched on by markVerificationRequestPaid.
    const grantsFreePeriod =
      status === "approved" &&
      request.submittedVia === "host_panel" &&
      !request.freePeriodGrantedAt &&
      !request.activeTier;

    if (grantsFreePeriod) {
      const now = new Date();
      const endsAt = new Date(now);
      endsAt.setMonth(endsAt.getMonth() + FREE_VERIFICATION_MONTHS);

      request.paymentStatus = "paid";
      request.activeTier = "3m";
      request.activeAmountUsd = 0;
      request.paidAt = now;
      request.isFreePeriod = true;
      request.freePeriodGrantedAt = now;
      request.verificationStartsAt = now;
      request.verificationExpiresAt = endsAt;
      request.renewalReminderSentAt = null;
      request.expiryNoticeSentAt = null;
      request.trialEndingNoticeSentAt = null;
      await request.save();

      // Verification is company-wide, exactly as in markVerificationRequestPaid.
      await Company.updateMany(
        { companyId: request.companyId },
        {
          $set: {
            isVerified: true,
            verificationTier: "3m",
            verificationExpiresAt: endsAt,
          },
        },
      );
      try {
        await sendFreeBadgeActiveEmail(request, now, endsAt);
      } catch (mailError) {
        console.error("Failed to send verified-badge-live email:", mailError.message);
      }
      return res.status(200).json(request);
    }

    if (!(status === "approved" && request.paymentStatus === "paid")) {
      request.paymentStatus =
        status === "approved" ? "awaiting_payment" : "not_required";
    }
    await request.save();

    return res.status(200).json(request);
  } catch (error) {
    next(error);
  }
};

// Renewal rule: extend from the current verificationExpiresAt if renewing
// before it lapses; if already expired (or this is the first payment),
// start counting from now.
const computeExtendedExpiry = (currentExpiresAt, tier) => {
  const months = VERIFICATION_TIER_MONTHS[tier] || 1;
  const base =
    currentExpiresAt && new Date(currentExpiresAt) > new Date()
      ? new Date(currentExpiresAt)
      : new Date();
  base.setMonth(base.getMonth() + months);
  return base;
};

// GET /api/admin/verification-requests/:id — used by the master panel
// before creating a Stripe Payment Link, so the amount/identity charged
// always comes from this record, not from client-supplied values.
export const getVerificationRequestByIdAdmin = async (req, res, next) => {
  try {
    const request = await BusinessVerificationRequest.findById(
      req.params.id,
    ).lean();
    if (!request) {
      return res.status(404).json({ message: "Verification request not found" });
    }
    return res.status(200).json({ data: request });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/verification-requests/:id/mark-paid
// Body: { tier, amountUsd, paidAt, paymentReference }
// Called by the master panel's Stripe webhook handler once payment for this
// request (initial or renewal) has been confirmed.
export const markVerificationRequestPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tier, amountUsd, paidAt, paymentReference } = req.body;

    if (!VERIFICATION_TIER_MONTHS[tier]) {
      return res.status(400).json({ message: "Invalid tier" });
    }

    const request = await BusinessVerificationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Verification request not found" });
    }

    // Idempotency: the master panel's own webhook guard is idempotent too,
    // but this endpoint defends independently in case it's ever replayed
    // out-of-band with the same payment reference.
    if (
      paymentReference &&
      request.lastAppliedPaymentReference === paymentReference
    ) {
      return res.status(200).json({ message: "Already applied", data: request });
    }

    const newExpiry = computeExtendedExpiry(
      request.verificationExpiresAt,
      tier,
    );
    // A renewal that extends a still-running period keeps the original start
    // (continuous coverage); a first payment or a restart after lapse starts now.
    const stillRunning =
      request.verificationExpiresAt &&
      new Date(request.verificationExpiresAt) > new Date();
    if (!stillRunning || !request.verificationStartsAt) {
      request.verificationStartsAt = new Date();
    }
    request.isFreePeriod = false;
    request.trialEndingNoticeSentAt = null;

    request.paymentStatus = "paid";
    request.activeTier = tier;
    request.activeAmountUsd = amountUsd;
    request.paidAt = paidAt ? new Date(paidAt) : new Date();
    request.verificationExpiresAt = newExpiry;
    request.renewalReminderSentAt = null;
    request.lastAppliedPaymentReference =
      paymentReference || request.lastAppliedPaymentReference;
    await request.save();

    // Verification is company-wide: flip the badge on every listing that
    // shares this request's companyId, not just the one it was opened from.
    await Company.updateMany(
      { companyId: request.companyId },
      {
        $set: {
          isVerified: true,
          verificationTier: tier,
          verificationExpiresAt: newExpiry,
        },
      },
    );

    return res.status(200).json({
      message: "Verification marked as paid",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/verification-requests/badge-visibility
// Body: { businessId, hidden }. Display-only — toggling this never touches
// isVerified/verificationTier/verificationExpiresAt, so it can be flipped
// back and forth freely without affecting the underlying paid verification.
export const setVerifiedBadgeVisibility = async (req, res, next) => {
  try {
    const { businessId, hidden } = req.body;
    if (!businessId) {
      return res.status(400).json({ message: "businessId is required" });
    }

    const listing = await Company.findOneAndUpdate(
      { businessId },
      { $set: { verifiedBadgeHidden: Boolean(hidden) } },
      { new: true },
    ).lean();

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    return res.status(200).json({ data: listing });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/verification-requests/renewals-due?withinDays=5
export const getVerificationRenewalsDue = async (req, res, next) => {
  try {
    const withinDays = Number(req.query.withinDays) || 5;
    const now = new Date();
    const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

    const requests = await BusinessVerificationRequest.find({
      status: "approved",
      paymentStatus: "paid",
      verificationExpiresAt: { $gte: now, $lte: cutoff },
      renewalReminderSentAt: null,
    })
      .sort({ verificationExpiresAt: 1 })
      .lean();

    return res.status(200).json({ count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/verification-requests/trial-ending-soon
// Free-period verifications with about a month left that haven't been told.
export const getVerificationTrialsEndingSoon = async (req, res, next) => {
  try {
    const withinDays = Number(req.query.withinDays) || TRIAL_ENDING_NOTICE_DAYS;
    const now = new Date();
    const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

    const requests = await BusinessVerificationRequest.find({
      status: "approved",
      isFreePeriod: true,
      verificationExpiresAt: { $gt: now, $lte: cutoff },
      trialEndingNoticeSentAt: null,
    })
      .sort({ verificationExpiresAt: 1 })
      .lean();

    return res.status(200).json({ count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/verification-requests/:id/mark-trial-notice-sent
export const markVerificationTrialNoticeSent = async (req, res, next) => {
  try {
    const request = await BusinessVerificationRequest.findByIdAndUpdate(
      req.params.id,
      { trialEndingNoticeSentAt: new Date() },
      { new: true },
    );
    if (!request) {
      return res.status(404).json({ message: "Verification request not found" });
    }
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/verification-requests/:id/mark-reminder-sent
export const markVerificationReminderSent = async (req, res, next) => {
  try {
    const request = await BusinessVerificationRequest.findByIdAndUpdate(
      req.params.id,
      { renewalReminderSentAt: new Date() },
      { new: true },
    );
    if (!request) {
      return res.status(404).json({ message: "Verification request not found" });
    }
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/verification-requests/expired-pending-notice
export const getExpiredPendingNotice = async (req, res, next) => {
  try {
    const requests = await BusinessVerificationRequest.find({
      status: "approved",
      paymentStatus: "paid",
      verificationExpiresAt: { $lte: new Date() },
      expiryNoticeSentAt: null,
    }).lean();

    return res.status(200).json({ count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/verification-requests/:id/mark-expiry-notice-sent
export const markVerificationExpiryNoticeSent = async (req, res, next) => {
  try {
    const request = await BusinessVerificationRequest.findByIdAndUpdate(
      req.params.id,
      { expiryNoticeSentAt: new Date() },
      { new: true },
    );
    if (!request) {
      return res.status(404).json({ message: "Verification request not found" });
    }
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    next(error);
  }
};
