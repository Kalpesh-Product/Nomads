import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    trim: true,
    required: true,
  },
  mobile: {
    type: String,
    minlength: 7,
    maxlength: 20,
    match: [/^\+?[0-9]+$/, "Invalid mobile number format"],
  },
});

const User = mongoose.model("User", userSchema);
export default User;
