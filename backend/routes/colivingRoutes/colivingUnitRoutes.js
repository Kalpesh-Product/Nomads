import { Router } from "express";
import { bulkInsertUnits } from "../../controllers/coliving-controllers/unitControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();

router.post(
  "/bulk-insert-coliving-units",
  upload.single("coliving-units"),
  bulkInsertUnits
);

export default router;
