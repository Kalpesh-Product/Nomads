import express from "express";
import cors from "cors";
import { corsConfig } from "./config/corsConfig.js";
import errorHandler from "./middleware/errorHandler.js";
import { config } from "dotenv";
import connectDb from "./config/db.js";
import mongoose from "mongoose";
import userRoute from "./routes/userRoutes.js";
import partnershipRoute from "./routes/partnershipRoute.js";
import consultationRoute from "./routes/consultationRoute.js";
import contactRoute from "./routes/contactRoute.js";

const app = express();
config();
connectDb(process.env.MONGO_URL);

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

app.use("/api/auth", userRoute);
app.use("/api/partnership", partnershipRoute);
app.use("/api/consultation", consultationRoute);
app.use("/api/contact", contactRoute);
app.use(errorHandler);
app.listen(
  PORT,
  mongoose.connection.once("open", () => {
    console.log(`Server is running on port ${PORT}`);
  })
);
