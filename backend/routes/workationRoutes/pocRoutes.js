import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertWorkationPoc } from "../../controllers/workation-controllers/pocControllers.js";

const router = Router();
router.post(
  "/bulk-insert-workation-poc",
  upload.single("poc"),
  bulkInsertWorkationPoc
);

export default router;
