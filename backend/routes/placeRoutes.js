import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  addPlace,
  bulkInsertPlaces,
  createMyPlace,
  getPlacesByDestination,
  getPlaces,
  getPlaceById,
  getMyPlaces,
  getPlaceContributions,
  updatePlaceContributionStatus,
  updateMyPlace,
  updatePlace,
  updatePlaceStatus,
} from "../controllers/placeController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import { verifyAdminApiKey } from "../middlewares/verifyAdminApiKey.js";

import { requireContributorRole } from "../middlewares/contributorAccess.js";

const router = Router();

router.get("/", getPlaces);
router.get("/destination/:destination", getPlacesByDestination);
router.get("/my", verifyJwt, requireContributorRole("isPlaceWriter"), getMyPlaces);
router.post("/my", verifyJwt, requireContributorRole("isPlaceWriter"), upload.any(), createMyPlace);
router.patch("/my/:id", verifyJwt, requireContributorRole("isPlaceWriter"), upload.any(), updateMyPlace);
router.get("/contributions", verifyAdminApiKey, getPlaceContributions);
router.patch("/contributions/:id/status", verifyAdminApiKey, updatePlaceContributionStatus);
router.get("/:placeId", getPlaceById);
router.post("/", addPlace);
router.post("/bulk-insert", upload.single("places-file"), bulkInsertPlaces);
router.patch("/:placeId/status", updatePlaceStatus);
router.patch("/:placeId", updatePlace);

export default router;
