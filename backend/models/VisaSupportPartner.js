import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    agentNumber: { type: Number, required: true },
    name: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    contact: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const visaSupportPartnerSchema = new mongoose.Schema(
  {
    country: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true },
    normalizedCountry: { type: String, trim: true, required: true },
    normalizedCity: { type: String, trim: true, required: true },
    partners: { type: [partnerSchema], default: [] },
  },
  { timestamps: true },
);

visaSupportPartnerSchema.index(
  { normalizedCountry: 1, normalizedCity: 1 },
  { unique: true },
);

const VisaSupportPartner = mongoose.model(
  "VisaSupportPartner",
  visaSupportPartnerSchema,
  "visaSupportPartners",
);

export default VisaSupportPartner;
