import { Router } from "express";

import { trackDestinationClick } from "../controllers/nomadUserControllers.js";

const router = Router();

router.post("/destination-click", trackDestinationClick);

export default router;
