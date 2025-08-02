import { Router } from "express";
import {
  addCompanyInclusions,
  bulkInsertInclusions,
  getCompanyInclusions,
} from "../controllers/coworking_controllers/inclusionsController.js";
import upload from "../config/multerConfig.js";

const router = Router();

router.post("/add-company-inclusions", addCompanyInclusions);
router.get("/get-company-inclusions", getCompanyInclusions);
router.post(
  "/bulk-insert-company-inclusions",
  upload.single("inclusions"),
  bulkInsertInclusions
);

export default router;
