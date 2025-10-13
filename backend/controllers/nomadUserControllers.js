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
      { path: "saves", select: "" },
      { path: "likes", select: "" },
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

// export const saveListings = async (req, res, next) => {
//   try {
//     const { listingId, userId } = req.body;

//     if (!listingId || !userId) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Correct $push syntax
//     const updatedUser = await NomadUser.findByIdAndUpdate(
//       userId,
//       { $push: { saves: listingId } },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(400).json({ message: "Failed to save listing" });
//     }

//     return res
//       .status(200)
//       .json({ message: "Saved successfully", user: updatedUser });
//   } catch (error) {
//     next(error);
//   }
// };

export const saveListings = async (req, res, next) => {
  try {
    const { listingId, userId, isSaved } = req.body;

    if (!listingId || !userId || typeof isSaved !== "boolean") {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    let updatedUser;

    if (isSaved) {
      // Add to likes
      updatedUser = await NomadUser.findByIdAndUpdate(
        userId,
        { $addToSet: { saves: listingId } },
        { new: true }
      );
    } else {
      // Remove from likes
      updatedUser = await NomadUser.findByIdAndUpdate(
        userId,
        { $pull: { saves: listingId } },
        { new: true }
      );
    }

    if (!updatedUser) {
      return res.status(400).json({ message: "Failed to update saves" });
    }

    return res.status(200).json({
      message: isSaved ? "You saved" : "You unsaved",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSaves = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const user = await NomadUser.findById(userId)
      .populate({ path: "saves" })
      .lean();

    if (!user || !user.saves?.length) {
      return res.status(200).json([]);
    }

    return res.status(200).json(user.saves);
  } catch (error) {
    console.error("[getLikes] error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSaves = async (req, res) => {
  try {
    const users = await NomadUser.find().populate({ path: "saves" }).lean();

    if (!users || users.length === 0) {
      return res.status(200).json([]);
    }

    const allSaves = users.flatMap((user) => user.saves || []);

    return res.status(200).json(allSaves);
  } catch (error) {
    console.error("[getSaves] error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserLikes = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const user = await NomadUser.findById(userId)
      .populate({ path: "likes" })
      .lean();

    if (!user || !user.likes?.length) {
      return res.status(200).json([]);
    }

    // ✅ Return a flat array of liked companies
    return res.status(200).json(user.likes);
  } catch (error) {
    console.error("[getLikes] error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getLikes = async (req, res) => {
  try {
    const users = await NomadUser.find().populate({ path: "likes" }).lean();

    if (!users || users.length === 0) {
      return res.status(200).json([]);
    }

    const allLikes = users.flatMap((user) => user.likes || []);

    return res.status(200).json(allLikes);
  } catch (error) {
    console.error("[getLikes] error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const likeListings = async (req, res, next) => {
  try {
    const { listingId, userId, isLiked } = req.body;

    if (!listingId || !userId || typeof isLiked !== "boolean") {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    let updatedUser;

    if (isLiked) {
      // Add to likes
      updatedUser = await NomadUser.findByIdAndUpdate(
        userId,
        { $addToSet: { likes: listingId } },
        { new: true }
      );
    } else {
      // Remove from likes
      updatedUser = await NomadUser.findByIdAndUpdate(
        userId,
        { $pull: { likes: listingId } },
        { new: true }
      );
    }

    if (!updatedUser) {
      return res.status(400).json({ message: "Failed to update likes" });
    }

    return res.status(200).json({
      message: isLiked ? "You liked" : "You unliked",
      likes: updatedUser.likes,
    });
  } catch (error) {
    next(error);
  }
};
