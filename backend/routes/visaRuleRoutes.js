import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  getVisaRules,
  importVisaRulesCsv,
} from "../controllers/visaRuleController.js";

const router = Router();

router.get("/", getVisaRules);
router.post(
  "/import-csv",
  upload.fields([
    { name: "visa-requirement-file", maxCount: 1 },
    { name: "visa-duration-file", maxCount: 1 },
  ]),
  importVisaRulesCsv,
);

export default router;
