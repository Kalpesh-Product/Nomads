import { Router } from "express";
import { createOverallActivationSupport } from "../controllers/overallActivationSupportController.js";

const router = Router();

router.post("/", createOverallActivationSupport);

export default router;