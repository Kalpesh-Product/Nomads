import { Router } from "express";
import {
  getCompanyDataLocationWise,
  getIndividualCompany,
} from "../controllers/commonCompanyControllers.js";

const router = Router();

router.get("/location-and-type-based-company-data", getCompanyDataLocationWise);
router.get("/individual-company", getIndividualCompany);

export default router;
