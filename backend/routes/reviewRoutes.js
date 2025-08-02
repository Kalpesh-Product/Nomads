import { Router } from "express";
import upload from "../config/multerConfig.js";
const router = Router();
import {
  addReview,
  getReviews,
  bulkInsertReviews,
} from "../controllers/coworking_controllers/reviewControllers.js";

router.post("/add-review", addReview);
router.get("/get-reviews/:companyId", getReviews);
router.post(
  "/bulk-insert-reviews",
  upload.single("reviews"),
  bulkInsertReviews
);
export default router;
