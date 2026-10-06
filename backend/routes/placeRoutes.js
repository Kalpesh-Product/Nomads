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
  updatePlace,
  updatePlaceStatus,
} from "../controllers/placeController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/", getPlaces);
router.get("/destination/:destination", getPlacesByDestination);
router.get("/my", verifyJwt, getMyPlaces);
router.post("/my", verifyJwt, createMyPlace);
router.get("/:placeId", getPlaceById);
router.post("/", addPlace);
router.post("/bulk-insert", upload.single("places-file"), bulkInsertPlaces);
router.patch("/:placeId/status", updatePlaceStatus);
router.patch("/:placeId", updatePlace);

export default router;
