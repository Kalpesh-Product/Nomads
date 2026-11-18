import { Router } from "express";
import {
  getVisaRulesV2,
  getUniqueDestinationCountriesV2,
  getVisaRuleDetailsByPassportV2,
  updateVisaRuleByPassportV2,
} from "../controllers/visaRuleV2Controller.js";

const router = Router();

router.get("/", getVisaRulesV2);
router.get("/destinations/countries", getUniqueDestinationCountriesV2);
router.get("/passport/:passport", getVisaRuleDetailsByPassportV2);
router.patch("/passport/:passport", updateVisaRuleByPassportV2);

export default router;
