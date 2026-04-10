import { Router } from "express";
import { createNewCompanySetup } from "../controllers/newCompanySetupController.js";

const router = Router();

router.post("/", createNewCompanySetup);

export default router;