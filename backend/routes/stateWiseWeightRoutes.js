import { Router } from "express";
import { getStateWiseWeight } from "../controllers/stateWiseWeightController.js";

const router = Router();

router.get("/", getStateWiseWeight);

export default router;