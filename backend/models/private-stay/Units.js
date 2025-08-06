import mongoose from "mongoose";

const privateStayUnitSchema = new mongoose.Schema({
  privateStay: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrivateStay",
  },
  allUnits: [String],
});

const PrivateStayUnit = mongoose.model(
  "PrivateStayUnit",
  privateStayUnitSchema
);

export default PrivateStayUnit;
