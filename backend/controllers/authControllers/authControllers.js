import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import NomadUser from "../../models/NomadUser.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await NomadUser.findOne({
      email: email.trim().toLowerCase(),
    }).lean();

    if (!user)
      return res.status(401).json({ message: "Invalid email provided" });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password provided" });

    delete user.password;
    delete user.refreshToken;

    const accessToken = jwt.sign(
      { userInfo: { ...user } },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userInfo: { ...user } },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "15d" }
    );

    await NomadUser.findOneAndUpdate({ email }, { refreshToken }).lean().exec();

    res.cookie("nomadCookie", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

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
      accessToken,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.nomadCookie) {
      return res.sendStatus(201);
    }

    const refreshToken = cookies?.nomadCookie;
    const user = await NomadUser.findOne({ refreshToken }, { new: true });
    if (!user) {
      res.clearCookie("nomadCookie", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(201);
    }

    await NomadUser.findOneAndUpdate({ refreshToken }, { refreshToken: "" })
      .lean()
      .exec();
    res.clearCookie("nomadCookie", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};
