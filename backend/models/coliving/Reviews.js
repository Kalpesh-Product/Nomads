import mongoose from "mongoose";

const businessReviewSchema = new mongoose.Schema(
  {
    colivingCompany: { type: mongoose.Schema.Types.ObjectId, ref: "CoLiving" },
    name: { type: String },
    starCount: { type: Number, min: 1, max: 5 },
    description: { type: String },
    reviewSource: { type: String },
    reviewLink: { type: String },
  },
  {
    timestamps: true,
  }
);

const ColivingReviews = mongoose.model("ColivingReview", businessReviewSchema);
export default ColivingReviews;
