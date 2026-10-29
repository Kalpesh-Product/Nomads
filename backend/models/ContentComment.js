import mongoose from "mongoose";

const fields = {
  kind: { type: String, enum: ["blog", "news"], required: true },
  articleId: { type: mongoose.Schema.Types.ObjectId, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "NomadUser", required: true },
  authorName: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
};

const commentSchema = new mongoose.Schema({
  ...fields,
  starCount: { type: Number, min: 1, max: 5, validate: Number.isInteger },
}, { timestamps: true });
commentSchema.index({ kind: 1, articleId: 1, createdAt: -1 });

const replySchema = new mongoose.Schema({
  ...fields,
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: "ContentComment", required: true },
}, { timestamps: true });
replySchema.index({ kind: 1, articleId: 1, commentId: 1, createdAt: 1 });

export const ContentComment = mongoose.model("ContentComment", commentSchema, "contentComments");
export const ContentReply = mongoose.model("ContentReply", replySchema, "contentReplies");
