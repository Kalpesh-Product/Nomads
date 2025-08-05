import mongoose from "mongoose";

const hostelUnitsSchema = new mongoose.Schema(
  {
    businessId: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    units: [String],
  },
  {
    timestamps: true,
  }
);

const HostelUnits = mongoose.model("HostelUnit", hostelUnitsSchema);
export default HostelUnits;
