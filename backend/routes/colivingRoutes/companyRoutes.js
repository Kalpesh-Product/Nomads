import { Router } from "express";
import { bulkInsertColivingCompanies } from "../../controllers/coliving-controllers/companyControllers.js";
import upload from "../../config/multerConfig.js";

const router = Router();

router.post(
  "/bulk-insert-coliving-companies",
  upload.single("coliving"),
  bulkInsertColivingCompanies
);
export default router;
