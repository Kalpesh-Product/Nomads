import mongoose from "mongoose";

const placeReviewSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    placeId: {
      type: String,
      required: true,
      trim: true,
    },
    placeName: {
      type: String,
      trim: true,
      default: "",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    reviewerName: {
      type: String,
      trim: true,
      default: "",
    },
    continent: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    starCount: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NomadUser",
      required: true,
    },
  },
  { timestamps: true },
);

placeReviewSchema.index({ place: 1, reviewer: 1 }, { unique: true });

const PlaceReview = mongoose.model(
  "PlaceReview",
  placeReviewSchema,
  "placeReviews",
);

export default PlaceReview;
