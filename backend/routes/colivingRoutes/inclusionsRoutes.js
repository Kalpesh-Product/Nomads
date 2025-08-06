import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertColivingInclusions } from "../../controllers/coliving-controllers/inclusionsControllers.js";

const router = Router();

router.post(
  "/bulk-insert-coliving-inclusions",
  upload.single("coliving-inclusions"),
  bulkInsertColivingInclusions
);

export default router;
