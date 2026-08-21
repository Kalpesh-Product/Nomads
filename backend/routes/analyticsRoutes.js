import { Router } from "express";

import {
  trackDestinationClick,
  trackListingClick,
} from "../controllers/nomadUserControllers.js";

const router = Router();

router.post("/destination-click", trackDestinationClick);
router.post("/listing-click", trackListingClick);

export default router;
