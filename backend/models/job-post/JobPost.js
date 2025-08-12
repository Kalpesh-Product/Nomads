import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "jobcategory",
  },
  title: {
    type: String,
  },
  about: {
    type: String,
    required: true,
  },
  responsibilities: [
    {
      type: String,
    },
  ],
  qualifications: [
    {
      type: String,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const JobPost = mongoose.model("jobpost", jobPostSchema);
export default JobPost;
