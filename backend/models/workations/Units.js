import mongoose from "mongoose";

const unitsSchema = new mongoose.Schema(
  {
    workation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workation",
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const WorkationUnits = mongoose.model("WorkationUnit", unitsSchema);
export default WorkationUnits;
