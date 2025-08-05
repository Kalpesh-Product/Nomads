import mongoose from "mongoose";

const hostelInclusionsSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },
    amenities: {
      reception24x7: { type: Boolean, default: false },
      bar: { type: Boolean, default: false },
      cafeRestaurant: { type: Boolean, default: false },
      lounge: { type: Boolean, default: false },
      cctv: { type: Boolean, default: false },
      housekeeping: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      inHouseActivities: { type: Boolean, default: false },
      security24x7: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
      breakfastInRoom: { type: Boolean, default: false },
      carRental: { type: Boolean, default: false },
      gameRoom: { type: Boolean, default: false },
      garden: { type: Boolean, default: false },
      laundryService: { type: Boolean, default: false },
      liveMusic: { type: Boolean, default: false },
      outdoorActivities: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      poolTable: { type: Boolean, default: false },
      poolTowels: { type: Boolean, default: false },
      powerBackup: { type: Boolean, default: false },
      roomService: { type: Boolean, default: false },
      sunDeck: { type: Boolean, default: false },
      swimmingPool: { type: Boolean, default: false },
      terrace: { type: Boolean, default: false },
      washingMachine: { type: Boolean, default: false },
      linen: { type: Boolean, default: false },
      towel: { type: Boolean, default: false },
      tv: { type: Boolean, default: false },
      privateBathroom: { type: Boolean, default: false },
      hairDryer: { type: Boolean, default: false },
      patio: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      workstation: { type: Boolean, default: false },
      waterDispenser: { type: Boolean, default: false },
      kettle: { type: Boolean, default: false },
      workDesk: { type: Boolean, default: false },
      luggageStorage: { type: Boolean, default: false },
      refrigerator: { type: Boolean, default: false },
      privateLocker: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const HostelInclusions = mongoose.model(
  "HostelInclusions",
  hostelInclusionsSchema
);

export default HostelInclusions;
