import { Router } from "express";
import { bulkInsertHostelReviewControllers } from "../../controllers/hostelControllers/hostelReviewControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();

router.post(
  "/bulk-insert-hostel-review-routes",
  upload.single("reviews"),
  bulkInsertHostelReviewControllers
);

export default router;
