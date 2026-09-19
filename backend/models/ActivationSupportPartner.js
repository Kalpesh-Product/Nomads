import mongoose from "mongoose";

const activationSupportPartnerSchema = new mongoose.Schema(
  {
    srNo: { type: Number, default: null },
    continent: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, required: true },
    destination: { type: String, trim: true, required: true },
    supportProviding: { type: String, trim: true, default: "" },
    company: { type: String, trim: true, required: true },
    agentName: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    contact: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    address: { type: String, trim: true, default: "" },
    rating: { type: Number, default: null },
    googleReviews: { type: Number, default: null },
    status: { type: String, trim: true, default: "Active" },
    normalizedCountry: { type: String, trim: true, required: true },
    normalizedDestination: { type: String, trim: true, required: true },
    normalizedCompany: { type: String, trim: true, required: true },
  },
  { timestamps: true },
);

activationSupportPartnerSchema.index(
  {
    normalizedCountry: 1,
    normalizedDestination: 1,
    normalizedCompany: 1,
    email: 1,
    contact: 1,
  },
  { unique: true },
);

const ActivationSupportPartner = mongoose.model(
  "ActivationSupportPartner",
  activationSupportPartnerSchema,
  "activationSupportPartners",
);

export default ActivationSupportPartner;
