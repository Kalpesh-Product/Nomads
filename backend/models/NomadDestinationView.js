import mongoose from "mongoose";

const nomadDestinationViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NomadUser",
      index: true,
    },
    continent: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    // The app's destination taxonomy is continent -> country -> state, where
    // "state" is the specific place shown to users (e.g. "Bali") — there is
    // no separate city level in this data model.
    state: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    sourcePage: { type: String, trim: true },
    pagePath: { type: String, trim: true },
    referrer: { type: String, trim: true },
    sessionId: { type: String, trim: true, index: true },
    ipAddress: { type: String, trim: true },
  },
  { timestamps: true },
);

nomadDestinationViewSchema.index({ userId: 1, createdAt: -1 });
nomadDestinationViewSchema.index({ country: 1, state: 1, createdAt: -1 });
nomadDestinationViewSchema.index({ createdAt: -1 });

const NomadDestinationView =
  mongoose.models.NomadDestinationView ||
  mongoose.model("NomadDestinationView", nomadDestinationViewSchema);

export default NomadDestinationView;
