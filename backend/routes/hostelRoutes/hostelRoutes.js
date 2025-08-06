import { Router } from "express";
import { bulkInsertHostels } from "../../controllers/hostelControllers/hostelControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();

router.post(
  "/bulk-insert-hostels",
  upload.single("hostels"),
  bulkInsertHostels
);

export default router;
