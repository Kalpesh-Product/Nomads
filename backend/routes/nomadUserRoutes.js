import { Router } from "express";

import {
  changePassword,
  favoriteDestinations,
  getLikes,
  getSaves,
  getUserFavoriteDestinations,
  getUserLikes,
  getUsers,
  getWebsiteBookings,
  rescheduleWebsiteBooking,
  checkWebsiteBookingRescheduleAvailability,
  getUserSaves,
  likeListings,
  saveListings,
  trackDestinationView,
  trackListingView,
  updateProfile,
} from "../controllers/nomadUserControllers.js";

const router = Router();

router.get("/", getUsers);
router.get("/website-bookings", getWebsiteBookings);
router.patch("/website-bookings/:bookingId/reschedule", rescheduleWebsiteBooking);
router.post("/website-bookings/:bookingId/reschedule-availability", checkWebsiteBookingRescheduleAvailability);
router.patch("/profile/:userId", updateProfile);
router.patch("/password/:userId", changePassword);
router.patch("/favorite-destination", favoriteDestinations);
router.get("/favorite-destination/:userId", getUserFavoriteDestinations);
router.patch("/like", likeListings);
router.get("/likes/:userId", getUserLikes);
router.get("/likes", getLikes);
router.post("/destination-view", trackDestinationView);
router.post("/listing-view", trackListingView);

export default router;
