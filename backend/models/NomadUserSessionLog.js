import mongoose from "mongoose";

const nomadUserSessionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NomadUser",
      required: true,
      index: true,
    },
    event: { type: String, enum: ["login", "logout"], required: true },
  },
  { timestamps: true },
);

nomadUserSessionLogSchema.index({ userId: 1, createdAt: -1 });

const NomadUserSessionLog =
  mongoose.models.NomadUserSessionLog ||
  mongoose.model("NomadUserSessionLog", nomadUserSessionLogSchema);

export default NomadUserSessionLog;
