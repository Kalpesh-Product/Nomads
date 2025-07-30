const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
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
    service: {
      type: String,
    },
    logo: {
      type: String,
    },
    images: {
      type: [String],
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    about: {
      type: String,
    },
    totalSeats: {
      type: Number,
      default: 0,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    googleMapLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);
export default Company;
