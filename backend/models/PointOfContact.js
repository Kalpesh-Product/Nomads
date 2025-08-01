import mongoose from "mongoose";

const pointOfContactSchema = new mongoose.Schema(
  {
    coworkingCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingCompany",
      required: true,
    },
    name: {
      type: String,
    },
    designation: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    linkedInProfile: {
      type: String,
    },
    languagesSpoken: {
      type: [String],
    },
    address: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    availibilityTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const PointOfContact = mongoose.model("PointOfContact", pointOfContactSchema);
export default PointOfContact;
