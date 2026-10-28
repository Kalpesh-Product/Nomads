import mongoose from "mongoose";
import NomadUser from "../models/NomadUser.js";
import Blog from "../models/Blog.js";
import News from "../models/News.js";
import Place from "../models/Place.js";
import Event from "../models/Event.js";

const contentTypes = {
  blog: { field: "favoriteBlogs", model: Blog },
  news: { field: "favoriteNews", model: News },
  place: { field: "favoritePlaces", model: Place },
  event: { field: "favoriteEvents", model: Event },
};
const publishedContent = {
  isDraft: { $ne: true },
  isActive: { $ne: false },
  $or: [{ status: "approved" }, { status: { $exists: false } }],
};

export const getContentFavorites = async (req, res, next) => {
  try {
    const userId = req.userData?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await NomadUser.findById(userId)
      .select(Object.values(contentTypes).map(({ field }) => field).join(" "))
      .populate(Object.values(contentTypes).map(({ field }) => ({
        path: field,
        match: publishedContent,
      })))
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(Object.entries(contentTypes).flatMap(([kind, { field }]) =>
      (user[field] || []).filter(Boolean).map((item) => ({ kind, item })),
    ));
  } catch (error) {
    next(error);
  }
};

export const updateContentFavorite = async (req, res, next) => {
  try {
    const userId = req.userData?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { kind, contentId, isFavorited } = req.body;
    const config = Object.hasOwn(contentTypes, kind) ? contentTypes[kind] : null;
    if (!config || !mongoose.isObjectIdOrHexString(contentId) || typeof isFavorited !== "boolean") {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }
    if (isFavorited && !await config.model.exists({ _id: contentId, ...publishedContent })) {
      return res.status(404).json({ message: "Content not found" });
    }
    const user = await NomadUser.findByIdAndUpdate(userId, {
      [isFavorited ? "$addToSet" : "$pull"]: { [config.field]: contentId },
    }, { new: true }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ kind, contentId, isFavorited });
  } catch (error) {
    next(error);
  }
};
