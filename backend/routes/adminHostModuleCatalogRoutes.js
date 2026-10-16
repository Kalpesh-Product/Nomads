import { Router } from "express";

import { uploadImages } from "../config/multerConfig.js";
import {
  createCategory,
  createModule,
  replaceCategoryModules,
  updateModuleFields,
  uploadModuleScreenshot,
  deleteModule,
} from "../controllers/hostModuleCatalogControllers.js";

const router = Router();

router.post("/", createCategory);
router.post("/:categoryId/modules", createModule);
router.put("/:categoryId", replaceCategoryModules);
router.patch("/:categoryId/modules/:moduleId", updateModuleFields);
router.post(
  "/:categoryId/modules/:moduleId/screenshot",
  uploadImages.single("image"),
  uploadModuleScreenshot,
);
router.delete("/:categoryId/modules/:moduleId", deleteModule);

export default router;
