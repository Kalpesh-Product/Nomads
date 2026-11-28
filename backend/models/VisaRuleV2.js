import mongoose from "mongoose";

const visaRuleV2Schema = new mongoose.Schema(
  {
    passport: { type: String, required: true, trim: true },
    normalizedPassport: { type: String, trim: true, default: "" },
    destination: { type: String, required: true, trim: true },
    normalizedDestination: { type: String, trim: true, default: "" },
    requirement: {
      type: String,
      trim: true,
      default: "",
      enum: [
        "",
        "visa free",
        "visa on arrival",
        "e-visa",
        "physical visa",
        "eta",
        "no admission",
      ],
    },
    durationDays: { type: Number, default: null, min: 0 },
  },
  { timestamps: true },
);

visaRuleV2Schema.index({ passport: 1, destination: 1 }, { unique: true });
visaRuleV2Schema.index({ normalizedPassport: 1, normalizedDestination: 1 });
visaRuleV2Schema.index({ normalizedPassport: 1, requirement: 1 });
visaRuleV2Schema.index({ passport: 1, requirement: 1 });
visaRuleV2Schema.index({ destination: 1 });

const VisaRuleV2 = mongoose.model("VisaRuleV2", visaRuleV2Schema, "visarulesv2");

export default VisaRuleV2;
