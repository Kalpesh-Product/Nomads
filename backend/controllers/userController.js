import axios from "axios";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const registeration = async (req, res, next) => {
  try {
    const { firstName, lastName, password, email, mobile } = req.body;

    if (!firstName || !lastName || !email || !password || !mobile) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobile,
    });

    const savedUser = await user.save();
    const objectSavedUser = savedUser.toObject();

    axios
      .post(
        process.env.GOOGLE_SHEET_LINK,
        {
          ...objectSavedUser,
          mobile: `'${objectSavedUser.mobile}`,
          type: "registration",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => response.data)
      .then((data) => {
        if (data?.status === "success") {
          return res
            .status(200)
            .json({ message: "User registered successfully." });
        }
      })
      .catch((error) => {
        console.error("Google Sheets error:", error);
        return res.status(500).json({
          error:
            "User is registered, but failed to sync data with Google Sheets.",
        });
      });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
