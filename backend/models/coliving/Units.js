import mongoose from "mongoose";

const coLivingBusinessSchema = new mongoose.Schema(
  {
    businessId: {
      type:mongoose.Schema.Types.ObjectId,
      ref:"CoLiving"
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

export default mongoose.model("CoLivingBusiness", coLivingBusinessSchema);
