import Company from "../models/Company.js";
import BusinessVerificationRequest from "../models/BusinessVerificationRequest.js";
import { uploadFileToS3 } from "../config/s3Config.js";
import { sendMail } from "../config/mailer.js";
import { renderNotificationEmail } from "../utils/emailTemplates.js";
import {
  createVerificationPaymentLink,
  getVerificationPaymentHistory,
} from "../utils/wompVerificationClient.js";

const VERIFICATION_TIER_AMOUNTS_USD = {
  "1m": 10,
  "3m": 25,
  "6m": 45,
  "1y": 80,
};

const VERIFICATION_TIER_LABELS = {
  "1m": "1 Month",
  "3m": "3 Months",
  "6m": "6 Months",
  "1y": "1 Year",
};

const SEARCH_RESULTS_LIMIT = 20;

export const searchCompanies = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json([]);

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const companies = await Company.find({
      isActive: true,
      $or: [{ companyName: regex }, { registeredEntityName: regex }],
    })
      .select(
        "companyId companyName businessId companyType city state country continent website registeredEntityName logo",
      )
      .lean()
      .exec();

    const grouped = new Map();
    for (const company of companies) {
      if (!company.companyId) continue;
      if (!grouped.has(company.companyId)) {
        grouped.set(company.companyId, {
          companyId: company.companyId,
          companyName: company.companyName,
          city: company.city,
          state: company.state,
          country: company.country,
          continent: company.continent,
          website: company.website,
          registeredEntityName: company.registeredEntityName,
          logo: company.logo,
          verticals: [],
        });
      }
      grouped.get(company.companyId).verticals.push({
        businessId: company.businessId,
        companyType: company.companyType,
      });
    }

    const results = Array.from(grouped.values()).slice(
      0,
      SEARCH_RESULTS_LIMIT,
    );

    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const submitVerificationRequest = async (req, res, next) => {
  try {
    const userId = req.userData?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      companyId,
      companyName,
      businessName,
      fullName,
      email,
      mobile,
      role,
      country,
      registeredCompanyName,
      companyCountry,
      companyState,
      companyCity,
      continent,
      websiteUrl,
      requestedTier,
    } = req.body;

    const verticalsSnapshot = parseJsonArray(req.body.verticalsSnapshot);
    const industry = parseJsonArray(req.body.industry);

    const requiredFields = {
      companyId,
      companyName,
      fullName,
      email,
      mobile,
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

    if (!industry.length) {
      return res
        .status(400)
        .json({ message: "At least one industry/vertical is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "A proof document is required" });
    }

    const requestedAmountUsd = VERIFICATION_TIER_AMOUNTS_USD[requestedTier];
    if (!requestedAmountUsd) {
      return res.status(400).json({ message: "Invalid requestedTier" });
    }

    const route = `verification-proofs/${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
    const uploaded = await uploadFileToS3(route, {
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
    });

    const request = await BusinessVerificationRequest.create({
      nomadUser: userId,
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
      requestedAmountUsd,
      proofDocument: { url: uploaded.url, id: uploaded.id },
      status: "pending",
    });

    try {
      await sendMail({
        to: email,
        subject: "Business Verification Request Received",
        text: `Hi ${fullName}, we've received your business verification request for ${businessName || companyName}. Our team will contact you for verification shortly.`,
        html: renderNotificationEmail({
          heroTitle: "Request Received!",
          heroSubtitle: "Your business verification request has been submitted.",
          greetingHtml: `
            <p style="margin:0 0 4px;">Hello ${fullName},</p>
            <p class="email-text" style="margin:0;">We've received your verification request for <b class="email-heading">${businessName || companyName}</b>. Our team will contact you for verification shortly.</p>
          `,
          detailsTitle: "Submitted Details",
          detailRows: [
            ["Business Name", businessName || companyName],
            ["Registered Company Name", registeredCompanyName],
            ["Role", role],
            ["Industry / Vertical", industry.join(", ")],
            ["Company Location", [companyCity, companyState, companyCountry].filter(Boolean).join(", ")],
            ["Continent", continent],
            ["Requested Plan", VERIFICATION_TIER_LABELS[requestedTier] || requestedTier],
          ],
          whatNextTitle: "What Happens Next?",
          whatNextItems: [
            "Our team will review your submitted details and proof document.",
            "We'll reach out to verify your business and confirm payment.",
            "Once approved, your blue verification badge goes live on all your listings.",
          ],
        }),
      });
    } catch (emailError) {
      console.error("Failed to send verification confirmation email:", emailError);
    }

    return res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

const VERIFICATION_TIER_MONTHS = {
  "1m": 1,
  "3m": 3,
  "6m": 6,
  "1y": 12,
};

// Internal admin surface — gated by verifyAdminApiKey, called by the master
// panel's server (not a signed-in Nomad app user). Mirrors the shape of
// getHostUsers/updateHostUserStatusAndComment in b2bFormControllers.js.
export const getVerificationRequestsAdmin = async (req, res, next) => {
  try {
    const requests = await BusinessVerificationRequest.find({})
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
    const { status } = req.body;
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
    // Approve no longer instantly verifies the company — it only clears the
    // request for a Stripe payment link to be sent by the master panel.
    // The badge (Company.isVerified) is only ever flipped on by
    // markVerificationRequestPaid, once a real payment is confirmed.
    request.paymentStatus = status === "approved" ? "awaiting_payment" : "not_required";
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

// GET /api/verification/my-requests (JWT, Nomad app user) — every request
// this user has ever submitted, so the frontend can show status and offer
// renew/change-plan per business they've submitted for.
export const getMyVerificationRequests = async (req, res, next) => {
  try {
    const requests = await BusinessVerificationRequest.find({
      nomadUser: req.userData._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ data: requests });
  } catch (error) {
    next(error);
  }
};

// POST /api/verification/:requestId/request-payment-link (JWT, Nomad app user)
// Body: { tier }. Self-serve renew/change-plan — requires a PRIOR successful
// payment (paymentStatus === "paid"); the very first payment still only ever
// comes from admin approval, unchanged.
export const requestSelfServePaymentLink = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { tier } = req.body || {};

    if (!VERIFICATION_TIER_MONTHS[tier]) {
      return res.status(400).json({ message: "Invalid tier" });
    }

    const request = await BusinessVerificationRequest.findById(requestId);
    if (!request || String(request.nomadUser) !== String(req.userData._id)) {
      return res.status(404).json({ message: "Verification request not found" });
    }
    if (request.paymentStatus !== "paid") {
      return res.status(400).json({
        message:
          "Complete your initial verification payment before renewing or changing plans",
      });
    }

    const { paymentLinkUrl } = await createVerificationPaymentLink({
      nomadsRequestId: request._id.toString(),
      tier,
    });

    return res.status(200).json({ paymentLinkUrl });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

// GET /api/verification/:requestId/history (JWT, Nomad app user) — every
// past payment attempt (initial, renewals, upgrades/downgrades) for one of
// the user's own verification requests, so the self-serve page can show
// "past plan vs current plan" instead of just the current state.
export const getRequestPaymentHistory = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const request = await BusinessVerificationRequest.findById(requestId).lean();
    if (!request || String(request.nomadUser) !== String(req.userData._id)) {
      return res.status(404).json({ message: "Verification request not found" });
    }

    const { data } = await getVerificationPaymentHistory({
      nomadsRequestId: requestId,
    });

    return res.status(200).json({ data: data || [] });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};
