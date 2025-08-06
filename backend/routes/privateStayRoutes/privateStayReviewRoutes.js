import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertReviewControllers } from "../../controllers/private-stay-controllers/reviewControllers.js";

const router = Router();
router.post(
  "/bulk-insert-private-stay-reviews",
  upload.single("review"),
  bulkInsertReviewControllers
);

export default router;
