import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertMeetingRoomServices } from "../../controllers/meeting-room-controllers/meetingRoomServiceControllers.js";

const router = Router();
router.post(
  "/bulk-insert-meeting-services",
  upload.single("services"),
  bulkInsertMeetingRoomServices
);

export default router;
