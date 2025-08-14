import mongoose from "mongoose";

const meetingRoomSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    registeredEntityName: {
      type: String,
    },
    website: {
      type: String,
    },
    logo: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    about: {
      type: String,
    },
    totalSeats: {
      type: Number,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    googleMap: {
      type: String,
    },
    ratings: {
      type: Number,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const MeetingRoom = mongoose.model("MeetingRoom", meetingRoomSchema);
export default MeetingRoom;
