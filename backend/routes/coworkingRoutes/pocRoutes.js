import { Router } from "express";
import {
  bulkInsertPoc,
  createNewPointOfContact,
  deactivatePoc,
  getPoc,
} from "../../controllers/coworking_controllers/pocControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();
router.post("/add-new-poc", createNewPointOfContact);
router.get("/get-poc/:companyId", getPoc);
router.patch("/deactivate-poc/:id", deactivatePoc);
router.post("/bulk-insert-poc", upload.single("poc"), bulkInsertPoc);

export default router;
