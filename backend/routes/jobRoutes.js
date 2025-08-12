import { Router } from "express";
import {
  addJobCategory,
  deactivateJobCategory,
} from "../controllers/job-post-controllers/jobCategoryControllers.js";

const router = Router();

router.post("/add-job-category", addJobCategory);
router.patch("/decativate-job-category/:categoryId", deactivateJobCategory);

export default router;
