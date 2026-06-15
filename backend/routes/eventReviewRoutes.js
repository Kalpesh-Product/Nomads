import { Router } from "express";
import { addEventReview } from "../controllers/eventReviewController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.post("/", verifyJwt, addEventReview);

export default router;
