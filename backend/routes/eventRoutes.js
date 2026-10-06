import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  addEvent,
  bulkInsertEvents,
  createMyEvent,
  getEventsByDestination,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  updateEventStatus,
} from "../controllers/eventController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/", getEvents);
router.get("/destination/:destination", getEventsByDestination);
router.get("/my", verifyJwt, getMyEvents);
router.post("/my", verifyJwt, createMyEvent);
router.get("/:eventId", getEventById);
router.post("/", addEvent);
router.post("/bulk-insert", upload.single("events-file"), bulkInsertEvents);
router.patch("/:eventId/status", updateEventStatus);
router.patch("/:eventId", updateEvent);

export default router;
