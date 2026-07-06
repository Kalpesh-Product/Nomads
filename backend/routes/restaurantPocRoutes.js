import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  bulkInsertRestaurantPocs,
  getRestaurantPocs,
} from "../controllers/restaurantPocController.js";

const router = Router();

router.post("/bulk-insert-poc", upload.single("poc"), bulkInsertRestaurantPocs);
router.get("/poc", getRestaurantPocs);
router.get("/", getRestaurantPocs);

export default router;
