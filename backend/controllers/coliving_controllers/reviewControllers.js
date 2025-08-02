import ColivingReviews from "../../models/coliving/Reviews.js";
import ColivingCompany from "../../models/coliving/ColivingCompany.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertReviews = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file." });
    }

    const colivingCompanies = await ColivingCompany.find().lean().exec();
    const colivingMap = new Map(
      colivingCompanies.map((company) => [company.businessId, company._id])
    );

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const reviews = [];

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();
        const colivingId = colivingMap.get(businessId);

        if (!colivingId) return;

        const rating = parseInt(row["Rating"], 10);
        if (isNaN(rating) || rating < 1 || rating > 5) return;

        const review = {
          colivingCompany: colivingId,
          name: row["Reviewer Name"]?.trim() || "Anonymous",
          starCount: rating,
          description: row["Review Text"]?.trim() || "No description",
          reviewSource: row["Platform"]?.trim() || "Unknown",
          reviewLink: row["Review Link"]?.trim() || "Unknown",
        };

        reviews.push(review);
      })
      .on("end", async () => {
        if (reviews.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid reviews to insert." });
        }

        await ColivingReviews.insertMany(reviews);
        res.status(200).json({
          message: `${reviews.length} reviews inserted successfully.`,
        });
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
