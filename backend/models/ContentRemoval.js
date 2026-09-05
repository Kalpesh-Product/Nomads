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
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "contentRemoval" },
);

export default mongoose.model("ContentRemoval", contentRemovalSchema);
