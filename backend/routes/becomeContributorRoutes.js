import { Router } from "express";
import {
  createBecomeContributor,
  getBecomeContributorRequests,
  updateContributorLeadStatus,
} from "../controllers/becomeContributorController.js";
import { verifyAdminApiKey } from "../middlewares/verifyAdminApiKey.js";
import { authenticateContributorSubmission } from "../middlewares/contributorAccess.js";

const router = Router();

router.get("/", verifyAdminApiKey, getBecomeContributorRequests);
router.patch("/:id/status", verifyAdminApiKey, updateContributorLeadStatus);
router.post("/", authenticateContributorSubmission, createBecomeContributor);

export default router;
