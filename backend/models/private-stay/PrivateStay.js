import mongoose from "mongoose";

const privateStaySchema = new mongoose.Schema(
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
    inclusions: String,
    logo: {
      type: String, 
    },
    images: {
      type: [{ url: String, index: Number }],
    },
    address: {
      type: String,
    },
    city: {
      type: String,
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
    },
  },
  {
    timestamps: true,
  }
);

const PrivateStay = mongoose.model("PrivateStay", privateStaySchema);
export default PrivateStay;
