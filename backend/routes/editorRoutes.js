import { Router } from "express";
import { getWebsiteByTenant } from "../controllers/editorControllers.js";

const router = Router();

router.get("/get-website/:tenant", getWebsiteByTenant);

export default router;
