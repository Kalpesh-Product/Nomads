import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertMeetingRooms } from "../../controllers/meeting-room-controllers/meetingRoomControllers.js";

const router = Router();
router.post(
  "/bulk-insert-meeting-rooms",
  upload.single("meeting-room"),
  bulkInsertMeetingRooms
);

export default router;
