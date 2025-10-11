import { Router } from "express";

import {
  likeListings,
  saveListings,
} from "../controllers/nomadUserControllers.js";

const router = Router();

router.patch("/save", saveListings);
router.patch("/like", likeListings);

export default router;
