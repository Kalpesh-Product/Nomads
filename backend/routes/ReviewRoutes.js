import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  addReview,
  bulkInsertReviews,
  updateReviewStatus,
} from "../controllers/reviewControllers.js";

const router = Router();
router.post(
  "/bulk-insert-reviews",
  upload.single("reviews"),
  bulkInsertReviews,
);
router.post("/", addReview);
export default router;
