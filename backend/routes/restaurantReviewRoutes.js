import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  addRestaurantReview,
  bulkInsertRestaurantReviews,
  getRestaurantReviews,
  updateRestaurantReviewStatus,
} from "../controllers/restaurantReviewController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.post(
  "/bulk-insert-reviews",
  upload.single("reviews"),
  bulkInsertRestaurantReviews,
);
router.get("/", getRestaurantReviews);
router.get("/all", getRestaurantReviews);
router.post("/", verifyJwt, addRestaurantReview);
router.patch("/:reviewId/status", updateRestaurantReviewStatus);

export default router;
