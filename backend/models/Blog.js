import mongoose from "mongoose";
const blogSchema = new mongoose.Schema({
    mainTitle: {
        type: String,
        required: true,
    },
    mainImage: {
        type: String,
    },
    mainContent: {
        type: String,
    },
    author: {
        type: String,
    },
    date: {
        type: Date,
    },
    destination: {
        type: String,
    },
    blogType: {
        type: String,
    },
    link: {
        type: String,
    },
    source: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "approved",
    },
    rejectionReason: {
        type: String,
        trim: true,
        default: "",
        maxlength: 500,
    },
    deletionReason: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
    },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: "", trim: true },
    reviewedById: { type: String, default: "", trim: true },
    lastEditedAt: { type: Date, default: null },
    moderationHistory: [{
        _id: false,
        status: { type: String, enum: ["pending", "approved", "rejected"], required: true },
        date: { type: Date, required: true },
        reason: { type: String, default: "", maxlength: 500 },
        actor: { type: String, default: "Master Panel" },
        actorId: { type: String, default: "", trim: true },
    }],
    deletedAt: {
        type: Date,
        default: null,
    },
    contributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NomadUser",
    },
    isDraft: {
        type: Boolean,
        default: false,
    },
    sections: [
        {
            title: String,
            content: String,
            image: String,
        },
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
