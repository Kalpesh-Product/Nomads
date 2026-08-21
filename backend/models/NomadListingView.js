import mongoose from "mongoose";

const nomadListingViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NomadUser",
      index: true,
    },
    // Company/listing identifiers — stored as plain labels (not populated
    // refs) since `businessId`/`companyId` are custom String fields on
    // Company, not its Mongo _id.
    companyId: { type: String, trim: true },
    businessId: { type: String, trim: true },
    companyName: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    continent: { type: String, trim: true },
    sourcePage: { type: String, trim: true },
    sourceView: { type: String, enum: ["", "list", "map"], default: "", index: true },
    pagePath: { type: String, trim: true },
    referrer: { type: String, trim: true },
    sessionId: { type: String, trim: true, index: true },
    ipAddress: { type: String, trim: true },
  },
  { timestamps: true },
);

nomadListingViewSchema.index({ userId: 1, createdAt: -1 });
nomadListingViewSchema.index({ sessionId: 1, createdAt: -1 });

const NomadListingView =
  mongoose.models.NomadListingView ||
  mongoose.model("NomadListingView", nomadListingViewSchema);

export default NomadListingView;
