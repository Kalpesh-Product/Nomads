import jwt from "jsonwebtoken";
import NomadUser from "../../models/NomadUser.js";

export const refreshTokenController = async (req, res, next) => {
  try {
    const cookie = req.cookies;
    if (!cookie?.nomadCookie) {
      return res.sendStatus(401);
    }
    const refreshToken = cookie?.nomadCookie;

    const user = await NomadUser.findOne({ refreshToken }).lean().exec();
    if (!user) {
      return res.sendStatus(401);
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err) => {
        if (err) {
          return res.sendStatus(403);
        }
        delete user.password;
        delete user.refreshToken;
        const accessToken = jwt.sign(
          { userInfo: { ...user } },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" },
        );
        res.status(200).json({ user, accessToken });
      },
    );
  } catch (error) {
    next(error);
  }
};
