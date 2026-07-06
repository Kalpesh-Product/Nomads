import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  bulkInsertRestaurantReviews,
  getRestaurantReviews,
  updateRestaurantReviewStatus,
} from "../controllers/restaurantReviewController.js";

const router = Router();

router.post(
  "/bulk-insert-reviews",
  upload.single("reviews"),
  bulkInsertRestaurantReviews,
);
router.get("/", getRestaurantReviews);
router.get("/all", getRestaurantReviews);
router.patch("/:reviewId/status", updateRestaurantReviewStatus);

export default router;
