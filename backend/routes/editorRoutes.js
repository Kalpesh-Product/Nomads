import { Router } from "express";
import { getWebsiteByTenant, getRecruitmentJobs } from "../controllers/editorControllers.js";

const router = Router();

router.get("/get-website/:tenant", getWebsiteByTenant);
router.get("/get-jobs/:workspaceId", getRecruitmentJobs);

export default router;
