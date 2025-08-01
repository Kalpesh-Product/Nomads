import mongoose from "mongoose";

const inclusionsSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    airCondition: Boolean,
    fastInternet: Boolean,
    secure: Boolean,
    receptionist: Boolean,
    cafeDining: Boolean,
    generator: Boolean,
    teaCoffee: Boolean,
    assist: Boolean,
    housekeeping: Boolean,
    itSupport: Boolean,
    workspace: Boolean,
    meetingRooms: Boolean,
    trainingRooms: Boolean,
    television: Boolean,
    maintenance: Boolean,
    onDemand: Boolean,
    community: Boolean,
    pickupDrop: Boolean,
    transportOptions: {
      car: Boolean,
      bike: Boolean,
      bus: Boolean,
    },
    personalised: Boolean,
    gamingZone: Boolean,
    furnishedOffice: Boolean,
    freeCoffee: Boolean,
    stationery: Boolean,
    library: Boolean,
    parking: Boolean,
    ergonomicEnvironment: Boolean,
    privateStorage: Boolean,
    freeLoungeAccess: Boolean,
    dailyCleaning: Boolean,
    officeSupplies: Boolean,
    printingServices: Boolean,
    access24x7: Boolean,
    deepWorkZones: Boolean,
    closeToNature: Boolean,
    backupNetworks: Boolean,
    signBoard: Boolean,
  },
  {
    timestamps: true,
  }
);

const Inclusions = mongoose.model("Inclusions", inclusionsSchema);
export default Inclusions;
