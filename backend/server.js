import express from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import { corsConfig } from "./config/corsConfig.js";
import cors from "cors";
import multer from "multer";
import errorHandler from "./middlewares/errorHandler.js";
import companyRoutes from "./routes/companyRoutes.js";
import pocRoutes from "./routes/pocRoutes.js";
import reviewRoutes from "./routes/ReviewRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import connectDb from "./config/db.js";
import upload from "./config/multerConfig.js";
import newsRoutes from "./routes/newsRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import nomadUserRoutes from "./routes/nomadUserRoutes.js";
import cookieParser from "cookie-parser";
import credentials from "./middlewares/credentials.js";
import { verifyJwt } from "./middlewares/verifyJwt.js";
import { updateReviewStatus } from "./controllers/reviewControllers.js";

const app = express();
config({ override: true });
connectDb(process.env.MONGO_URL);

app.use(credentials);
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/user", verifyJwt, nomadUserRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/poc", pocRoutes);
app.use("/api/review/:reviewId", updateReviewStatus);
app.use("/api/review", verifyJwt, reviewRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/job", jobRoutes);

app.use("/api/news", newsRoutes);
app.use("/api/blogs", blogRoutes); // New Blog Route

app.all("/*splat", (req, res) => {
  if (req.accepts("html")) {
    res.status(404).send("<h1>404 not found</h1>");
  } else if (req.accepts("json")) {
    return res.status(404).json({ message: "404 not found" });
  } else {
    res.type("text").status(404).send("404 not found");
  }
});

app.use((err, req, res, next) => {
  // Multer: file too large
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message:
        "Some files are too large. Please keep images under the allowed size and try again.",
    });
  }

  // express.json() or express.urlencoded(): body too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      message:
        "The data you’re sending is too large. Please reduce the size and try again.",
    });
  }

  next(err);
});

app.use(errorHandler);
app.listen(
  PORT,
  mongoose.connection.once("open", () => {
    console.log(`Server is running on port ${PORT}`);
  }),
);
