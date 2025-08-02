import { Router } from "express";
import { getCompanyDataLocationWise } from "../controllers/commonCompanyControllers.js";

const router = Router();

router.get("/location-and-type-based-company-data", getCompanyDataLocationWise);
export default router;
