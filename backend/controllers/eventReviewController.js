import mongoose from "mongoose";
import Event from "../models/Event.js";
import EventReview from "../models/EventReview.js";

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

    const event = await Event.findById(eventId).select("_id").lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

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
      name: name.trim(),
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
