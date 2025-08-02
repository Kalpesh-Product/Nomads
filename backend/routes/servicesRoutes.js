import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  addCompanyService,
  bulkInsertCompanyServices,
  getCompanyService,
} from "../controllers/coworking_controllers/serviceControllers.js";

const router = Router();

router.post("/add-service", addCompanyService);
router.get("/company-services/:companyId", getCompanyService);
router.post(
  "/bulk-insert-services",
  upload.single("services"),
  bulkInsertCompanyServices
);

export default router;
