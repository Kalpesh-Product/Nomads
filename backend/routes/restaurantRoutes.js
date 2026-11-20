import { Router } from "express";
import upload from "../config/multerConfig.js";
import { verifyAdminApiKey } from "../middlewares/verifyAdminApiKey.js";
import {
  addRestaurant,
  bulkInsertRestaurants,
  getRestaurantsByDestination,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  updateRestaurantStatus,
  addRestaurantImagesBulk,
  reuploadRestaurantImages,
  uploadRestaurantLogo,
} from "../controllers/restaurantController.js";

const router = Router();

router.get("/", getRestaurants);
router.get("/destination/:destination", getRestaurantsByDestination);
router.post(
  "/bulk-add-restaurant-images",
  upload.array("images", 10),
  addRestaurantImagesBulk,
);
router.post(
  "/reupload-images",
  verifyAdminApiKey,
  upload.array("images", 10),
  reuploadRestaurantImages,
);
router.post("/upload-logo", upload.single("image"), uploadRestaurantLogo);
router.get("/:restaurantId", getRestaurantById);
router.post("/", addRestaurant);
router.post("/bulk-insert", upload.single("restaurants-file"), bulkInsertRestaurants);
router.patch("/:restaurantId/status", updateRestaurantStatus);
router.patch("/:restaurantId", updateRestaurant);

export default router;
