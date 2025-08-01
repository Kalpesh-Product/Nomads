import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    coworkingCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingCompany",
    },
    name: {
      type: String,
    },
    starCount: {
      type: Number,
      min: 1,
      max: 5,
    },
    description: {
      type: String,
    },
    reviewSource: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
