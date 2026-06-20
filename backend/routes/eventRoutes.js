import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  addEvent,
  bulkInsertEvents,
  getEventsByDestination,
  getEvents,
  getEventById,
  updateEvent,
  updateEventStatus,
} from "../controllers/eventController.js";

const router = Router();

router.get("/", getEvents);
router.get("/destination/:destination", getEventsByDestination);
router.get("/:eventId", getEventById);
router.post("/", addEvent);
router.post("/bulk-insert", upload.single("events-file"), bulkInsertEvents);
router.patch("/:eventId/status", updateEventStatus);
router.patch("/:eventId", updateEvent);

export default router;
