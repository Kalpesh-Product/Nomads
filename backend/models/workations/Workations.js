import mongoose from "mongoose";

const workationSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    registeredEntityName: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    units: {
      type: Number,
      default: 0,
    },
    logo: {
      type: String,
      trim: true,
    },
    images: {
      type: [{ url: String, index: Number }],
    },

    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    about: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    googleMap: {
      type: String, // Google Maps URL
      trim: true,
    },
    ratings: {
      type: Number,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    inclusions: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const Workation = mongoose.model("workation", workationSchema);
export default Workation;
