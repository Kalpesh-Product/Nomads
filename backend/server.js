import express from "express";
import cors from "cors";
import { corsConfig } from "./config/corsConfig.js";
import errorHandler from "./middleware/errorHandler.js";
import { config } from "dotenv";
import connectDb from "./config/db.js";
import mongoose from "mongoose";


const app = express();
config();
connectDb(process.env.MONGO_URL);

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;


app.use(errorHandler);
app.listen(
  PORT,
  mongoose.connection.once("open", () => {
    console.log(`Server is running on port ${PORT}`);
  })
);
