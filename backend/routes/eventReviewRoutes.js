import { Router } from "express";
import {
  addEventReview,
  getApprovedEventReviews,
  updateEventReviewStatus,
} from "../controllers/eventReviewController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/", getApprovedEventReviews);
router.post("/", verifyJwt, addEventReview);
router.patch("/:reviewId/status", verifyJwt, updateEventReviewStatus);

export default router;
