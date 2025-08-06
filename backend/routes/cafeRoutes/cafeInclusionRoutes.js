import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertCafeInclusions } from "../../controllers/cafe-controllers/cafeInclusionsControllers.js";

const router = Router();
router.post(
  "/bulk-insert-cafe-inclusions",
  upload.single("inclusions"),
  bulkInsertCafeInclusions
);

export default router;
