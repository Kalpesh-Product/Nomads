import { Router } from "express";

import {
  changePassword,
  getLikes,
  getSaves,
  getUserLikes,
  getUsers,
  getUserSaves,
  likeListings,
  saveListings,
  updateProfile,
} from "../controllers/nomadUserControllers.js";

const router = Router();

router.get("/", getUsers);
router.patch("/profile/:userId", updateProfile);
router.patch("/password/:userId", changePassword);
router.patch("/like", likeListings);
router.get("/likes/:userId", getUserLikes);
router.get("/likes", getLikes);

export default router;
