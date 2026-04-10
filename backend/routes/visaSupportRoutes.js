import { Router } from "express";
import { createVisaSupport } from "../controllers/visaSupportController.js";

const router = Router();

router.post("/", createVisaSupport);

export default router;