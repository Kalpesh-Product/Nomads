import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  getActivationSupportPartnerById,
  getActivationSupportPartners,
  importActivationSupportPartnersCsv,
  updateActivationSupportPartner,
} from "../controllers/activationSupportController.js";

const router = Router();

router.get("/partners", getActivationSupportPartners);
router.get("/partners/:partnerId", getActivationSupportPartnerById);
router.patch("/partners/:partnerId", updateActivationSupportPartner);
router.post(
  "/partners/import-csv",
  upload.single("activation-support-partners-file"),
  importActivationSupportPartnersCsv,
);

export default router;
