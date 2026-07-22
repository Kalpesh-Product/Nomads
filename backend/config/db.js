import mongoose from "mongoose";

const connectDb = async (url) => {
  if (!url) {
    throw new Error("MONGO_URL is missing from the environment");
  }

  try {
    await mongoose.connect(url);
    console.log("successfully connected to the database");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

export default connectDb;
