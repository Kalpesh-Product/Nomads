import { Router } from "express";
import { bulkInsertPrivateStayPointOfContact } from "../../controllers/private-stay-controllers/pointOfContactControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();

router.post(
  "/bulk-insert-private-stay-poc",
  upload.single("poc"),
  bulkInsertPrivateStayPointOfContact
);

export default router;
