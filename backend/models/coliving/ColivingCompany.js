import mongoose from "mongoose";

const colivingSchema = new mongoose.Schema(
  {
    businessId: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    registeredEntityName: { type: String },
    website: { type: String },
    logo: { type: String },
    images: [{ type: String }],
    address: { type: String },
    ratings: {
      type: Number,
    },
    reviews: {
      type: Number,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    city: { type: String },
    about: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    googleMap: { type: String },
  },
  {
    timestamps: true,
  }
);

const ColivingCompany = mongoose.model("CoLiving", colivingSchema);
export default ColivingCompany;
