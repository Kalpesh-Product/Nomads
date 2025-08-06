import CafeReview from "../../models/cafe/Review.js";
import Cafe from "../../models/cafe/Cafe.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertCafeReviews = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const cafeReviews = [];
    const allCafe = await Cafe.find().lean().exec();
    const cafeMap = new Map(allCafe.map((cafe) => [cafe.businessId, cafe._id]));

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();
        const cafeId = cafeMap.get(businessId);

        if (!cafeId) return; // Skip if businessId not found

        cafeReviews.push({
          cafe: cafeId,
          reviewerName: row["Reviewer Name"]?.trim(),
          rating: parseFloat(row["Rating"]) || 0,
          reviewText: row["Review Text"]?.trim(),
          platform: row["Platform"]?.trim(),
          reviewLink: row["Review Link"]?.trim(),
        });
      })
      .on("end", async () => {
        if (cafeReviews.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid reviews to insert" });
        }

        await CafeReview.insertMany(cafeReviews);
        res
          .status(200)
          .json({
            message: `${cafeReviews.length} reviews inserted successfully`,
          });
      })
      .on("error", (err) => {
        console.error("CSV Parse Error:", err);
        res.status(500).json({ message: "Failed to parse CSV file" });
      });
  } catch (error) {
    next(error);
  }
};
