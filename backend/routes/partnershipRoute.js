import { Router } from "express"
import { newPartnershipLead } from "../controllers/partnershipController.js"

const router = Router()

router.post("/new-partnership-lead", newPartnershipLead)

export default router