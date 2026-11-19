import mongoose from "mongoose";

const contentRemovalSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, required: true },
    mobile: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    companyName: { type: String, trim: true, required: true },
    designation: { type: String, trim: true, required: true },
    urls: { type: String, trim: true, required: true },
    source: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["nomad", "host"],
      required: true,
    },
    sheetName: { type: String, trim: true, default: "Content_Removal_Requests" },
    // Operational state set from the Master Panel "Content Removal" tab.
    // Legacy rows have no value, so readers must default this to "Pending".
    // TODO(next): add a `statusHistory` array ({ from, to, changedBy, changedAt })
    // once these updates are authenticated — changing a takedown decision
    // needs an append-only audit trail.
    status: {
      type: String,
      enum: ["Pending", "In Review", "Resolved", "Rejected"],
      default: "Pending",
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "contentRemoval" },
);

export default mongoose.model("ContentRemoval", contentRemovalSchema);
