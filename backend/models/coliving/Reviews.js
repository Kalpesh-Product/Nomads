import mongoose from "mongoose";

const businessReviewSchema = new mongoose.Schema(
  {
    colivingCompany: { type: mongoose.Schema.Types.ObjectId, ref: "CoLiving" },
    name: { type: String, required: true },
    starCount: { type: Number, required: true, min: 1, max: 5 },
    description: { type: String, required: true },
    reviewSource: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const ColivingReviews = mongoose.model("ColivingReview", businessReviewSchema);
export default ColivingReviews;
