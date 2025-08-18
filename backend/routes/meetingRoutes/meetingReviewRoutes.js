import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertMeetingRoomReviews } from "../../controllers/meeting-room-controllers/meetingRoomReviewControllers.js";

const router = Router();
router.post(
  "/bulk-insert-meeting-reviews",
  upload.single("reviews"),
  bulkInsertMeetingRoomReviews
);

export default router;
