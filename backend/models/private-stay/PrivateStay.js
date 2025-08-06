const mongoose = require("mongoose");

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
    logo: {
      type: String, // URL to the logo
    },
    images: {
      type: [String], // array of image URLs
    },
    address: {
      type: String,
    },
    city: {
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
      type: String, // embed link or map URL
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
