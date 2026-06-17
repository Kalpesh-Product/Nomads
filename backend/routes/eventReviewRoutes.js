import { Router } from "express";
import {
  addEventReview,
  getAllEventReviews,
  getApprovedEventReviews,
  getEventReviewsByUser,
  updateEventReviewStatus,
} from "../controllers/eventReviewController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/all", getAllEventReviews);
router.get("/my", verifyJwt, getEventReviewsByUser);
router.get("/", getApprovedEventReviews);
router.post("/", verifyJwt, addEventReview);
router.patch("/:reviewId/status", updateEventReviewStatus);

export default router;
