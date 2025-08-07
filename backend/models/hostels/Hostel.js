import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
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
    website: {
      type: String,
    },
    logo: {
      type: String,
    },
    images: {
      type: [{ url: String, index: Number }],
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    about: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    googleMap: {
      type: String,
    },
    ratings: {
      type: Number,
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

const Hostels = mongoose.model("Hostel", hostelSchema);
export default Hostels;
