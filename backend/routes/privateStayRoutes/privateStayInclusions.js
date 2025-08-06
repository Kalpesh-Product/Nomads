import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertPrivateStayInclusions } from "../../controllers/private-stay-controllers/inclusionsControllers.js";

const router = Router();
router.post(
  "/bulk-insert-private-stay-inclusions",
  upload.single("inclusions"),
  bulkInsertPrivateStayInclusions
);

export default router;
