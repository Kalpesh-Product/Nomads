import { Router } from "express";
import { bulkInsertHostelPointOfContact } from "../../controllers/hostelControllers/pointOfContactControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();
router.post(
  "/bulk-insert-point-of-contacts",
  upload.single("poc"),
  bulkInsertHostelPointOfContact
);

export default router;
