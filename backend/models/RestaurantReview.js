import mongoose from "mongoose";

const restaurantReviewSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
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
    starCount: {
      type: Number,
      min: 1,
      max: 5,
    },
    description: {
      type: String,
      trim: true,
    },
    reviewSource: {
      type: String,
      trim: true,
    },
    reviewLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
  },
  { timestamps: true },
);

restaurantReviewSchema.index({ restaurant: 1 });
restaurantReviewSchema.index({ businessId: 1 });

const RestaurantReview = mongoose.model(
  "RestaurantReview",
  restaurantReviewSchema,
  "restaurantreviews",
);

export default RestaurantReview;
