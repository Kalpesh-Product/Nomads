import { Router } from "express";
import upload from "../../config/multerConfig.js";
const router = Router();
import { bulkInsertWorkations } from "../../controllers/workation-controllers/workationControllers.js";

router.post(
  "/bulk-insert-workation-companies",
  upload.single("workation"),
  bulkInsertWorkations
);

export default router;
