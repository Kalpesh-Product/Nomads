import { Router } from "express";
import { bulkInsertHostelUnits } from "../../controllers/hostel-controllers/hostelUnitControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();
router.post(
  "/bulk-insert-hostel-units",
  upload.single("units"),
  bulkInsertHostelUnits
);

export default router;
