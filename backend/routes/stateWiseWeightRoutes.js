import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
    bulkInsertStateWiseWeightCsv,
    getAllStateWiseWeight,
    getStateWiseWeight,
    updateStateWiseWeight,
} from "../controllers/stateWiseWeightController.js";

const router = Router();

router.get("/", getAllStateWiseWeight);
router.post("/", getStateWiseWeight);
router.post(
    "/bulk-upload-csv",
    upload.single("state-wise-weight-file"),
    bulkInsertStateWiseWeightCsv
);
router.patch("/:id", updateStateWiseWeight);

export default router;