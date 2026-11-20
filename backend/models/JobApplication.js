import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    jobPosition: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    dob: { type: String, trim: true, default: "" },
    mobile: { type: String, trim: true, required: true },
    location: { type: String, trim: true, required: true },
    experienceYears: { type: Number, default: 0 },
    linkedin: { type: String, trim: true, default: "" },
    currentMonthlySalary: { type: Number, default: null },
    expectedMonthlySalary: { type: Number, default: null },
    joinInDays: { type: String, trim: true, default: "" },
    relocateGoa: { type: String, trim: true, default: "" },
    personality: { type: String, trim: true, default: "" },
    skills: { type: String, trim: true, default: "" },
    whyConsider: { type: String, trim: true, default: "" },
    willingToBootstrap: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },
    resumeLink: { type: String, trim: true, required: true }, // S3 link
    remarks: { type: String, trim: true, default: "" },
    submissionDate: { type: String, trim: true, default: "" },
    submissionTime: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Shortlisted", "Rejected"],
      default: "Pending",
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "jobApplications" },
);

export default mongoose.model("JobApplication", jobApplicationSchema);
