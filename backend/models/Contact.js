import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
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
  partnership: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
