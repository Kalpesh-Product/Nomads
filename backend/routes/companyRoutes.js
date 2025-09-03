import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  bulkInsertCompanies,
  getCompaniesData,
  getCompanyData,
  getUniqueDataLocations,
  addCompanyImage,
  addCompanyImagesBulk,
  addWebsiteLink,
} from "../controllers/compayControllers.js";

const router = Router();
router.post(
  "/bulk-insert-companies",
  upload.single("companies"),
  bulkInsertCompanies
);

router.get("/companies", getCompaniesData);
router.get("/get-single-company-data/:companyId", getCompanyData);
router.get("/company-locations", getUniqueDataLocations);
router.patch("/update-company", addWebsiteLink);
router.post("/add-company-image", upload.single("image"), addCompanyImage);
router.post(
  "/bulk-add-company-images",
  upload.array("images", 10),
  addCompanyImagesBulk
);

export default router;
