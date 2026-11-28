import { Router } from "express";
import {
  addB2CformSubmission,
  checkB2cUserEmail,
  getConnectWithUsSubmissions,
  getContentRemovalSubmissions,
} from "../controllers/form-controllers/b2cFormControllers.js";
import {
  addB2BFormSubmission,
  checkHostUserEmail,
  getHostUsers,
  getJobApplicationSubmissions,
  getPublicPlanPricing,
  registerFormSubmission,
  resendHostEmailVerificationLink,
  sendHostEmailVerificationOtp,
  updateHostUserStatusAndComment,
  verifyHostEmailOtp,
} from "../controllers/form-controllers/b2bFormControllers.js";
import {
  updateConnectWithUsStatus,
  updateContentRemovalStatus,
  updateJobApplicationStatus,
} from "../controllers/form-controllers/leadStatusControllers.js";
import upload, { uploadImages } from "../config/multerConfig.js";
import { authenticateContributorSubmission } from "../middlewares/contributorAccess.js";
import { getVerifyBusinessClick } from "../controllers/verifyBusinessClickController.js";
import {
  sendContributorVerificationLink,
  sendContributorVerificationOtp,
  verifyContributorSubmissionOtp,
} from "../controllers/form-controllers/contributorSubmissionVerificationController.js";
const router = Router();

router.post(
  "/contributor-email/send-link",
  authenticateContributorSubmission,
  sendContributorVerificationLink,
);
router.post("/contributor-email/send-otp", sendContributorVerificationOtp);
router.post("/contributor-email/verify-otp", verifyContributorSubmissionOtp);

router.post(
  "/add-new-b2c-form-submission",
  upload.single("resumeLink"),
  (req, res, next) =>
    req.body?.sheetName === "AI_Become_Contributor"
      ? authenticateContributorSubmission(req, res, next)
      : next(),
  (req, res, next) =>
    req.body?.sheetName === "AI_Become_Contributor"
      ? res.status(400).json({
          message: "Please verify your email before submitting this form.",
        })
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
router.get("/connect-with-us", getConnectWithUsSubmissions);
router.get("/job-applications", getJobApplicationSubmissions);
router.get("/content-removal", getContentRemovalSubmissions);
// TODO(next): add verifyAdminApiKey to these PATCH routes (see leadStatusControllers.js).
router.patch("/connect-with-us/:id/status", updateConnectWithUsStatus);
router.patch("/job-applications/:id/status", updateJobApplicationStatus);
router.patch("/content-removal/:id/status", updateContentRemovalStatus);
router.get("/check-host-user-email", checkHostUserEmail);
router.get("/check-b2c-user-email", checkB2cUserEmail);
router.get("/plan-pricing", getPublicPlanPricing);
// Pre-fills the host signup for a visitor who clicked "Verify Business" on a listing.
router.get("/verify-click/:id", getVerifyBusinessClick);
router.patch("/host-users/:hostUserId", updateHostUserStatusAndComment);

// Host lead email verification (public — authorised by the emailed link token)
router.post("/host-email/send-otp", sendHostEmailVerificationOtp);
router.post("/host-email/verify-otp", verifyHostEmailOtp);
router.post("/host-email/resend-link", resendHostEmailVerificationLink);

export default router;
