import express from "express";
import cors from "cors";
import { corsConfig } from "./config/corsConfig.js";
import errorHandler from "./middleware/errorHandler.js";
import { config } from "dotenv";
import connectDb from "./config/db.js";
import companyRoutes from "./routes/coworkingRoutes/companyRoutes.js";
import pocRoutes from "./routes/coworkingRoutes/pocRoutes.js";
import reviewRoutes from "./routes/coworkingRoutes/reviewRoutes.js";
import serviceRoutes from "./routes/coworkingRoutes/servicesRoutes.js";
import inclusionsRoutes from "./routes/coworkingRoutes/inclusionsRoutes.js";
import colivingCompanyRoutes from "./routes/colivingRoutes/companyRoutes.js";
import colivingUnitRoutes from "./routes/colivingRoutes/colivingUnitRoutes.js";
import colivingInclusionsRoutes from "./routes/colivingRoutes/inclusionsRoutes.js";
import colivingReviewRoutes from "./routes/colivingRoutes/reviewRoutes.js";
import colivingPocRoutes from "./routes/colivingRoutes/colivingPocRoutes.js";
import commonCompanyRoutes from "./routes/commonCompanyRoutes.js";
import mongoose from "mongoose";

const app = express();
config();
connectDb(process.env.MONGO_URL);

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

app.use("/api/coworking/company", companyRoutes);
app.use("/api/coworking/reviews", reviewRoutes);
app.use("/api/coworking/poc", pocRoutes);
app.use("/api/coworking/services", serviceRoutes);
app.use("/api/coworking/inclusions", inclusionsRoutes);
app.use("/api/coliving/company", colivingCompanyRoutes);
app.use("/api/coliving/unit", colivingUnitRoutes);
app.use("/api/coliving/inclusions", colivingInclusionsRoutes);
app.use("/api/coliving/review", colivingReviewRoutes);
app.use("/api/coliving/poc", colivingPocRoutes);
app.use("/api/common", commonCompanyRoutes);
app.use(errorHandler);
app.listen(
  PORT,
  mongoose.connection.once("open", () => {
    console.log(`Server is running on port ${PORT}`);
  })
);
