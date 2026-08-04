// routes/newsRoutes.js
import { Router } from "express";
import {
  getNews,
  getNewsDestinationCounts,
  bulkInsertnews,
  createNews,
  updateNews,
  deleteNews,
} from "../controllers/newsController.js";
import upload from "../config/multerConfig.js";

const router = Router();
router.get("/news", getNews);
router.get("/get-news", getNews);
router.get("/destination-counts", getNewsDestinationCounts);
router.post("/news", createNews);
router.put("/news/:id", updateNews);
router.delete("/news/:id", deleteNews);
router.post("/bulk-insert", upload.single("news-file"), bulkInsertnews);
export default router;
