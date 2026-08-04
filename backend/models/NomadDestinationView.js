import mongoose from "mongoose";

const nomadDestinationViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NomadUser",
      required: true,
      index: true,
    },
    continent: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    // The app's destination taxonomy is continent -> country -> state, where
    // "state" is the specific place shown to users (e.g. "Bali") — there is
    // no separate city level in this data model.
    state: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
  },
  { timestamps: true },
);

nomadDestinationViewSchema.index({ userId: 1, createdAt: -1 });

const NomadDestinationView =
  mongoose.models.NomadDestinationView ||
  mongoose.model("NomadDestinationView", nomadDestinationViewSchema);

export default NomadDestinationView;
