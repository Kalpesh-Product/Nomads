import mongoose from "mongoose";
import Blog from "../models/Blog.js";
import News from "../models/News.js";
import NomadUser from "../models/NomadUser.js";
import { ContentComment, ContentReply } from "../models/ContentComment.js";

const publicFields = "authorName text createdAt commentId starCount";
const pageSize = 20;

export function createContentCommentController({
  Comment = ContentComment, Reply = ContentReply, User = NomadUser,
  articles = { blog: Blog, news: News },
} = {}) {
  const resolveArticle = async (req, res) => {
    const { kind, articleId } = req.params;
    if (!["blog", "news"].includes(kind) || !mongoose.isObjectIdOrHexString(articleId)) {
      res.status(400).json({ message: "Valid article type and identifier are required." });
      return null;
    }
    const article = await articles[kind].exists({
      _id: articleId, isDraft: { $ne: true }, isActive: { $ne: false },
      $or: [{ status: "approved" }, { status: { $exists: false } }],
    });
    if (!article) {
      res.status(404).json({ message: "Article not found." });
      return null;
    }
    return { kind, articleId };
  };

  return {
    list: async (req, res, next) => {
      try {
        const scope = await resolveArticle(req, res);
        if (!scope) return;
        const page = Number(req.query.page || 1);
        if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
          return res.status(400).json({ message: "Invalid comments page." });
        }
        const [comments, total, ratingSummary] = await Promise.all([
          Comment.find(scope).select(publicFields).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
          Comment.countDocuments(scope),
          Comment.aggregate([
            { $match: { kind: scope.kind, articleId: new mongoose.Types.ObjectId(scope.articleId), starCount: { $type: "number", $gte: 1, $lte: 5 } } },
            { $group: { _id: null, averageRating: { $avg: "$starCount" } } },
          ]),
        ]);
        const replies = comments.length
          ? await Reply.find({ ...scope, commentId: { $in: comments.map((comment) => comment._id) } }).select(publicFields).sort({ createdAt: 1, _id: 1 }).lean()
          : [];
        res.json({
          data: comments.map((comment) => ({ ...comment, replies: replies.filter((reply) => String(reply.commentId) === String(comment._id)) })),
          total, page, totalPages: Math.ceil(total / pageSize),
          averageRating: ratingSummary[0]?.averageRating ?? null,
        });
      } catch (error) { next(error); }
    },
    create: async (req, res, next) => {
      try {
        const scope = await resolveArticle(req, res);
        if (!scope) return;
        const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
        if (!text || text.length > 2000) {
          return res.status(400).json({ message: "Enter a comment between 1 and 2,000 characters." });
        }
        const { commentId } = req.params;
        const starCount = req.body?.starCount;
        if (!commentId && (!Number.isInteger(starCount) || starCount < 1 || starCount > 5)) {
          return res.status(400).json({ message: "Choose a star rating between 1 and 5." });
        }
        if (commentId && (!mongoose.isObjectIdOrHexString(commentId) || !await Comment.exists({ ...scope, _id: commentId }))) {
          return res.status(404).json({ message: "Comment not found for this article." });
        }
        const userId = req.userData?._id;
        if (!mongoose.isObjectIdOrHexString(userId)) {
          return res.status(401).json({ message: "Please log in to comment." });
        }
        const user = await User.findById(userId).select("fullName").lean();
        if (!user) return res.status(401).json({ message: "Please log in to comment." });
        const Model = commentId ? Reply : Comment;
        const entry = await Model.create({
          ...scope, ...(commentId ? { commentId } : { starCount }),
          author: userId, authorName: user.fullName, text,
        });
        res.status(201).json({ data: { _id: entry._id, authorName: entry.authorName, text: entry.text, starCount: entry.starCount, createdAt: entry.createdAt } });
      } catch (error) { next(error); }
    },
  };
}

export const contentCommentController = createContentCommentController();
