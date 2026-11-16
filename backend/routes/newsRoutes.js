// routes/newsRoutes.js
import { Router } from "express";
import {
  getNews,
  getNewsDestinationCounts,
  bulkInsertnews,
  createNews,
  createMyNews,
  getNewsContributions,
  getMyNews,
  updateNewsContributionStatus,
  updateMyNews,
  deleteMyNews,
  updateNews,
  deleteNews,
} from "../controllers/newsController.js";
import upload from "../config/multerConfig.js";
import { validateContributionImageSizes } from "../middlewares/validateContributionImageSizes.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import { verifyAdminApiKey } from "../middlewares/verifyAdminApiKey.js";

import { requireContributorRole } from "../middlewares/contributorAccess.js";

const router = Router();
router.get("/news", getNews);
router.get("/get-news", getNews);
router.get("/destination-counts", getNewsDestinationCounts);
router.get("/my", verifyJwt, requireContributorRole("isNewsWriter"), getMyNews);
router.post("/my", verifyJwt, requireContributorRole("isNewsWriter"), upload.any(), validateContributionImageSizes, createMyNews);
router.patch("/my/:id", verifyJwt, requireContributorRole("isNewsWriter"), upload.any(), validateContributionImageSizes, updateMyNews);
router.delete("/my/:id", verifyJwt, requireContributorRole("isNewsWriter"), deleteMyNews);
router.get("/contributions", verifyAdminApiKey, getNewsContributions);
router.patch("/contributions/:id/status", verifyAdminApiKey, updateNewsContributionStatus);
router.post("/news", createNews);
router.put("/news/:id", updateNews);
router.delete("/news/:id", deleteNews);
router.post("/bulk-insert", upload.single("news-file"), bulkInsertnews);
export default router;
