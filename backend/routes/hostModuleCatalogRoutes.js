import { Router } from "express";

import { getHostModuleCatalog } from "../controllers/hostModuleCatalogControllers.js";

const router = Router();

router.get("/", getHostModuleCatalog);

export default router;
