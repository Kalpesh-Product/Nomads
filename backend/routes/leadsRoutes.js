import { Router } from "express";
import {
  checkWebsiteBookingAvailability,
  createWebsiteLead,
} from "../controllers/leadsController.js";

const router = Router();

router.post("/create-lead", createWebsiteLead);
router.post("/check-availability", checkWebsiteBookingAvailability);

export default router;
