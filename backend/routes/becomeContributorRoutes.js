import { Router } from "express";
import { createBecomeContributor } from "../controllers/becomeContributorController.js";

const router = Router();

router.post("/", createBecomeContributor);

export default router;