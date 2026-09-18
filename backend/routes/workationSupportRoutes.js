import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  getWorkationSupportPartnerById,
  getWorkationSupportPartners,
  importWorkationSupportPartnersCsv,
  updateWorkationSupportPartner,
} from "../controllers/workationSupportController.js";

const router = Router();

router.get("/partners", getWorkationSupportPartners);
router.get("/partners/:partnerId", getWorkationSupportPartnerById);
router.patch("/partners/:partnerId", updateWorkationSupportPartner);
router.post(
  "/partners/import-csv",
  upload.single("workation-support-partners-file"),
  importWorkationSupportPartnersCsv,
);

export default router;
