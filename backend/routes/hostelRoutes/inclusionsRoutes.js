import { Router } from "express";
import { bulkInsertHostelInclusions } from "../../controllers/hostel-controllers/hostelInclusionsControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();

router.post(
  "/bulk-insert-hostel-inclusions",
  upload.single("inclusions"),
  bulkInsertHostelInclusions
);

export default router;
