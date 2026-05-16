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
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

const HostUser = mongoose.model("HostUser", hostUserSchema);

export default HostUser;
