import { Router } from "express";

import {
  getVerificationRequestsAdmin,
  updateVerificationRequestStatus,
  getVerificationRenewalsDue,
  markVerificationReminderSent,
  markVerificationRequestPaid,
  getVerificationRequestByIdAdmin,
  getExpiredPendingNotice,
  markVerificationExpiryNoticeSent,
} from "../controllers/verificationControllers.js";

const router = Router();

router.get("/", getVerificationRequestsAdmin);
router.get("/renewals-due", getVerificationRenewalsDue); // must precede "/:id"
router.get("/expired-pending-notice", getExpiredPendingNotice); // must precede "/:id"
router.get("/:id", getVerificationRequestByIdAdmin);
router.patch("/:id/status", updateVerificationRequestStatus);
router.post("/:id/mark-paid", markVerificationRequestPaid);
router.post("/:id/mark-reminder-sent", markVerificationReminderSent);
router.post("/:id/mark-expiry-notice-sent", markVerificationExpiryNoticeSent);

export default router;
