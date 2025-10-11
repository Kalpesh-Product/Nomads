import { Router } from "express";
import upload from "../config/multerConfig.js";
import { login } from "../controllers/authControllers.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);

export default router;
