import { Router } from "express";
import { createWebsiteLead } from "../controllers/leadsController.js";

const router = Router();

router.post("/create-lead", createWebsiteLead);

export default router;
