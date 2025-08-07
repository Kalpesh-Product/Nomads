import { Router } from "express";
import upload from "../config/multerConfig.js";
import { uploadFileToS3, deleteFileFromS3ByUrl } from "../config/s3Config.js";
const router = Router();

router.post("/test-upload", upload.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    const response = await uploadFileToS3(
      `biznest/company/images/${file.originalname}`,
      file
    );
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.delete("/delete-uploaded-file", async (req, res, next) => {
  try {
    const { url } = req.query;
    const response = await deleteFileFromS3ByUrl(url);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
