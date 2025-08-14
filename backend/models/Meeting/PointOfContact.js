import mongoose from "mongoose";

const meetingPocSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MeetingRoom",
    },
    name: {
      type: String,
      required: true,
    },
    pocImage: {
      type: String,
    },
    pocDesignation: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
    },
    linkedInProfile: {
      type: String,
    },
    languages: [
      {
        type: String,
      },
    ],
    address: {
      type: String,
    },
    availabilityTime: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const MeetingPoc = mongoose.model("MeetingPoc", meetingPocSchema);
export default MeetingPoc;
