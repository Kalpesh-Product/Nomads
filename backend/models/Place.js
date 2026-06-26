import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      trim: true,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    mainImage: {
      type: String,
      trim: true,
      default: "",
    },
    placeName: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    googleMapsLink: {
      type: String,
      trim: true,
      default: "",
    },
    rating: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    month: {
      type: String,
      trim: true,
      default: "",
    },
    venue: {
      type: String,
      trim: true,
      default: "",
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    placeType: {
      type: String,
      trim: true,
      default: "",
    },
    sections: [
      {
        title: { type: String, default: "" },
        image: { type: String, default: "" },
        content: { type: String, default: "" },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

placeSchema.index({ destination: 1 });

const Place = mongoose.model("Place", placeSchema, "places");

export default Place;
