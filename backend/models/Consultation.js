import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    minlength: 2,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
    minlength: 2,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  mobile: {
    type: String,
    minlength: 7,
    maxlength: 20,
    match: [/^\+?[0-9]+$/, "Invalid mobile number format"],
  },
  reason: {
    type: String,
    required: true,
  },
});

const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;
