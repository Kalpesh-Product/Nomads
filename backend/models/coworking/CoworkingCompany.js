import mongoose from "mongoose";

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
    logo: {
      type: String,
    },
    images: {
      type: [String],
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

const CoworkingCompany = mongoose.model("CoworkingCompany", companySchema);
export default CoworkingCompany;
