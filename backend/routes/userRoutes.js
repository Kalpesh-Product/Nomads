import { Router } from "express";
import { login, registeration } from "../controllers/userController.js";

const router = Router();

router.post("/signup", registeration);
router.post("/login", login);

export default router;
