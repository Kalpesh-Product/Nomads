import { Router } from "express";

import {
  changePassword,
  favoriteDestinations,
  getLikes,
  getSaves,
  getUserFavoriteDestinations,
  getUserLikes,
  getUsers,
  getUserSaves,
  likeListings,
  saveListings,
  trackDestinationView,
  trackListingView,
  updateContributorRoles,
  updateProfile,
} from "../controllers/nomadUserControllers.js";

const router = Router();

router.get("/", getUsers);
router.patch("/profile/:userId", updateProfile);
router.patch("/password/:userId", changePassword);
router.patch("/contributor-roles", updateContributorRoles);
router.patch("/favorite-destination", favoriteDestinations);
router.get("/favorite-destination/:userId", getUserFavoriteDestinations);
router.patch("/like", likeListings);
router.get("/likes/:userId", getUserLikes);
router.get("/likes", getLikes);
router.post("/destination-view", trackDestinationView);
router.post("/listing-view", trackListingView);

export default router;
