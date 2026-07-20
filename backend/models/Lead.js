import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    verticalType: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    noOfPeople: {
      type: Number,
      min: 1,
    },
    mobileNumber: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Invalid email address"],
    },
    startDate: {
      type: Date,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["nomad", "website"],
    },
    productType: {
      type: String,
      trim: true,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "End date must be greater than or equal to start date",
      },
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Contacted", "In Progress", "Converted", "Lost"],
    },
    isEscalated: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalatedWorkspaceId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    escalatedHostCompanyId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    escalatedBy: {
      type: String,
      trim: true,
      default: "",
    },
    // Website builder lead fields
    workspaceId: {
      type: String,
      trim: true,
    },
    packageName: {
      type: String,
      trim: true,
    },
    inquiryType: {
      type: String,
      trim: true,
    },
    searchKey: {
      type: String,
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    stayDuration: {
      type: String,
      trim: true,
    },
    timeSlot: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
