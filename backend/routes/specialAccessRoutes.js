import { Router } from "express";
import {
  getSpecialAccessEmails,
  addSpecialAccessEmail,
  removeSpecialAccessEmail,
} from "../controllers/specialAccessController.js";

const router = Router();

router.get("/", getSpecialAccessEmails);
router.post("/", addSpecialAccessEmail);
router.delete("/:email", removeSpecialAccessEmail);

export default router;
