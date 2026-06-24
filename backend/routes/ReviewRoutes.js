import { Router } from "express";
import upload from "../config/multerConfig.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import {
  addReview,
  bulkInsertReviews,
  getReviewsByCompany,
  getReviewsByUser,
  updateReviewStatus,
  createWebsiteReview,
  getApprovedReviewsByCompany,
  updateWebsiteReviewStatus,
} from "../controllers/reviewControllers.js";

const router = Router();

// PUBLIC
router.post(
  "/bulk-insert-reviews", 
  upload.single("reviews"), 
  bulkInsertReviews,
);
router.get("/", getReviewsByCompany);
router.post("/website-review", createWebsiteReview);
router.get("/approved", getApprovedReviewsByCompany);
router.patch("/website-review/:reviewId", updateWebsiteReviewStatus);

// PROTECTED
router.post("/", verifyJwt, addReview);
router.get("/reviews", verifyJwt, getReviewsByUser);

// PROTECTED (if required)
router.patch("/:reviewId", updateReviewStatus);

export default router;
