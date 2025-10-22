import { Router } from "express";
import {
  login,
  logout,
} from "../controllers/authControllers/authControllers.js";
import { refreshTokenController } from "../controllers/authControllers/refreshTokenController.js";

const router = Router();

router.post("/login", login);
router.get("/logout", logout);
router.get("/refresh", refreshTokenController);

export default router;
