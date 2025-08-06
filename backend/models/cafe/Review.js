import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    cafe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
    },
    reviewerName: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewText: {
      type: String,
      trim: true,
    },
    platform: {
      type: String,
    },
    reviewLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CafeReview = mongoose.model("CafeReview", reviewSchema);
export default CafeReview;
