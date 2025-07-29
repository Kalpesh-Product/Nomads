import { Router } from "express";
import { contactInfo } from "../controllers/contactController.js";

const router = Router();

router.post("/contact-info", contactInfo);

export default router;
