import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    workation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workation",
    },
    businessName: {
      type: String,
    },
    reviewerName: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewText: {
      type: String,
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

const PrivateStayReview = mongoose.model("WorkationReview", reviewSchema);
export default PrivateStayReview;
