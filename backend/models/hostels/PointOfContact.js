import mongoose from "mongoose";

const hostelPointOfContact = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
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
      type: String,
    },
  },
  { timestamps: true }
);

const HostelPointOfContact = mongoose.model(
  "HostelPointOfContact",
  hostelPointOfContact
);

export default HostelPointOfContact;
