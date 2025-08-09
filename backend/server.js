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
import colivingCompanyRoutes from "./routes/colivingRoutes/companyRoutes.js";
import colivingUnitRoutes from "./routes/colivingRoutes/colivingUnitRoutes.js";
import colivingReviewRoutes from "./routes/colivingRoutes/reviewRoutes.js";
import colivingPocRoutes from "./routes/colivingRoutes/colivingPocRoutes.js";
import commonCompanyRoutes from "./routes/commonCompanyRoutes.js";
import hostelRoutes from "./routes/hostelRoutes/hostelRoutes.js";
import hostelReviewRoutes from "./routes/hostelRoutes/reviewRoutes.js";
import hostelUnitRoutes from "./routes/hostelRoutes/unitsRoutes.js";
import hostelPointOfContactRoutes from "./routes/hostelRoutes/pointOfContactRoutes.js";
import privateStayCompanyRoutes from "./routes/privateStayRoutes/companyRoutes.js";
import privateStayUnitRoutes from "./routes/privateStayRoutes/privateStayUnitsRoutes.js";
import privateStayReviewRoutes from "./routes/privateStayRoutes/privateStayReviewRoutes.js";
import privateStayPocRoutes from "./routes/privateStayRoutes/privateStayPocRoutes.js";
import cafeRoutes from "./routes/cafeRoutes/cafeRoutes.js";
import cafeReviewRoutes from "./routes/cafeRoutes/cafeReviews.js";
import cafePocRoutes from "./routes/cafeRoutes/cafePocRoutes.js";
import formRoutes from "./routes/formRoutes.js";
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
app.use("/api/coliving/company", colivingCompanyRoutes);
app.use("/api/coliving/unit", colivingUnitRoutes);
app.use("/api/coliving/review", colivingReviewRoutes);
app.use("/api/coliving/poc", colivingPocRoutes);
app.use("/api/hostel/company", hostelRoutes);
app.use("/api/hostel/review", hostelReviewRoutes);
app.use("/api/hostel/units", hostelUnitRoutes);
app.use("/api/hostel/poc", hostelPointOfContactRoutes);
app.use("/api/private-stay/company", privateStayCompanyRoutes);
app.use("/api/private-stay/units", privateStayUnitRoutes);
app.use("/api/private-stay/review", privateStayReviewRoutes);
app.use("/api/private-stay/poc", privateStayPocRoutes);
app.use("/api/cafe/company", cafeRoutes);
app.use("/api/cafe/review", cafeReviewRoutes);
app.use("/api/cafe/poc", cafePocRoutes);
app.use("/api/common", commonCompanyRoutes);
app.use("/api/form", formRoutes);
app.use(errorHandler);
app.listen(
  PORT,
  mongoose.connection.once("open", () => {
    console.log(`Server is running on port ${PORT}`);
  })
);
