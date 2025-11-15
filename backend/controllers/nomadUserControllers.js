import mongoose from "mongoose";
import NomadUser from "../models/NomadUser.js";
import bcrypt from "bcrypt";

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

export const updateProfile = async (req, res) => {
  try {
    console.log("profile");
    const { userId } = req.params;
    const { firstName, lastName, country, state, mobile } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await NomadUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (country) user.country = country.trim();
    if (state) user.state = state.trim();
    if (mobile) user.mobile = mobile.trim();

    const updatedUser = await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        country: updatedUser.country,
        state: updatedUser.state,
        mobile: updatedUser.mobile,
      },
    });
  } catch (error) {
    console.error("[updateProfile] error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Current, new and confirm passwords are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New and confirm password doesn't match" });
    }

    const user = await NomadUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;
    user.refreshToken = "";
    await user.save();

    res.clearCookie("nomadCookie", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("[changePassword] error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

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
