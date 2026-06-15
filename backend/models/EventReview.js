import mongoose from "mongoose";

const eventReviewSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    eventId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
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

eventReviewSchema.index({ event: 1, reviewer: 1 }, { unique: true });

const EventReview = mongoose.model(
  "EventReview",
  eventReviewSchema,
  "eventReviews",
);

export default EventReview;
