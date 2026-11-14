import { Router } from "express";
import {
  getBlogs,
  getBlogDestinationCounts,
  bulkInsertBlogs,
  createBlog,
  createMyBlog,
  getBlogContributions,
  getMyBlogs,
  updateBlogContributionStatus,
  updateMyBlog,
  deleteMyBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import upload from "../config/multerConfig.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import { verifyAdminApiKey } from "../middlewares/verifyAdminApiKey.js";

import { requireContributorRole } from "../middlewares/contributorAccess.js";

const router = Router();

const validateBlogImageSizes = (req, res, next) => {
  for (const file of req.files ?? []) {
    const isMainImage = file.fieldname === "mainImageFile";
    const section = file.fieldname.match(/^sectionImageFiles\[(\d+)\]$/);
    if (!isMainImage && !section) continue;

    const limitMB = isMainImage ? 3 : 1;
    if (file.size > limitMB * 1024 * 1024) {
      const label = isMainImage ? "Main Image" : `Section ${Number(section[1]) + 1} Image`;
      return res.status(413).json({ message: `${label} must be ${limitMB} MB or smaller.` });
    }
  }

  next();
};

router.get("/blogs", getBlogs);
router.get("/get-blogs", getBlogs);
router.get("/destination-counts", getBlogDestinationCounts);
router.get("/my", verifyJwt, requireContributorRole("isBlogger"), getMyBlogs);
router.post("/my", verifyJwt, requireContributorRole("isBlogger"), upload.any(), validateBlogImageSizes, createMyBlog);
router.patch("/my/:id", verifyJwt, requireContributorRole("isBlogger"), upload.any(), validateBlogImageSizes, updateMyBlog);
router.delete("/my/:id", verifyJwt, requireContributorRole("isBlogger"), deleteMyBlog);
router.get("/contributions", verifyAdminApiKey, getBlogContributions);
router.patch("/contributions/:id/status", verifyAdminApiKey, updateBlogContributionStatus);
router.post("/blogs", createBlog);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);
router.post("/bulk-insert", upload.single("blog-file"), bulkInsertBlogs);

export default router;
