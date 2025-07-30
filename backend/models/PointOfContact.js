import mongoose from "mongoose";

const pointOfContactSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
    },
    responseRate: {
      type: Number, 
      min: 0,
      max: 100,
    },
    responseTime: {
      type: String, 
    },
    languagesSpoken: {
      type: [String],
    },
    location: {
      type: String, 
    },
    profileImage: {
      type: String, 
    },
  },
  {
    timestamps: true,
  }
);

const PointOfContact = mongoose.model("PointOfContact", pointOfContactSchema);
export default PointOfContact;
