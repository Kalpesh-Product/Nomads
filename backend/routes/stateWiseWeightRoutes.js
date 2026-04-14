import { Router } from "express";
import { getStateWiseWeight } from "../controllers/stateWiseWeightController.js";

const router = Router();

router.post("/", getStateWiseWeight);

export default router;