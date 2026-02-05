import { Router } from "express";
import upload from "../config/multerConfig.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import {
  addReview,
  bulkInsertReviews,
  updateReviewStatus,
} from "../controllers/reviewControllers.js";

const router = Router();

// PUBLIC
router.post(
  "/bulk-insert-reviews",
  upload.single("reviews"),
  bulkInsertReviews,
);

// PROTECTED
router.post("/", verifyJwt, addReview);

// PROTECTED (if required)
router.patch("/:reviewId", verifyJwt, updateReviewStatus);

export default router;
