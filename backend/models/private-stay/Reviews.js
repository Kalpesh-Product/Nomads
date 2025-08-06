import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    privateStay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrivateStay",
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

const PrivateStayReview = mongoose.model("PrivateStayReview", reviewSchema);
export default PrivateStayReview;
