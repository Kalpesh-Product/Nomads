import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema(
  {
    coworkingCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingCompany",
    },
    hotDesk: {
      type: Boolean,
      default: false,
    },
    dedicatedDesk: {
      type: Boolean,
      default: false,
    },
    privateCabin: {
      type: Boolean,
      default: false,
    },
    meetingRoom: {
      type: Boolean,
      default: false,
    },
    conferenceRoom: {
      type: Boolean,
      default: false,
    },
    openDeskArea: {
      type: Boolean,
      default: false,
    },
    executiveSuite: {
      type: Boolean,
      default: false,
    },
    virtualOffice: {
      type: Boolean,
      default: false,
    },
    eventSpace: {
      type: Boolean,
      default: false,
    },
    phoneBooth: {
      type: Boolean,
      default: false,
    },
    loungeArea: {
      type: Boolean,
      default: false,
    },
    outdoorWorkspace: {
      type: Boolean,
      default: false,
    },
    dayPass: {
      type: Boolean,
      default: false,
    },
    focusZone: {
      type: Boolean,
      default: false,
    },
    auditorium: {
      type: Boolean,
      default: false,
    },
    trainingRoom: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Services = mongoose.model("Service", servicesSchema);
export default Services;
