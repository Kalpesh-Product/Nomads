import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  addRestaurantReview,
  bulkInsertRestaurantReviews,
  deleteRestaurantReview,
  getRestaurantReviews,
  getRestaurantReviewsByUser,
  updateRestaurantReview,
  updateRestaurantReviewStatus,
} from "../controllers/restaurantReviewController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.post(
  "/bulk-insert-reviews",
  upload.single("reviews"),
  bulkInsertRestaurantReviews,
);
router.get("/my", verifyJwt, getRestaurantReviewsByUser);
router.get("/", getRestaurantReviews);
router.get("/all", getRestaurantReviews);
router.post("/", verifyJwt, addRestaurantReview);
router.patch("/:reviewId/status", updateRestaurantReviewStatus);
router.patch("/:reviewId", verifyJwt, updateRestaurantReview);
router.delete("/:reviewId", verifyJwt, deleteRestaurantReview);

export default router;
