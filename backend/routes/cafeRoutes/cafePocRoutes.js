import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertCafePoc } from "../../controllers/cafe-controllers/cafePocControllers.js";

const router = Router();
router.post("/bulk-insert-cafe-poc", upload.single("poc"), bulkInsertCafePoc);

export default router;
