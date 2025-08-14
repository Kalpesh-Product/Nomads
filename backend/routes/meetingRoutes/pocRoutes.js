import { Router } from "express";
import upload from "../../config/multerConfig.js";
import { bulkInsertMeetingPoc } from "../../controllers/meeting-room-controllers/pocControllers.js";

const router = Router();
router.post(
  "/bulk-insert-meetings-poc",
  upload.single("poc"),
  bulkInsertMeetingPoc
);

export default router;
