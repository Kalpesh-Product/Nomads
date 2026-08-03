import { Router } from "express";
import {
  addEventReview,
  deleteEventReview,
  getAllEventReviews,
  getApprovedEventReviews,
  getEventReviewsByUser,
  updateEventReview,
  updateEventReviewStatus,
} from "../controllers/eventReviewController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/all", getAllEventReviews);
router.get("/my", verifyJwt, getEventReviewsByUser);
router.get("/", getApprovedEventReviews);
router.post("/", verifyJwt, addEventReview);
router.patch("/:reviewId/status", updateEventReviewStatus);
router.patch("/:reviewId", verifyJwt, updateEventReview);
router.delete("/:reviewId", verifyJwt, deleteEventReview);

export default router;
