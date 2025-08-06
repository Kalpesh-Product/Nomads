import mongoose from "mongoose";

const cafeInclusionsSchema = new mongoose.Schema(
  {
    cafe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
    },
    airCondition: {
      type: Boolean,
      default: false,
    },
    wifi: {
      type: Boolean,
      default: false,
    },
    secure: {
      type: Boolean,
      default: false,
    },
    community: {
      type: Boolean,
      default: false,
    },
    gamingZone: {
      type: Boolean,
      default: false,
    },
    furnishedOffice: {
      type: Boolean,
      default: false,
    },
    stationery: {
      type: Boolean,
      default: false,
    },
    library: {
      type: Boolean,
      default: false,
    },
    parking: {
      type: Boolean,
      default: false,
    },
    privateStorage: {
      type: Boolean,
      default: false,
    },
    freeLoungeAccess: {
      type: Boolean,
      default: false,
    },
    dailyCleaning: {
      type: Boolean,
      default: false,
    },
    waterfront: {
      type: Boolean,
      default: false,
    },
    tv: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const CafeInclusions = mongoose.model("CafeInclusion", cafeInclusionsSchema);
export default CafeInclusions;
