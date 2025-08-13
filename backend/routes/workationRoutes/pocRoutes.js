import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertWorkations } from "../../controllers/workation-controllers/pocControllers.js";

const router = Router();
router.post(
  "/bulk-insert-workation-poc",
  upload.single("poc"),
  bulkInsertWorkations
);

export default router;
