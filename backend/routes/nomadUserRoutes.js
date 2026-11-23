import { Router } from "express";
import { getContentFavorites, updateContentFavorite, getContributionFavoriteCounts } from "../controllers/contentFavoriteControllers.js";

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
  getContributorRoles,
  updateProfile,
} from "../controllers/nomadUserControllers.js";

const router = Router();
router.get("/content-favorites", getContentFavorites);
router.get("/content-favorites/counts", getContributionFavoriteCounts);
router.patch("/content-favorites", updateContentFavorite);

router.get("/", getUsers);
router.patch("/profile/:userId", updateProfile);
router.patch("/password/:userId", changePassword);
router.get("/contributor-roles", getContributorRoles);
router.patch("/favorite-destination", favoriteDestinations);
router.get("/favorite-destination/:userId", getUserFavoriteDestinations);
router.patch("/like", likeListings);
router.get("/likes/:userId", getUserLikes);
router.get("/likes", getLikes);
router.post("/destination-view", trackDestinationView);
router.post("/listing-view", trackListingView);

export default router;
