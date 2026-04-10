import { Router } from "express";
import { createWorkation } from "../controllers/workationController.js";

const router = Router();

router.post("/", createWorkation);

export default router;