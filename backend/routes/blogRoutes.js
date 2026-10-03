import { Router } from "express";
import {
  getBlogs,
  getBlogDestinationCounts,
  bulkInsertBlogs,
  createBlog,
  createMyBlog,
  getMyBlogs,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import upload from "../config/multerConfig.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";

const router = Router();

router.get("/blogs", getBlogs);
router.get("/get-blogs", getBlogs);
router.get("/destination-counts", getBlogDestinationCounts);
router.get("/my", verifyJwt, getMyBlogs);
router.post("/my", verifyJwt, createMyBlog);
router.post("/blogs", createBlog);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);
router.post("/bulk-insert", upload.single("blog-file"), bulkInsertBlogs);

export default router;
