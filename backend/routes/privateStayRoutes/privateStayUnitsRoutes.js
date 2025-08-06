import { Router } from "express";
import { bulkInsertPrivateStayUnits } from "../../controllers/private-stay-controllers/unitControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();
router.post(
  "/bulk-insert-private-stay-units",
  upload.single("units"),
  bulkInsertPrivateStayUnits
);

export default router;
