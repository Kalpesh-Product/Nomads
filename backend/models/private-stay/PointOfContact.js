import mongoose from "mongoose";

const privateStayPointOfContactSchema = new mongoose.Schema(
  {
    privateStay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrivateStay",
    },
    poc: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      image: {
        type: String, // URL to the image
        trim: true,
      },
      designation: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phoneNumber: {
        type: String,
        trim: true,
      },
      linkedInProfile: {
        type: String,
        trim: true,
      },
    },
    languages: {
      type: [String], // e.g., ["English", "Hindi"]
      default: [],
    },
    address: {
      type: String,
      trim: true,
    },
    availabilityTime: {
      type: String, // or use Date / custom object if time range
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const PrivateStayPointOfContact = mongoose.model(
  "PrivateStayPointOfContact",
  privateStayPointOfContactSchema
);
export default PrivateStayPointOfContact;
