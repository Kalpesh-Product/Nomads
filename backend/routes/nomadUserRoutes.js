import { Router } from "express";

import {
  getLikes,
  getSaves,
  getUserLikes,
  getUsers,
  getUserSaves,
  likeListings,
  saveListings,
} from "../controllers/nomadUserControllers.js";

const router = Router();

router.get("/", getUsers);
router.patch("/save", saveListings);
router.get("/saves/:userId", getUserSaves);
router.patch("/like", likeListings);
router.get("/saves", getSaves);
router.get("/likes/:userId", getUserLikes);
router.get("/likes", getLikes);

export default router;
