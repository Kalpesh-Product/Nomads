import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertWorkationUnits } from "../../controllers/workation-controllers/unitsControllers.js";

const router = Router();
router.post(
  "/bulk-insert-workation-units",
  upload.single("units"),
  bulkInsertWorkationUnits
);

export default router;
