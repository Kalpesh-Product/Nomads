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
  updateNews,
  deleteNews,
} from "../controllers/newsController.js";
import upload from "../config/multerConfig.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import { verifyAdminApiKey } from "../middlewares/verifyAdminApiKey.js";

const router = Router();
router.get("/news", getNews);
router.get("/get-news", getNews);
router.get("/destination-counts", getNewsDestinationCounts);
router.get("/my", verifyJwt, getMyNews);
router.post("/my", verifyJwt, createMyNews);
router.patch("/my/:id", verifyJwt, updateMyNews);
router.get("/contributions", verifyAdminApiKey, getNewsContributions);
router.patch("/contributions/:id/status", verifyAdminApiKey, updateNewsContributionStatus);
router.post("/news", createNews);
router.put("/news/:id", updateNews);
router.delete("/news/:id", deleteNews);
router.post("/bulk-insert", upload.single("news-file"), bulkInsertnews);
export default router;
