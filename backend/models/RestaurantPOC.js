import mongoose from "mongoose";

const restaurantPocSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    restaurantId: {
      type: String,
      required: true,
      trim: true,
    },
    businessId: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    linkedInProfile: {
      type: String,
      trim: true,
    },
    languagesSpoken: {
      type: [String],
      default: [],
    },
    address: {
      type: String,
      trim: true,
    },
    availibilityTime: {
      type: String,
      trim: true,
    },
    availabilityTime: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

restaurantPocSchema.index({ restaurant: 1 });
restaurantPocSchema.index({ businessId: 1 });

const RestaurantPOC = mongoose.model(
  "RestaurantPOC",
  restaurantPocSchema,
  "restaurantpocs",
);

export default RestaurantPOC;
