import mongoose from "mongoose";

const unitsSchema = new mongoose.Schema(
  {
    workation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workation",
    },
    allUnits: [String],
  },
  { timestamps: true }
);

const WorkationUnits = mongoose.model("WorkationUnit", unitsSchema);
export default WorkationUnits;
