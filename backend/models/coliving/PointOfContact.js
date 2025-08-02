import mongoose from "mongoose";

const pointOfContactSchema = new mongoose.Schema(
  {
    colivingCompany: { type: mongoose.Schema.Types.ObjectId, ref: "CoLiving" },
    name: { type: String, required: true },
    profileImage: { type: String, default: "" },
    designation: { type: String, required: true },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    linkedInProfile: { type: String, default: "" },

    languagesSpoken: [{ type: String }],
    address: { type: String, required: true },
    availabilityTime: { type: String, default: "" },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ColivingPointOfContact = mongoose.model(
  "ColivingPointOfContact",
  pointOfContactSchema
);

export default ColivingPointOfContact;
