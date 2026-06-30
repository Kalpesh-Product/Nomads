import mongoose from "mongoose";
import Place from "../models/Place.js";
import PlaceReview from "../models/PlaceReview.js";
import StateWiseWeight from "../models/StateWiseWeight.js";

const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllPlaceReviews = async (req, res, next) => {
  try {
    const reviews = await PlaceReview.find({})
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

export const getApprovedPlaceReviews = async (req, res, next) => {
  try {
    const { placeId } = req.query;

    if (!placeId || !mongoose.isValidObjectId(placeId)) {
      return res
        .status(400)
        .json({ message: "Valid place identifier is required" });
    }

    const reviews = await PlaceReview.find({
      status: "approved",
      $or: [{ place: placeId }, { placeId }],
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

export const getPlaceReviewsByUser = async (req, res, next) => {
  try {
    const reviews = await PlaceReview.find({ reviewer: req.userData._id })
      .populate(
        "place",
        "placeName mainImage destination address category rating",
      )
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

export const addPlaceReview = async (req, res, next) => {
  try {
    const { placeId, name, starCount, description } = req.body;

    if (!placeId || !mongoose.isValidObjectId(placeId)) {
      return res
        .status(400)
        .json({ message: "Valid place identifier is required" });
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

    const place = await Place.findById(placeId)
      .select("_id placeName destination")
      .lean();
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    const destinationMetadata = place.destination
      ? await StateWiseWeight.findOne({
          state: {
            $regex: new RegExp(`^${escapeRegExp(place.destination)}$`, "i"),
          },
        })
          .select("continent country state")
          .lean()
      : null;

    const reviewerName = name.trim();

    const existingReview = await PlaceReview.findOne({
      place: place._id,
      reviewer: req.userData._id,
    }).lean();

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You can add a review for the same place only once" });
    }

    const review = await PlaceReview.create({
      place: place._id,
      placeId: place._id.toString(),
      placeName: place.placeName || "",
      name: reviewerName,
      reviewerName,
      continent: destinationMetadata?.continent || "",
      country: destinationMetadata?.country || "",
      state: destinationMetadata?.state || place.destination || "",
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
        .json({ message: "You can add a review for the same place only once" });
    }

    next(error);
  }
};

export const updatePlaceReviewStatus = async (req, res, next) => {
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

    const review = await PlaceReview.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true, runValidators: true },
    );

    if (!review) {
      return res.status(404).json({ message: "Place review not found" });
    }

    return res.status(200).json({
      message: `Place review status updated to ${status}`,
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlaceReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { starCount, description } = req.body;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ message: "Valid review identifier is required" });
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

    if (!description?.trim()) {
      return res
        .status(400)
        .json({ message: "Review details are required" });
    }

    const review = await PlaceReview.findOneAndUpdate(
      { _id: reviewId, reviewer: req.userData._id },
      {
        starCount: parsedStarCount,
        description: description.trim(),
        status: "pending",
      },
      { new: true, runValidators: true },
    );

    if (!review) {
      return res.status(404).json({ message: "Place review not found" });
    }

    return res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};
