import { Router } from "express";
import { addB2CformSubmission } from "../controllers/form-controllers/b2cFormControllers.js";
import {
  addB2BFormSubmission,
  checkHostUserEmail,
  getHostUsers,
  registerFormSubmission,
  updateHostUserStatusAndComment,
} from "../controllers/form-controllers/b2bFormControllers.js";
import upload, { uploadImages } from "../config/multerConfig.js";
import { authenticateContributorSubmission } from "../middlewares/contributorAccess.js";
const router = Router();

router.post(
  "/add-new-b2c-form-submission",
  upload.single("resumeLink"),
  (req, res, next) => req.body?.sheetName === "AI_Become_Contributor"
    ? authenticateContributorSubmission(req, res, next)
    : next(),
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
router.get("/check-host-user-email", checkHostUserEmail);
router.patch("/host-users/:hostUserId", updateHostUserStatusAndComment);

export default router;
