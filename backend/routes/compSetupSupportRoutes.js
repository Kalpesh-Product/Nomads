import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  getCompSetupSupportPartnerById,
  getCompSetupSupportPartners,
  importCompSetupSupportPartnersCsv,
  updateCompSetupSupportPartner,
} from "../controllers/compSetupSupportController.js";

const router = Router();

router.get("/partners", getCompSetupSupportPartners);
router.get("/partners/:partnerId", getCompSetupSupportPartnerById);
router.patch("/partners/:partnerId", updateCompSetupSupportPartner);
router.post(
  "/partners/import-csv",
  upload.single("company-setup-support-partners-file"),
  importCompSetupSupportPartnersCsv,
);

export default router;
