import { Router } from "express";
import { getVerifyBusinessClicksAdmin } from "../controllers/verifyBusinessClickController.js";

const router = Router();

router.get("/", getVerifyBusinessClicksAdmin);

export default router;
