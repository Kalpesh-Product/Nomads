import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema(
  {
    privateStay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrivateStay",
    },
    swimmingPool: {
      type: Boolean,
      default: false,
    },
    kidsPool: {
      type: Boolean,
      default: false,
    },
    lift: {
      type: Boolean,
      default: false,
    },
    wifi: {
      type: Boolean,
      default: false,
    },
    lawn: {
      type: Boolean,
      default: false,
    },
    powerBackup: {
      type: Boolean,
      default: false,
    },
    airConditioning: {
      type: Boolean,
      default: false,
    },
    parking: {
      type: Boolean,
      default: false,
    },
    laundryService: {
      type: Boolean,
      default: false,
    },
    tv: {
      type: Boolean,
      default: false,
    },
    roomService: {
      type: Boolean,
      default: false,
    },
    refrigerator: {
      type: Boolean,
      default: false,
    },
    ironIroningBoard: {
      type: Boolean,
      default: false,
    },
    gym: {
      type: Boolean,
      default: false,
    },
    privateBathroom: {
      type: Boolean,
      default: false,
    },
    workdesk: {
      type: Boolean,
      default: false,
    },
    balcony: {
      type: Boolean,
      default: false,
    },
    kitchen: {
      type: Boolean,
      default: false,
    },
    security: {
      type: Boolean,
      default: false,
    },
    towelsAndLinen: {
      type: Boolean,
      default: false,
    },
    conferenceRoom: {
      type: Boolean,
      default: false,
    },
    spa: {
      type: Boolean,
      default: false,
    },
    kitchenette: {
      type: Boolean,
      default: false,
    },
    cctv: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PrivateStayInclusions = mongoose.model("PrivateStayInclusion", BusinessSchema);
export default PrivateStayInclusions;
