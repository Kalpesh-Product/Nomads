import { Router } from "express";
import upload from "../../config/multerConfig.js";
const router = Router();
import {
  addNewCompany,
  bulkInsertCompanies,
  getCompanyData,
  uploadCoworkingImage,
} from "../../controllers/coworking-controllers/companyControllers.js";

router.post("/add-new-company", addNewCompany);
router.get("/company-data", getCompanyData);
router.post(
  "/bulk-insert-companies",
  upload.single("companies"),
  bulkInsertCompanies
);
router.post(
  "/upload-coworking-company-image",
  upload.single("image"),
  uploadCoworkingImage
);
export default router;
