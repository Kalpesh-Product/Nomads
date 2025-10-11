import mongoose from "mongoose";
import NomadUser from "../models/NomadUser.js";

export const getUsers = async (req, res, next) => {
  try {
    const { userId } = req.query;
    let query = {};

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          message: "Invalid Id provided",
        });
      }
      query._id = userId;
    }

    const users = await NomadUser.find(query).populate([
      { path: "saves", select: "-images" },
      { path: "likes", select: "-images" },
    ]);

    if (!users || !users.length) {
      return res.status(400).json({
        message: "No users found",
      });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error("[getUsers] error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const saveListings = async (req, res, next) => {
  try {
    const { listingId, userId } = req.body;

    if (!listingId || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Correct $push syntax
    const updatedUser = await NomadUser.findByIdAndUpdate(
      userId,
      { $push: { saves: listingId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "Failed to save listing" });
    }

    return res
      .status(200)
      .json({ message: "Saved successfully", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const likeListings = async (req, res, next) => {
  try {
    const { listingId, userId } = req.body;

    if (!listingId || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Correct $push syntax
    const updatedUser = await NomadUser.findByIdAndUpdate(
      userId,
      { $push: { likes: listingId } },
      { new: true } // returns updated document
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "Failed to save listing" });
    }

    return res.status(200).json({ message: "You liked the listing" });
  } catch (error) {
    next(error);
  }
};
