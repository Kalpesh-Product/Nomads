import Workation from "../../models/workations/Workations.js";
import WorkationReview from "../../models/workations/Review.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertWorkationReview = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const workations = await Workation.find().lean().exec();
    const workationMap = new Map(
      workations.map((workation) => [workation.businessId, workation._id])
    );

    const reviews = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const workationId = workationMap.get(row["Business ID"]?.trim());
        const review = {
          workation: workationId,
          name: row["Reviewer Name"]?.trim(),
          reviewerName: row["Reviewer Name"]?.trim(),
          rating: row["Rating"]?.trim() ? Number(row["Rating"]?.trim()) : null,
          reviewText: row["Review Text"]?.trim(),
          platform: row["Platform"]?.trim(),
          reviewLink: row["Review Link"]?.trim(),
        };
        reviews.push(review);
      })
      .on("end", async () => {
        try {
          // Check for duplicates based on businessId
          const businessIds = workations.map((w) => w.businessId);
          const existing = await Workation.find({
            businessId: { $in: businessIds },
          });
          const existingIds = new Set(existing.map((e) => e.businessId));

          const toInsert = reviews.filter(
            (w) => !existingIds.has(w.businessId)
          );

          if (toInsert.length === 0) {
            return res
              .status(409)
              .json({ message: "All workations already exist." });
          }

          const inserted = await WorkationReview.insertMany(toInsert);
          res.status(201).json({
            message: `Successfully inserted ${inserted.length} workation reviews.`,
            data: inserted,
          });
        } catch (insertErr) {
          next(insertErr);
        }
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
