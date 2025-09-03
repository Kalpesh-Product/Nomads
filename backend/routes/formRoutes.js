import { Router } from "express";
import { addB2CformSubmission } from "../controllers/form-controllers/b2cFormControllers.js";
import {
  addB2BFormSubmission,
  registerFormSubmission,
} from "../controllers/form-controllers/b2bFormControllers.js";
import upload from "../config/multerConfig.js";
const router = Router();

router.post("/add-new-b2c-form-submission", addB2CformSubmission);
router.post(
  "/add-new-b2b-form-submission",
  upload.single("resumeLink"),
  addB2BFormSubmission
);

router.post("/register-form-submission", upload.any(), registerFormSubmission);

export default router;
