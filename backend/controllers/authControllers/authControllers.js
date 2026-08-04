import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import NomadUser from "../../models/NomadUser.js";
import NomadUserSessionLog from "../../models/NomadUserSessionLog.js";
import Otp from "../../models/Otp.js";
import { sendMail } from "../../config/mailer.js";
import { renderNotificationEmail } from "../../utils/emailTemplates.js";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).+$/;

const validateStrongPassword = (password) => {
  if (!password || password.length < 8) return "Must be at least 8 characters long.";
  if (password.length > 72) return "Password cannot exceed 72 characters.";
  if (!PASSWORD_REGEX.test(password)) {
    return "Should include both uppercase and lowercase letters and at least one number or special character.";
  }
  return "";
};

const getPasswordResetSessionSecret = () =>
  process.env.PASSWORD_RESET_OTP_SECRET || process.env.ACCESS_TOKEN_SECRET;

const signPasswordResetSession = (email) => {
  const secret = getPasswordResetSessionSecret();
  if (!secret) throw new Error("Password reset secret not configured");
  return jwt.sign(
    { purpose: "password_reset_session", email: String(email || "").trim().toLowerCase() },
    secret,
    { expiresIn: "15m" },
  );
};

const verifyPasswordResetSession = (token) => {
  const secret = getPasswordResetSessionSecret();
  if (!secret) throw new Error("Password reset secret not configured");
  return jwt.verify(token, secret);
};

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
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userInfo: { ...user } },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "15d" },
    );

    await NomadUser.findOneAndUpdate({ email }, { refreshToken }).lean().exec();

    NomadUserSessionLog.create({ userId: user._id, event: "login" }).catch((error) => {
      console.error("[authControllers] failed to log login event:", error.message);
    });

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
        fullName: user.fullName,
        email: user.email,
        country: user.country,
        countryOfResidence: user.countryOfResidence,
        contactCode: user.contactCode,
        contactNumber: user.contactNumber,
        saves: user.saves,
        likes: user.likes,
        favoriteDestination: user.favoriteDestination,
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

    NomadUserSessionLog.create({ userId: user._id, event: "logout" }).catch((error) => {
      console.error("[authControllers] failed to log logout event:", error.message);
    });

    res.clearCookie("nomadCookie", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await NomadUser.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found with this email" });

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL (frontend route)
    // const resetUrl = `${process.env.FRONTEND_PROD_LINK}/reset-password/${resetToken}`;
    const resetUrl = `${process.env.FRONTEND_PROD_LINK}reset-password/${resetToken}`;

    try {
      await sendMail({
        to: user.email,
        subject: "Reset Your WONO Password",
        html: renderNotificationEmail({
          heroTitle: "Reset Your Password",
          heroSubtitle: "We received a request to reset your WONO password.",
          greetingHtml: `
            <p style="margin:0 0 4px;">Hello ${user.name || "there"},</p>
            <p class="email-text" style="margin:0;">Click the button below to set a new password for your WONO account.</p>
          `,
          ctaButton: {
            label: "Reset Password",
            href: resetUrl,
            caption: "This link expires in 15 minutes.",
          },
          noteHtml:
            "If you didn't request this, you can safely ignore this email — your password will remain unchanged.",
        }),
      });

      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const aiForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await NomadUser.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found with this email" });

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL (frontend route)
    // const resetUrl = `${process.env.FRONTEND_PROD_LINK}/reset-password/${resetToken}`;
    const resetUrl = `${process.env.FRONTEND_PROD_LINK}ai-reset-password/${resetToken}`;

    try {
      await sendMail({
        to: user.email,
        subject: "Reset Your WONO Password",
        html: renderNotificationEmail({
          heroTitle: "Reset Your Password",
          heroSubtitle: "We received a request to reset your WONO password.",
          greetingHtml: `
            <p style="margin:0 0 4px;">Hello ${user.name || "there"},</p>
            <p class="email-text" style="margin:0;">Click the button below to set a new password for your WONO account.</p>
          `,
          ctaButton: {
            label: "Reset Password",
            href: resetUrl,
            caption: "This link expires in 15 minutes.",
          },
          noteHtml:
            "If you didn't request this, you can safely ignore this email — your password will remain unchanged.",
        }),
      });

      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const startForgotPasswordWithOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) return res.status(400).json({ message: "Email is required." });

    const user = await NomadUser.findOne({ email: normalizedEmail }).lean().exec();
    if (!user) return res.status(404).json({ message: "Email doesn't exist." });

    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    await Otp.updateMany(
      { email: normalizedEmail, purpose: "password_reset", isUsed: false },
      { $set: { isUsed: true } },
    );
    await Otp.create({
      email: normalizedEmail,
      code: otp,
      purpose: "password_reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      payload: {},
    });

    await sendMail({
      to: normalizedEmail,
      subject: "Reset Your WONO Password",
      html: renderNotificationEmail({
        heroTitle: "Reset Your Password",
        heroSubtitle: "Use the verification code below to continue.",
        greetingHtml: `
          <p style="margin:0 0 4px;">Hello ${user?.fullName || "there"},</p>
          <p class="email-text" style="margin:0;">Use the verification code below to verify your identity and reset your WONO password.</p>
        `,
        otpCode: { code: otp, expiryMinutes: 10 },
        noteHtml:
          "For your security, never share this verification code with anyone.<br/><br/><b>Didn't request this?</b> You can safely ignore this email.",
      }),
    });

    return res.status(200).json({ message: "OTP sent successfully.", email: normalizedEmail });
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      purpose: "password_reset",
      isUsed: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!otpRecord) return res.status(400).json({ message: "Please request OTP first." });
    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await Otp.updateOne({ _id: otpRecord._id }, { $set: { isUsed: true } });
      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }
    if (otpRecord.attempts >= 5) {
      await Otp.updateOne({ _id: otpRecord._id }, { $set: { isUsed: true } });
      return res.status(429).json({ message: "OTP attempts exceeded. Request a new OTP." });
    }
    if (String(otpRecord.code) !== String(otp)) {
      await Otp.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const user = await NomadUser.findOne({ email: normalizedEmail }).lean().exec();
    if (!user) {
      await Otp.updateOne({ _id: otpRecord._id }, { $set: { isUsed: true } });
      return res.status(404).json({ message: "Email doesn't exist." });
    }

    await Otp.updateOne({ _id: otpRecord._id }, { $set: { isUsed: true } });
    const resetSessionToken = signPasswordResetSession(normalizedEmail);
    return res.status(200).json({
      message: "OTP verified successfully.",
      resetSessionToken,
      email: normalizedEmail,
    });
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset session expired. Verify OTP again." });
    }
    if (error?.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid reset session." });
    }
    next(error);
  }
};

export const resetPasswordWithOtpSession = async (req, res, next) => {
  try {
    const { resetSessionToken, password, confirmPassword } = req.body;
    if (!resetSessionToken) {
      return res.status(400).json({ message: "Reset session token is required." });
    }
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    const strengthMessage = validateStrongPassword(password);
    if (strengthMessage) return res.status(400).json({ message: strengthMessage });

    const decoded = verifyPasswordResetSession(resetSessionToken);
    const normalizedEmail = String(decoded?.email || "").trim().toLowerCase();
    if (!normalizedEmail) return res.status(400).json({ message: "Invalid reset session." });

    const user = await NomadUser.findOne({ email: normalizedEmail }).select("+password").exec();
    if (!user) return res.status(404).json({ message: "Email doesn't exist." });

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ message: "New password cannot be the same as the old password." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    try {
      const firstName = (user.fullName || "").split(" ")[0] || "there";
      const loginUrl = `${process.env.FRONTEND_DEV_LINK}login`;
      await sendMail({
        to: user.email,
        subject: "Password Reset Successful",
        html: renderNotificationEmail({
          heroTitle: "Password Reset Successful",
          heroSubtitle: "Your WONO password has been updated.",
          greetingHtml: `
            <p style="margin:0 0 4px;">Hello ${firstName},</p>
            <p class="email-text" style="margin:0;">Your password has been successfully reset. You can now log in with your new password.</p>
          `,
          ctaButton: {
            label: "Login to WONO",
            href: loginUrl,
            caption: "Log in with your new password.",
          },
          noteHtml:
            "If you did not perform this action, please contact our support team immediately.",
        }),
      });
    } catch (error) {
      console.error("Password reset confirmation email failed:", error.message);
    }

    return res.status(200).json({ success: true, message: "Password reset successful." });
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset session expired. Verify OTP again." });
    }
    if (error?.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid reset session." });
    }
    next(error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword)
      return res
        .status(400)
        .json({ message: "Password and Confirm Password are required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (password.length > 72) {
      return res
        .status(400)
        .json({ message: "Password cannot exceed 72 characters" });
    }

    // Hash the reset token to find user
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await NomadUser.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token" });

    // ✅ Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword)
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });

    // ✅ Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // ✅ Send confirmation email
    const firstName = (user.fullName || user.name || "").split(" ")[0] || "there";
    const loginUrl = `${process.env.FRONTEND_DEV_LINK}login`;

    try {
      await sendMail({
        to: user.email,
        subject: "Password Reset Successful",
        html: renderNotificationEmail({
          heroTitle: "Password Reset Successful",
          heroSubtitle: "Your WONO password has been updated.",
          greetingHtml: `
            <p style="margin:0 0 4px;">Hello ${firstName},</p>
            <p class="email-text" style="margin:0;">Your password has been successfully reset. You can now log in with your new password.</p>
          `,
          ctaButton: {
            label: "Login to WONO",
            href: loginUrl,
            caption: "Log in with your new password.",
          },
          noteHtml:
            "If you did not perform this action, please contact our support team immediately.",
        }),
      });
    } catch (error) {
      console.error(
        "⚠️ Password reset confirmation email failed:",
        error.message,
      );
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful. A confirmation email has been sent.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
