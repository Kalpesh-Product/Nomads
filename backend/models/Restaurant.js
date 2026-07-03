import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
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
    restaurantName: {
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
    contact: {
      type: String,
      trim: true,
      default: "",
    },
    timeAvailability: {
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
    restaurantType: {
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

restaurantSchema.index({ destination: 1 });

const Restaurant = mongoose.model("Restaurant", restaurantSchema, "restaurants");

export default Restaurant;
