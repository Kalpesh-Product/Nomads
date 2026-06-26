import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  addPlace,
  bulkInsertPlaces,
  getPlacesByDestination,
  getPlaces,
  getPlaceById,
  updatePlace,
  updatePlaceStatus,
} from "../controllers/placeController.js";

const router = Router();

router.get("/", getPlaces);
router.get("/destination/:destination", getPlacesByDestination);
router.get("/:placeId", getPlaceById);
router.post("/", addPlace);
router.post("/bulk-insert", upload.single("places-file"), bulkInsertPlaces);
router.patch("/:placeId/status", updatePlaceStatus);
router.patch("/:placeId", updatePlace);

export default router;
