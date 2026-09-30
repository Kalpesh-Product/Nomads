import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  getConsultationSupportPartnerById,
  getConsultationSupportPartners,
  importConsultationSupportPartnersCsv,
  updateConsultationSupportPartner,
} from "../controllers/consultationSupportController.js";

const router = Router();

router.get("/partners", getConsultationSupportPartners);
router.get("/partners/:partnerId", getConsultationSupportPartnerById);
router.patch("/partners/:partnerId", updateConsultationSupportPartner);
router.post(
  "/partners/import-csv",
  upload.single("consultation-support-partners-file"),
  importConsultationSupportPartnersCsv,
);

export default router;
