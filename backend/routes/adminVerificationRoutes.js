import { Router } from "express";

import {
  createVerificationRequestAdmin,
  getVerificationRequestsAdmin,
  updateVerificationRequestStatus,
  setVerifiedBadgeVisibility,
  getVerificationRenewalsDue,
  markVerificationReminderSent,
  markVerificationRequestPaid,
  getVerificationRequestByIdAdmin,
  getExpiredPendingNotice,
  markVerificationExpiryNoticeSent,
  getVerificationTrialsEndingSoon,
  markVerificationTrialNoticeSent,
} from "../controllers/verificationControllers.js";

const router = Router();

router.get("/", getVerificationRequestsAdmin);
router.post("/", createVerificationRequestAdmin);
router.get("/renewals-due", getVerificationRenewalsDue); // must precede "/:id"
router.get("/expired-pending-notice", getExpiredPendingNotice); // must precede "/:id"
router.get("/trial-ending-soon", getVerificationTrialsEndingSoon); // must precede "/:id"
router.patch("/badge-visibility", setVerifiedBadgeVisibility);
router.get("/:id", getVerificationRequestByIdAdmin);
router.patch("/:id/status", updateVerificationRequestStatus);
router.post("/:id/mark-paid", markVerificationRequestPaid);
router.post("/:id/mark-reminder-sent", markVerificationReminderSent);
router.post("/:id/mark-expiry-notice-sent", markVerificationExpiryNoticeSent);
router.post("/:id/mark-trial-notice-sent", markVerificationTrialNoticeSent);

export default router;
