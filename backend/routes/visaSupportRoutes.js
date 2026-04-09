import { Router } from "express";
import { createVisaSupportRequest } from "../controllers/visaSupportController.js";

const router = Router();

router.post("/", createVisaSupportRequest);

export default router;