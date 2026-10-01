import mongoose from "mongoose";

const hostUserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    mobile: { type: String, trim: true },
    country: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    role: { type: String, trim: true },
    goals: { type: String, trim: true },
    billingCycle: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["monthly", "annual"],
      default: "monthly",
    },
    companyName: { type: String, trim: true },
    industry: { type: String, trim: true },
    verticalType: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    companyCountry: { type: String, trim: true },
    companyState: { type: String, trim: true },
    companyCity: { type: String, trim: true },
    source: { type: String, trim: true, default: "AiHostSignup" },
    formName: { type: String, trim: true, default: "register" },
    comment: { type: String, trim: true, default: "" },
    status: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["pending", "contacted", "closed", "rejected"],
      default: "pending",
    },
    // Set when the lead started from "Verify Business" on a wono.co listing:
    // the Nomads company they asked to verify, and the click that brought them
    // (see VerifyBusinessClick). Staff use nomadsCompanyId to link that
    // company's listings to the host when sending the invite.
    // Reference shown in the lead's emails (WN-REG-YYYYMMDD-00001); assigned
    // once at signup so every email carries the same one.
    registrationId: { type: String, trim: true, default: "" },
    nomadsCompanyId: { type: String, trim: true, default: "" },
    verifyClickId: { type: String, trim: true, default: "" },
    sourceListing: {
      businessId: { type: String, trim: true, default: "" },
      companyType: { type: String, trim: true, default: "" },
      companyName: { type: String, trim: true, default: "" },
    },
    // A lead only reaches the master panel once the submitter has proven they
    // own the email (link in the verification email -> OTP page). Legacy rows
    // predate this field and are treated as verified (see getHostUsers).
    emailVerified: { type: Boolean, default: false, index: true },
    emailVerifiedAt: { type: Date, default: null },
    verificationLinkSentAt: { type: Date, default: null },
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

const HostUser = mongoose.model("HostUser", hostUserSchema);

export default HostUser;
