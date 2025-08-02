import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertColivingPointOfContact } from "../../controllers/coliving_controllers/pointofContactControllers.js";

const router = Router();
router.post(
  "/bulk-insert-coliving-poc",
  upload.single("coliving-poc"),
  bulkInsertColivingPointOfContact
);

export default router;
