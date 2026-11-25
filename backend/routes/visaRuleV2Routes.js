import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  getVisaRulesV2,
  getUniqueDestinationCountriesV2,
  getVisaRuleDetailsByPassportV2,
  importVisaRulesV2Csv,
  importVisaRulesV2RowCsv,
  exportVisaRulesV2Csv,
  updateVisaRuleByPassportV2,
} from "../controllers/visaRuleV2Controller.js";

const router = Router();

router.get("/", getVisaRulesV2);
router.get("/export-csv", exportVisaRulesV2Csv);
router.get("/destinations/countries", getUniqueDestinationCountriesV2);
router.get("/passport/:passport", getVisaRuleDetailsByPassportV2);
router.patch("/passport/:passport", updateVisaRuleByPassportV2);
router.post(
  "/import-csv",
  upload.fields([
    { name: "visa-requirement-file", maxCount: 1 },
    { name: "visa-duration-file", maxCount: 1 },
  ]),
  importVisaRulesV2Csv,
);
router.post(
  "/import-rows-csv",
  upload.single("visa-rules-file"),
  importVisaRulesV2RowCsv,
);

export default router;
