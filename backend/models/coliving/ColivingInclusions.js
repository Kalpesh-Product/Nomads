import mongoose from "mongoose";

const businessInclusionSchema = new mongoose.Schema(
  {
    colivingCompany: { type: mongoose.Schema.Types.ObjectId, ref: "CoLiving" },
    electricity: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    water: { type: Boolean, default: false },
    cleaning: { type: Boolean, default: false },
    washingMachine: { type: Boolean, default: false },
    fridge: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    attachedBathroom: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    cots: { type: Boolean, default: false },
    cupboard: { type: Boolean, default: false },
    geyser: { type: Boolean, default: false },
    pillow: { type: Boolean, default: false },
    sideTable: { type: Boolean, default: false },
    softFurnishing: { type: Boolean, default: false },
    tv: { type: Boolean, default: false },
    mattress5Inch: { type: Boolean, default: false },
    shoeRack: { type: Boolean, default: false },
    dth: { type: Boolean, default: false },
    bedTypeQueen5x6: { type: Boolean, default: false },
    mattressQueen8Inch: { type: Boolean, default: false },
    cctv: { type: Boolean, default: false },
    lift: { type: Boolean, default: false },
    ro: { type: Boolean, default: false },
    workdesk: { type: Boolean, default: false },
    bedLinenAndTowels: { type: Boolean, default: false },
    hotWater24Hours: { type: Boolean, default: false },
    electronicLock: { type: Boolean, default: false },
    coworkingSpace: { type: Boolean, default: false },
    lounge: { type: Boolean, default: false },
    swimmingPool: { type: Boolean, default: false },
    yogaZone: { type: Boolean, default: false },
    frontDesk: { type: Boolean, default: false },
    sharedWashroom: { type: Boolean, default: false },
    lockers: { type: Boolean, default: false },
    homeTheatre: { type: Boolean, default: false },
    indoorGames: { type: Boolean, default: false },
    luggageRoom: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const ColivingInclusions = mongoose.model(
  "BusinessInclusion",
  businessInclusionSchema
);

export default ColivingInclusions;
