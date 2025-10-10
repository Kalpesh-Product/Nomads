import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import NomadUser from "../models/NomadUser.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    // Find usesr by email
    const user = await NomadUser.findOne({
      email: email.trim().toLowerCase(),
    });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // // Create JWT token
    // const token = jwt.sign(
    //   { id: user._id, email: user.email },
    //   process.env.JWT_SECRET || "supersecretkey", // replace in .env
    //   { expiresIn: "7d" }
    // );

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
