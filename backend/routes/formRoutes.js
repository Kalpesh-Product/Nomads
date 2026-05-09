import { Router } from "express";
import { addB2CformSubmission } from "../controllers/form-controllers/b2cFormControllers.js";
import {
  addB2BFormSubmission,
  getHostUsers,
  registerFormSubmission,
  updateHostUserStatusAndComment,
} from "../controllers/form-controllers/b2bFormControllers.js";
import upload, { uploadImages } from "../config/multerConfig.js";
const router = Router();

router.post(
  "/add-new-b2c-form-submission",
  upload.single("resumeLink"),
  addB2CformSubmission,
);
router.post(
  "/add-new-b2b-form-submission",
  upload.single("resumeLink"),
  addB2BFormSubmission,
);

router.post(
  "/register-form-submission",
  uploadImages.any(),
  registerFormSubmission,
);
router.get("/host-users", getHostUsers);
router.patch("/host-users/:hostUserId", updateHostUserStatusAndComment);

export default router;
