import { Router } from "express";
import upload from "../config/multerConfig.js";
const router = Router();
import {
  addNewCompany,
  bulkInsertCompanies,
} from "../controllers/companyControllers.js";

router.post("/add-new-company", addNewCompany);
router.post(
  "/bulk-insert-companies",
  upload.single("companies"),
  bulkInsertCompanies
);
export default router;
