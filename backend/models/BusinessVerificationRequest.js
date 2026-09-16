import mongoose from "mongoose";

const businessVerificationRequestSchema = new mongoose.Schema(
  {
    nomadUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NomadUser",
      required: true,
    },
    companyId: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    verticalsSnapshot: {
      type: [
        {
          businessId: String,
          companyType: String,
          city: String,
        },
      ],
      default: [],
    },
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    mobile: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      trim: true,
      required: true,
    },
    country: {
      type: String,
      trim: true,
      required: true,
    },
    industry: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one industry/vertical is required",
      },
    },
    registeredCompanyName: {
      type: String,
      trim: true,
      required: true,
    },
    companyCountry: {
      type: String,
      trim: true,
      required: true,
    },
    companyState: {
      type: String,
      trim: true,
      required: true,
    },
    companyCity: {
      type: String,
      trim: true,
      required: true,
    },
    continent: {
      type: String,
      trim: true,
      required: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    proofDocument: {
      type: {
        url: String,
        id: String,
      },
      required: true,
    },
    requestedTier: {
      type: String,
      enum: ["1m", "3m", "6m", "1y"],
      required: true,
    },
    requestedAmountUsd: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Payment/lifecycle state — orthogonal to `status` (which is only the
    // admin's review decision). Approve no longer flips isVerified; only a
    // successful Stripe payment (relayed via mark-paid) does.
    paymentStatus: {
      type: String,
      enum: ["not_required", "awaiting_payment", "paid"],
      default: "not_required",
    },
    // Tier/amount actually charged in the most recent successful payment.
    // Distinct from requestedTier/requestedAmountUsd (what was first asked
    // for at submission) because a renewal can switch tiers.
    activeTier: {
      type: String,
      enum: ["1m", "3m", "6m", "1y", null],
      default: null,
    },
    activeAmountUsd: { type: Number, default: null },
    paidAt: { type: Date, default: null },
    // Mirrors Company.verificationExpiresAt for this companyId.
    verificationExpiresAt: { type: Date, default: null },
    // Idempotency marker for the 5-day-before-expiry reminder job; reset to
    // null on every successful payment so the next cycle can remind again.
    renewalReminderSentAt: { type: Date, default: null },
    // Idempotency marker for the expiry-day notice email; reset to null on
    // every successful payment so a future lapse can notify again.
    expiryNoticeSentAt: { type: Date, default: null },
    // Dedupe key for mark-paid, independent of WoMP's own webhook guard.
    lastAppliedPaymentReference: { type: String, default: null },
  },
  { timestamps: true },
);

businessVerificationRequestSchema.index({ companyId: 1 });
businessVerificationRequestSchema.index({ nomadUser: 1 });

const BusinessVerificationRequest = mongoose.model(
  "BusinessVerificationRequest",
  businessVerificationRequestSchema,
);

export default BusinessVerificationRequest;
