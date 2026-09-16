import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  businessId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  companyTitle: {
    type: String,
    required: true,
    trim: true,
  },
  companyId: {
    type: String,
    required: true,
    trim: true,
  },
  registeredEntityName: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  websiteTemplateLink: {
    type: String,
    trim: true,
  },
  logo: {
    type: { url: String, id: String },
  },
  images: {
    type: [{ url: String, id: String, index: Number }],
  },
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  continent: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    trim: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  googleMap: {
    type: String,
    trim: true,
  },
  ratings: {
    type: Number,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  totalSeats: {
    type: Number,
  },
  inclusions: {
    type: String,
  },
  units: {
    type: String,
  },
  services: {
    type: String,
  },
  cost: {
    type: String,
  },
  description: {
    type: String,
  },
  productName: {
    type: String,
  },
  companyType: {
    type: String,
    enum: [
      "coworking",
      "coliving",
      "workation",
      "meetingroom",
      "privatestay",
      "hostel",
      "cafe",
    ],
    required: true,
  },
  //To List the company product regardless of registration
  isActive: {
    type: Boolean,
    default: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  //POC Details can be rendered only if company is registered
  isRegistered: {
    type: Boolean,
    default: false,
  },
  // Soft delete — a host can remove their own listing (only while it's
  // isActive:false) without permanently destroying it. Deleting always
  // forces isActive/isPublic false too, so it drops off every visibility
  // query immediately; recovering it restores the record but leaves those
  // two flags off, so it goes back through review rather than reappearing
  // live.
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: String,
    trim: true,
  },
  // Host-initiated ask for staff to restore a deleted listing. Recovery
  // itself (clearing isDeleted) is a separate staff action gated on this
  // being true — a deleted listing with no request just sits deleted.
  recoveryRequested: {
    type: Boolean,
    default: false,
  },
  recoveryRequestedAt: {
    type: Date,
  },
}, { timestamps: true });

companySchema.index({ companyType: 1 });
companySchema.index({ companyId: 1 });

const Company = mongoose.model("Company", companySchema);
export default Company;
