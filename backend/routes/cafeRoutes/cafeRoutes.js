import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertCafe } from "../../controllers/cafe-controllers/cafeControllers.js";

const router = Router();
router.post("/bulk-insert-cafe", upload.single("cafe"), bulkInsertCafe);
export default router;
