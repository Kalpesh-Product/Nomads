import mongoose from "mongoose";

const connectWithUsSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    mobile: { type: String, trim: true, required: true },
    typeOfPartnerShip: { type: String, trim: true, required: true },
    message: { type: String, trim: true, required: true },
    sheetName: { type: String, trim: true, default: "Connect_with_us" },
    source: { type: String, trim: true, default: "nomad" },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Closed"],
      default: "Pending",
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "connectWithUs" },
);

export default mongoose.model("ConnectWithUs", connectWithUsSchema);
