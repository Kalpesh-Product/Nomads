import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  createVisaSupport,
  getVisaSupportPartnerById,
  getVisaSupportPartners,
  getVisaSupportRequests,
  importVisaSupportPartnersCsv,
  updateVisaSupportPartner,
} from "../controllers/visaSupportController.js";

const router = Router();

router.get("/partners", getVisaSupportPartners);
router.get("/partners/:partnerId", getVisaSupportPartnerById);
router.patch("/partners/:partnerId", updateVisaSupportPartner);
router.post(
  "/partners/import-csv",
  upload.single("visa-support-partners-file"),
  importVisaSupportPartnersCsv,
);
router.get("/", getVisaSupportRequests);
router.post("/", createVisaSupport);

export default router;
