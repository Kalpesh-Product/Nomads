import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  aiForgotPassword,
  startForgotPasswordWithOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithOtpSession,
} from "../controllers/authControllers/authControllers.js";
import { refreshTokenController } from "../controllers/authControllers/refreshTokenController.js";

const router = Router();

router.post("/login", login);
router.get("/logout", logout);
router.get("/refresh", refreshTokenController);
router.post("/forgot-password", forgotPassword);
router.post("/ai-forgot-password", aiForgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.post("/forgot-password/start", startForgotPasswordWithOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/reset", resetPasswordWithOtpSession);

export default router;
