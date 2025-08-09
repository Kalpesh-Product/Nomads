import { Router } from "express";
import upload from "../../config/multerConfig.js";
const router = Router();
import {
  bulkInsertCompanies,
} from "../../controllers/coworking-controllers/companyControllers.js";

router.post(
  "/bulk-insert-companies",
  upload.single("companies"),
  bulkInsertCompanies
);
export default router;
