import { Router } from "express";
import upload from "../../config/multerConfig.js";
import {
  bulkInsertCafe,
  uploadCafeImage,
} from "../../controllers/cafe-controllers/cafeControllers.js";

const router = Router();
router.post("/bulk-insert-cafe", upload.single("cafe"), bulkInsertCafe);
router.post("/upload-cafe-image", upload.single("image"), uploadCafeImage);
export default router;
