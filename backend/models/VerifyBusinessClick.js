import mongoose from "mongoose";

// One row per "Verify Business" click on a wono.co listing page. The click id
// travels to the host signup (?vc=<id>) so the signup can be pre-filled with
// that listing's company, and is stored on the resulting HostUser so staff see
// where the lead came from and can link the listings on invite.
const verifyBusinessClickSchema = new mongoose.Schema(
  {
    // Canonical values, read from our own Company collection — never from the
    // client — so a click can't be used to inject an arbitrary company.
    companyId: { type: String, required: true, trim: true, index: true },
    businessId: { type: String, trim: true, default: "" },
    companyName: { type: String, required: true, trim: true },
    companyType: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },

    // Anonymous browser id kept in localStorage, so repeat clicks by the same
    // visitor can be de-duplicated and counted.
    visitorId: { type: String, trim: true, default: "", index: true },
    nomadUser: { type: mongoose.Schema.Types.ObjectId, ref: "NomadUser", default: null },
    listingUrl: { type: String, trim: true, default: "" },
    referrer: { type: String, trim: true, default: "" },
    userAgent: { type: String, trim: true, default: "" },

    // Filled in when the click ends in a submitted host signup.
    hostUser: { type: mongoose.Schema.Types.ObjectId, ref: "HostUser", default: null },
    signedUpAt: { type: Date, default: null },
  },
  { timestamps: true },
);

verifyBusinessClickSchema.index({ visitorId: 1, businessId: 1, createdAt: -1 });

const VerifyBusinessClick =
  mongoose.models.VerifyBusinessClick ||
  mongoose.model("VerifyBusinessClick", verifyBusinessClickSchema);

export default VerifyBusinessClick;
