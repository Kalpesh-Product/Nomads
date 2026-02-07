import { Router } from "express";
import upload from "../config/multerConfig.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import {
  addReview,
  bulkInsertReviews,
  getReviewsByCompany,
  updateReviewStatus,
} from "../controllers/reviewControllers.js";

const router = Router();

// PUBLIC
router.post(
  "/bulk-insert-reviews",
  upload.single("reviews"),
  bulkInsertReviews,
);
router.get("/", getReviewsByCompany);

// PROTECTED
router.post("/", verifyJwt, addReview);

// PROTECTED (if required)
router.patch("/:reviewId", updateReviewStatus);

export default router;
