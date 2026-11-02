import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import { contentCommentController } from "../controllers/contentCommentController.js";

const router = Router();
router.get("/:kind/:articleId", contentCommentController.list);
router.post("/:kind/:articleId", verifyJwt, contentCommentController.create);
router.post("/:kind/:articleId/:commentId/replies", verifyJwt, contentCommentController.create);
export default router;
