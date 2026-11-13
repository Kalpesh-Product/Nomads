import { Router } from "express";
import { getVisaRulesV2 } from "../controllers/visaRuleV2Controller.js";

const router = Router();

router.get("/", getVisaRulesV2);

export default router;
