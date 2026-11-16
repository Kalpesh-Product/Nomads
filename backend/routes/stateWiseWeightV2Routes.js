import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  bulkInsertStateWiseWeightV2Csv,
  createStateWiseWeightV2,
  getAllStateWiseWeightV2,
  getStateWiseWeightV2,
  updateStateWiseWeightV2,
} from "../controllers/stateWiseWeightV2Controller.js";

const router = Router();

router.get("/", getAllStateWiseWeightV2);
router.post("/", getStateWiseWeightV2);
router.post("/add", upload.array("images"), createStateWiseWeightV2);
router.post(
  "/bulk-upload-csv",
  upload.single("state-wise-weight-file"),
  bulkInsertStateWiseWeightV2Csv,
);
router.patch("/:id", upload.array("images"), updateStateWiseWeightV2);

export default router;
