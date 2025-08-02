import { Router } from "express";
import upload from "../config/multerConfig.js";
const router = Router();
import {
  addNewCompany,
  bulkInsertCompanies,
  getCompanyData,
  getIndividualCompany,
} from "../controllers/companyControllers.js";

router.post("/add-new-company", addNewCompany);
router.get("/company-data", getCompanyData);
router.get("/individual-company/:companyId", getIndividualCompany);
router.post(
  "/bulk-insert-companies",
  upload.single("companies"),
  bulkInsertCompanies
);
export default router;
