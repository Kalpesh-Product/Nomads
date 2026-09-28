import { Router } from "express";
import { addB2CformSubmission } from "../controllers/form-controllers/b2cFormControllers.js";
import {
  addB2BFormSubmission,
  checkHostUserEmail,
  getHostUsers,
  getPublicPlanPricing,
  registerFormSubmission,
  resendHostEmailVerificationLink,
  sendHostEmailVerificationOtp,
  updateHostUserStatusAndComment,
  verifyHostEmailOtp,
} from "../controllers/form-controllers/b2bFormControllers.js";
import upload, { uploadImages } from "../config/multerConfig.js";
import { getVerifyBusinessClick } from "../controllers/verifyBusinessClickController.js";
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
router.get("/check-host-user-email", checkHostUserEmail);
router.get("/plan-pricing", getPublicPlanPricing);
// Pre-fills the host signup for a visitor who clicked "Verify Business" on a listing.
router.get("/verify-click/:id", getVerifyBusinessClick);
router.patch("/host-users/:hostUserId", updateHostUserStatusAndComment);

// Host lead email verification (public — authorised by the emailed link token)
router.post("/host-email/send-otp", sendHostEmailVerificationOtp);
router.post("/host-email/verify-otp", verifyHostEmailOtp);
router.post("/host-email/resend-link", resendHostEmailVerificationLink);

export default router;
