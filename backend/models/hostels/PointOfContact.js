import mongoose from "mongoose";

const hostelPointOfContact = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },
    poc: {
      name: { type: String, required: true },
      image: { type: String },
      designation: { type: String },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      linkedInProfile: { type: String },
    },
    languages: {
      type: [String], 
      default: [],
    },
    address: {
      type: String,
      required: true,
    },
    availabilityTime: {
      type: String,
    },
  },
  { timestamps: true }
);

const HostelPointOfContact = mongoose.model(
  "BusinessDetails",
  hostelPointOfContact
);

export default HostelPointOfContact;
