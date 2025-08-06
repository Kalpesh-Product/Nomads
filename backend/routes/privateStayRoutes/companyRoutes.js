import { Router } from "express";
import { bulkInsertPrivateStay } from "../../controllers/private-stay-controllers/companyControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();
router.post(
  "/bulk-insert-private-stay",
  upload.single("private-stay"),
  bulkInsertPrivateStay
);

export default router;
