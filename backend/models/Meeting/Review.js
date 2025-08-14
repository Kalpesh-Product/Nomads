import mongoose from "mongoose";

const meetingReviewSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MeetingRoom",
    },
    name: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    reviewText: {
      type: String,
    },
    platform: {
      type: String,
      required: true,
    },
    reviewLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const MeetingReview = mongoose.model("MeetingReview", meetingReviewSchema);
export default MeetingReview;
