import { Router } from "express";
import { submitConsultation } from "../controllers/consultationController.js";

const router = Router();

router.post("/free-consultation", submitConsultation);

export default router;
