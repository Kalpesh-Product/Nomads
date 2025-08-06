import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertCafeReviews } from "../../controllers/cafe-controllers/cafeReviewControllers.js";

const router = Router();
router.post(
  "/bulk-insert-cafe-reviews",
  upload.single("review"),
  bulkInsertCafeReviews
);

export default router;
