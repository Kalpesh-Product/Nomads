import { Router } from "express";
import { createConsultation } from "../controllers/consultationController.js";

const router = Router();

router.post("/", createConsultation);

export default router;