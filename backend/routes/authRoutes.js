import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
} from "../controllers/authControllers/authControllers.js";
import { refreshTokenController } from "../controllers/authControllers/refreshTokenController.js";

const router = Router();

router.post("/login", login);
router.get("/logout", logout);
router.get("/refresh", refreshTokenController);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

export default router;
