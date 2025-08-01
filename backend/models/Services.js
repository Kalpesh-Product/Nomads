import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema(
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
    hotDesk: {
      type: Number,
      default: 0,
    },
    dedicatedDesk: {
      type: Number,
      default: 0,
    },
    privateCabin: {
      type: Number,
      default: 0,
    },
    meetingRoom: {
      type: Number,
      default: 0,
    },
    conferenceRoom: {
      type: Number,
      default: 0,
    },
    openDeskArea: {
      type: Number,
      default: 0,
    },
    executiveSuite: {
      type: Number,
      default: 0,
    },
    virtualOffice: {
      type: Number,
      default: 0,
    },
    eventSpace: {
      type: Number,
      default: 0,
    },
    phoneBooth: {
      type: Number,
      default: 0,
    },
    loungeArea: {
      type: Number,
      default: 0,
    },
    outdoorWorkspace: {
      type: Number,
      default: 0,
    },
    dayPass: {
      type: Number,
      default: 0,
    },
    focusZone: {
      type: Number,
      default: 0,
    },
    auditorium: {
      type: Number,
      default: 0,
    },
    trainingRoom: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Services = mongoose.model("Service", servicesSchema);
export default Services;
