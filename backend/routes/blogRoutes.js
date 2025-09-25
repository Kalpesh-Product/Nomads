import { Router } from "express";
import { getBlogs, bulkInsertBlogs } from "../controllers/blogController.js";
import upload from "../config/multerConfig.js";

const router = Router();

router.get("/get-blogs", getBlogs);
router.post("/bulk-insert-blogs", upload.single("blog-file"), bulkInsertBlogs);

export default router;
s;
