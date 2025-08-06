import mongoose from "mongoose";

const hostelReviewSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    reviewLink: {
      type: String,
    },
  },
  { timestamps: true }
);

const HostelReviews = mongoose.model("HostelReview", hostelReviewSchema);
export default HostelReviews;
