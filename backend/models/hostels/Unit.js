import mongoose from "mongoose";

const hostelUnitsSchema = new mongoose.Schema(
  {
    hostel: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
    units: [String],
  },
  {
    timestamps: true,
  }
);

const HostelUnits = mongoose.model("HostelUnit", hostelUnitsSchema);
export default HostelUnits;
