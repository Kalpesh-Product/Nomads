import mongoose from "mongoose";

const cafePocSchema = new mongoose.Schema(
  {
    cafe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
    },

    name: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL to the image
    },
    designation: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    linkedInProfile: {
      type: String,
    },
    languages: {
      type: [String],
      default: [],
    },
    address: {
      type: String,
    },
    availabilityTime: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CafePoc = mongoose.model("CafePoc", cafePocSchema);
export default CafePoc;
