import { Readable } from "stream";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import RestaurantReview from "../models/RestaurantReview.js";

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

const normalizeRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/\uFEFF/g, "").trim(),
      normalizeString(value),
    ]),
  );

const parseRating = (value) => {
  const parsed = Number(String(value || "").trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};

const readCsvRows = (file) =>
  new Promise((resolve, reject) => {
    const rows = [];

    Readable.from(file.buffer.toString("utf-8").trim())
      .pipe(csvParser())
      .on("data", (rawRow) => {
        const row = normalizeRow(rawRow);
        const hasAnyValue = Object.values(row).some(
          (value) => value !== undefined && value !== null && value !== "",
        );

        if (hasAnyValue) rows.push(row);
      })
      .on("end", () => resolve(rows))
      .on("error", reject);
  });

export const bulkInsertRestaurantReviews = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const restaurants = await Restaurant.find()
      .select("businessId restaurantId businessName")
      .lean();
    const restaurantMap = new Map(
      restaurants.map((restaurant) => [restaurant.businessId?.trim(), restaurant]),
    );

    const existingReviews = await RestaurantReview.find()
      .select("name businessId")
      .lean();
    const existingReviewSet = new Set(
      existingReviews.map(
        (review) =>
          `${review.name?.trim().toLowerCase()}|${review.businessId?.trim()}`,
      ),
    );

    const rows = await readCsvRows(req.file);
    const reviews = [];
    const seenInCSV = new Set();
    const duplicateExistingLogs = [];
    const duplicateCSVLogs = [];
    const missingRestaurantRows = [];

    for (const row of rows) {
      const businessId = row["Business ID"]?.trim();
      const reviewerName = row["Reviewer Name"]?.trim();
      const restaurant = restaurantMap.get(businessId);

      if (!restaurant) {
        missingRestaurantRows.push({
          businessId,
          reviewerName,
          reason: "Invalid Business ID - Restaurant not found",
        });
        continue;
      }

      if (!reviewerName) continue;

      const reviewKey = `${reviewerName.toLowerCase()}|${businessId}`;

      if (existingReviewSet.has(reviewKey)) {
        duplicateExistingLogs.push({
          reviewerName,
          businessId,
          businessName: restaurant.businessName,
          reason: "Already exists in database",
        });
        continue;
      }

      if (seenInCSV.has(reviewKey)) {
        duplicateCSVLogs.push({
          reviewerName,
          businessId,
          businessName: restaurant.businessName,
          reason: "Duplicate within CSV",
        });
        continue;
      }

      seenInCSV.add(reviewKey);
      reviews.push({
        restaurant: restaurant._id,
        restaurantId: restaurant.restaurantId,
        businessId,
        businessName: row["Business Name"] || restaurant.businessName,
        name: reviewerName,
        starCount: parseRating(row["Rating"]),
        description: row["Review Text"] || "",
        reviewSource: row["Platform"] || "",
        reviewLink: row["Review Link"] || "",
        status: "approved",
      });
    }

    if (reviews.length === 0) {
      return res.status(400).json({
        message: "No valid restaurant review data found in CSV.",
        skippedExisting: duplicateExistingLogs.length,
        duplicateExistingLogs,
        skippedDuplicateInCSV: duplicateCSVLogs.length,
        duplicateCSVLogs,
        missingRestaurantCount: missingRestaurantRows.length,
        missingRestaurantRows,
      });
    }

    const result = await RestaurantReview.insertMany(reviews, { ordered: false });

    return res.status(201).json({
      message: "Restaurant reviews uploaded successfully",
      total:
        reviews.length +
        duplicateExistingLogs.length +
        duplicateCSVLogs.length +
        missingRestaurantRows.length,
      inserted: result.length,
      skippedExisting: duplicateExistingLogs.length,
      duplicateExistingLogs,
      skippedDuplicateInCSV: duplicateCSVLogs.length,
      duplicateCSVLogs,
      missingRestaurantCount: missingRestaurantRows.length,
      missingRestaurantRows,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId, businessId, status } = req.query;
    const query = {};

    if (restaurantId) query.restaurantId = restaurantId;
    if (businessId) query.businessId = businessId;
    if (status) query.status = status;

    const reviews = await RestaurantReview.find(query)
      .populate("restaurant", "businessId restaurantName restaurantId city state country")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantReviewsByUser = async (req, res, next) => {
  try {
    const reviews = await RestaurantReview.find({ reviewer: req.userData._id })
      .populate(
        "restaurant",
        "restaurantName businessName mainImage images destination city state country restaurantType ratings",
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

export const addRestaurantReview = async (req, res, next) => {
  try {
    const {
      restaurantId,
      businessId,
      name,
      starCount,
      description,
      reviewSource,
      reviewLink,
    } = req.body || {};

    if (!restaurantId && !businessId) {
      return res
        .status(400)
        .json({ message: "Restaurant identifier is required" });
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

    const restaurantQuery =
      restaurantId && mongoose.isValidObjectId(restaurantId)
        ? { _id: restaurantId }
        : { businessId };

    const restaurant = await Restaurant.findOne(restaurantQuery)
      .select("_id restaurantId businessId businessName restaurantName")
      .lean();

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const existingReview = await RestaurantReview.findOne({
      restaurant: restaurant._id,
      reviewer: req.userData._id,
    }).lean();

    if (existingReview) {
      return res.status(400).json({
        message: "You can add a review for the same restaurant only once",
      });
    }

    const reviewerName = name.trim();
    const review = await RestaurantReview.create({
      restaurant: restaurant._id,
      restaurantId: restaurant.restaurantId || restaurant._id.toString(),
      businessId: restaurant.businessId,
      businessName: restaurant.businessName || restaurant.restaurantName || "",
      name: reviewerName,
      reviewerName,
      starCount: parsedStarCount,
      description: description.trim(),
      reviewSource: reviewSource?.trim() || "Nomads Website",
      reviewLink: reviewLink?.trim() || "",
      status: "pending",
      reviewer: req.userData._id,
    });

    return res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantReviewStatus = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body || {};
    const allowedStatuses = ["pending", "approved", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be pending, approved or rejected",
      });
    }

    const review = await RestaurantReview.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true, runValidators: true },
    );

    if (!review) {
      return res.status(404).json({ message: "Restaurant review not found" });
    }

    return res.status(200).json({
      message: `Restaurant review ${status} successfully`,
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { starCount, description } = req.body || {};

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

    const review = await RestaurantReview.findOneAndUpdate(
      { _id: reviewId, reviewer: req.userData._id },
      {
        starCount: parsedStarCount,
        description: description.trim(),
        status: "pending",
      },
      { new: true, runValidators: true },
    );

    if (!review) {
      return res.status(404).json({ message: "Restaurant review not found" });
    }

    return res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurantReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ message: "Valid review identifier is required" });
    }

    const review = await RestaurantReview.findOneAndDelete({
      _id: reviewId,
      reviewer: req.userData._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Restaurant review not found" });
    }

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
