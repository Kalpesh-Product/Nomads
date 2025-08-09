import { Router } from "express";
import { addNewEnquiry } from "../controllers/form-controllers/enquiryFormControllers.js";
const router = Router();

router.post("/add-new-enquiry", addNewEnquiry);

export default router;
