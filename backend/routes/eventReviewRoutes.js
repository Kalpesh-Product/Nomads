import { Router } from "express";
import {
  addEventReview,
  getApprovedEventReviews,
} from "../controllers/eventReviewController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/", getApprovedEventReviews);
router.post("/", verifyJwt, addEventReview);

export default router;
