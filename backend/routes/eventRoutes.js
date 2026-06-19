import { Router } from "express";
import upload from "../config/multerConfig.js";
import {
  bulkInsertEvents,
  getEventsByDestination,
  getEvents,
} from "../controllers/eventController.js";

const router = Router();

router.get("/", getEvents);
router.get("/destination/:destination", getEventsByDestination);
router.post("/bulk-insert", upload.single("events-file"), bulkInsertEvents);

export default router;
