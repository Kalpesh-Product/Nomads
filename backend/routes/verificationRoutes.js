import { Router } from "express";
import upload from "../config/multerConfig.js";

import {
  searchCompanies,
  submitVerificationRequest,
  getMyVerificationRequests,
  requestSelfServePaymentLink,
  getRequestPaymentHistory,
} from "../controllers/verificationControllers.js";

const router = Router();

router.get("/search-companies", searchCompanies);
router.post(
  "/request",
  upload.single("proofDocument"),
  submitVerificationRequest,
);
router.get("/my-requests", getMyVerificationRequests);
router.post("/:requestId/request-payment-link", requestSelfServePaymentLink);
router.get("/:requestId/history", getRequestPaymentHistory);

export default router;
