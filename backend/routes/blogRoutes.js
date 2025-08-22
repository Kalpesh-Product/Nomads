import { Router } from "express";
import { getBlogs } from "../controllers/blogController.js";

const router = Router();

router.get("/", getBlogs);

export default router;
