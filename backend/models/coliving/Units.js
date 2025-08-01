import mongoose from "mongoose";

const ColivingUnitSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoLiving",
    },
    businessName: {
      type: String,
      required: true,
    },
    allUnits: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ColivingUnits = mongoose.model("ColivingUnit", ColivingUnitSchema);
export default ColivingUnits;
