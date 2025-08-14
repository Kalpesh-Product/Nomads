import { Router } from "express";
import { bulkInsertWorkationReview } from "../../controllers/workation-controllers/reviewControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();
router.post(
  "/bulk-insert-workation-reviews",
  upload.single("reviews"),
  bulkInsertWorkationReview
);

export default router;
