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

const News = mongoose.model("News", blogSchema);
export default News;
