import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  addEvent,
  bulkInsertEvents,
  getEventContributions,
  createMyEvent,
  getEventsByDestination,
  getEvents,
  getEventById,
  getMyEvents,
  updateEventContributionStatus,
  updateEvent,
  updateEventStatus,
} from "../controllers/eventController.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import { verifyAdminApiKey } from "../middlewares/verifyAdminApiKey.js";

const router = Router();

router.get("/", getEvents);
router.get("/destination/:destination", getEventsByDestination);
router.get("/my", verifyJwt, getMyEvents);
router.post("/my", verifyJwt, createMyEvent);
router.get("/contributions", verifyAdminApiKey, getEventContributions);
router.patch("/contributions/:id/status", verifyAdminApiKey, updateEventContributionStatus);
router.get("/:eventId", getEventById);
router.post("/", addEvent);
router.post("/bulk-insert", upload.single("events-file"), bulkInsertEvents);
router.patch("/:eventId/status", updateEventStatus);
router.patch("/:eventId", updateEvent);

export default router;
