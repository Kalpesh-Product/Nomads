import { Router } from "express";

import {
  getUsers,
  likeListings,
  saveListings,
} from "../controllers/nomadUserControllers.js";

const router = Router();

router.get("/", getUsers);
router.patch("/save", saveListings);
router.patch("/like", likeListings);

export default router;
