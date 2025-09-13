// routes/newsRoutes.js
import { Router } from "express";
import { getNews, bulkInsertnews } from "../controllers/newsController.js";
import upload from "../config/multerConfig.js";

const router = Router();
router.get("/get-news", getNews);
router.post("/bulk-insert-news", upload.single("news-file"), bulkInsertnews);
export default router;
