import mongoose from "mongoose";

const colivingSchema = new mongoose.Schema(
  {
    businessId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    registeredEntityName: { type: String },
    website: { type: String },
    logo: { type: String },
    images: [{ type: String }],
    address: { type: String },
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
