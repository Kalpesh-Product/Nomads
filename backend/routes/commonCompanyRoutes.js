import { Router } from "express";
import {
  getAllCompanyLocations,
  getCompanyDataLocationWise,
  getIndividualCompany,
  uploadCompanyImages,
} from "../controllers/commonCompanyControllers.js";
import upload from "../config/multerConfig.js";

const router = Router();

router.get("/location-and-type-based-company-data", getCompanyDataLocationWise);
router.get("/get-all-locations", getAllCompanyLocations);
router.get("/individual-company", getIndividualCompany);
router.post("/add-company-images", upload.single("image"), uploadCompanyImages);

export default router;
