import mongoose from "mongoose";

const cafeSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    registeredEntityName: {
      type: String,
    },
    logo: {
      type: String,
    },
    images: {
      type: [{ url: String, index: Number }],
    },
    website: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    about: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    inclusions: String,
    longitude: {
      type: Number,
    },
    googleMap: {
      type: String,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Cafe = mongoose.model("cafe", cafeSchema, "cafes");

export default Cafe;
