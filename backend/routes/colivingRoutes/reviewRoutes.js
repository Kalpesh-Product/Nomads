import { Router } from "express";
import { bulkInsertReviews } from "../../controllers/coliving_controllers/reviewControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();
router.post(
  "/bulk-insert-coliving-reviews",
  upload.single("coliving-reviews"),
  bulkInsertReviews
);

export default router;
