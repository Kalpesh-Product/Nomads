import mongoose from "mongoose";

const stateWiseWeightV2Schema = new mongoose.Schema(
  {
    continent: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },

    rank: {
      type: Number,
      required: true,
    },

    images: {
      type: Map,
      of: new mongoose.Schema(
        {
          url: { type: String, required: true },
          s3Key: { type: String, required: false },
        },
        { _id: false },
      ),
      default: {},
      validate: {
        validator: function (value) {
          if (!value) return true;
          return value.size <= 5;
        },
        message: "A maximum of 5 images is allowed.",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Algo 2.0: only the 24 normalized metrics (1.0-10.0) are stored.
    // All 33 attribute labels are derived at runtime via getLabelForScore().
    weight: {
      costOfLiving: { type: Number, default: 0, required: true },
      internet: { type: Number, default: 0, required: true },
      safety: { type: Number, default: 0, required: true },
      nomadCommunity: { type: Number, default: 0, required: true },
      workInfrastructure: { type: Number, default: 0, required: true },
      airQualityIndex: { type: Number, default: 0, required: true },
      startupEcosystem: { type: Number, default: 0, required: true },
      healthcareCostIndex: { type: Number, default: 0, required: true },
      purchasingPower: { type: Number, default: 0, required: true },
      inflationStability: { type: Number, default: 0, required: true },
      meetupsEvents: { type: Number, default: 0, required: true },
      incubators: { type: Number, default: 0, required: true },
      climateEnvironment: { type: Number, default: 0, required: true },
      lowerTaxes: { type: Number, default: 0, required: true },
      natureNomadTravelling: { type: Number, default: 0, required: true },
      yoga: { type: Number, default: 0, required: true },
      ventureCapitalPresence: { type: Number, default: 0, required: true },
      ventureCapitalInvestments: { type: Number, default: 0, required: true },
      visaOpenness: { type: Number, default: 0, required: true },
      healthcareQuality: { type: Number, default: 0, required: true },
      flightConnectivity: { type: Number, default: 0, required: true },
      remoteJobs: { type: Number, default: 0, required: true },
      techTalentDensity: { type: Number, default: 0, required: true },
      conferencesEvents: { type: Number, default: 0, required: true },
    },
  },
  { timestamps: true },
);

stateWiseWeightV2Schema.index({ continent: 1, country: 1, isActive: 1 });
stateWiseWeightV2Schema.index({ country: 1, state: 1 }, { unique: true });

export default mongoose.model(
  "StateWiseWeightV2",
  stateWiseWeightV2Schema,
  "statewiseweightsv2",
);
