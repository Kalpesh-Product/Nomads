import { Router } from "express";
import {
  addPlaceReview,
  getAllPlaceReviews,
  getApprovedPlaceReviews,
  getPlaceReviewsByUser,
  updatePlaceReview,
  updatePlaceReviewStatus,
} from "../controllers/placeReviewController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/all", getAllPlaceReviews);
router.get("/my", verifyJwt, getPlaceReviewsByUser);
router.get("/", getApprovedPlaceReviews);
router.post("/", verifyJwt, addPlaceReview);
router.patch("/:reviewId/status", updatePlaceReviewStatus);
router.patch("/:reviewId", verifyJwt, updatePlaceReview);

export default router;
