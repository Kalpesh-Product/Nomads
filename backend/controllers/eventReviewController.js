import mongoose from "mongoose";
import Event from "../models/Event.js";
import EventReview from "../models/EventReview.js";
import StateWiseWeight from "../models/StateWiseWeight.js";

const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllEventReviews = async (req, res, next) => {
  try {
    const reviews = await EventReview.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovedEventReviews = async (req, res, next) => {
  try {
    const { eventId } = req.query;

    if (!eventId || !mongoose.isValidObjectId(eventId)) {
      return res
        .status(400)
        .json({ message: "Valid event identifier is required" });
    }

    const reviews = await EventReview.find({
      status: "approved",
      $or: [{ event: eventId }, { eventId }],
    })
      .select("name starCount description createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventReviewsByUser = async (req, res, next) => {
  try {
    const reviews = await EventReview.find({ reviewer: req.userData._id })
      .populate("event", "eventName mainImage destination venue month category")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const addEventReview = async (req, res, next) => {
  try {
    const { eventId, name, starCount, description } = req.body;

    if (!eventId || !mongoose.isValidObjectId(eventId)) {
      return res
        .status(400)
        .json({ message: "Valid event identifier is required" });
    }

    const parsedStarCount = Number(starCount);
    if (
      Number.isNaN(parsedStarCount) ||
      parsedStarCount < 1 ||
      parsedStarCount > 5
    ) {
      return res
        .status(400)
        .json({ message: "Star count must be between 1 and 5" });
    }

    if (!name?.trim() || !description?.trim()) {
      return res
        .status(400)
        .json({ message: "Reviewer name and review details are required" });
    }

    const event = await Event.findById(eventId)
      .select("_id eventName destination")
      .lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const destinationMetadata = event.destination
      ? await StateWiseWeight.findOne({
          state: {
            $regex: new RegExp(`^${escapeRegExp(event.destination)}$`, "i"),
          },
        })
          .select("continent country state")
          .lean()
      : null;

    const reviewerName = name.trim();

    const existingReview = await EventReview.findOne({
      event: event._id,
      reviewer: req.userData._id,
    }).lean();

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You can add a review for the same event only once" });
    }

    const review = await EventReview.create({
      event: event._id,
      eventId: event._id.toString(),
      eventName: event.eventName || "",
      name: reviewerName,
      reviewerName,
      continent: destinationMetadata?.continent || "",
      country: destinationMetadata?.country || "",
      state: destinationMetadata?.state || event.destination || "",
      starCount: parsedStarCount,
      description: description.trim(),
      status: "pending",
      reviewer: req.userData._id,
    });

    return res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(400)
        .json({ message: "You can add a review for the same event only once" });
    }

    next(error);
  }
};

export const updateEventReviewStatus = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["pending", "approved", "rejected"];

    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ message: "Valid review identifier is required" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const review = await EventReview.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true, runValidators: true },
    );

    if (!review) {
      return res.status(404).json({ message: "Event review not found" });
    }

    return res.status(200).json({
      message: `Event review status updated to ${status}`,
      review,
    });
  } catch (error) {
    next(error);
  }
};
