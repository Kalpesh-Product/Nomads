import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    restaurantId: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantTitle: {
      type: String,
      required: true,
      trim: true,
    },
    registeredEntityName: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    images: {
      type: String,
      trim: true,
    },
    mainImage: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
    },
    continent: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },
    totalSeats: {
      type: Number,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    googleMap: {
      type: String,
      trim: true,
    },
    googleMapsLink: {
      type: String,
      trim: true,
      default: "",
    },
    ratings: {
      type: Number,
      min: 0,
      max: 5,
    },
    rating: {
      type: String,
      trim: true,
      default: "",
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: String,
      trim: true,
    },
    poc: {
      type: String,
      trim: true,
    },
    inclusions: {
      type: String,
      trim: true,
    },
    services: {
      type: String,
      trim: true,
    },
    units: {
      type: String,
      trim: true,
    },
    restaurantType: {
      type: String,
      trim: true,
      default: "Restaurants",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

restaurantSchema.index({ destination: 1 });
restaurantSchema.index({ restaurantType: 1 });

const Restaurant = mongoose.model("Restaurant", restaurantSchema, "restaurants");

export default Restaurant;
