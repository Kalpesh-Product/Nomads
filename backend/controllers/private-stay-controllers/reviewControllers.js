import PrivateStay from "../../models/private-stay/PrivateStay.js";
import { Readable } from "stream";
import csvParser from "csv-parser";
import PrivateStayReview from "../../models/private-stay/Reviews.js";

export const bulkInsertReviewControllers = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const reviews = [];

    // Fetch all private stays to map businessId to _id
    const privateStays = await PrivateStay.find().lean();
    const privateStayMap = new Map(
      privateStays.map((stay) => [stay.businessId?.trim(), stay._id])
    );

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const {
          "Business ID": businessId,
          "Business Name": businessName,
          "Reviewer Name": reviewerName,
          Rating: rating,
          "Review Text": reviewText,
          Platform: platform,
          "Review Link": reviewLink,
        } = row;

        const trimmedBusinessId = businessId?.trim();
        const privateStayId = privateStayMap.get(trimmedBusinessId);

        if (privateStayId) {
          reviews.push({
            privateStay: privateStayId,
            businessName: businessName?.trim(),
            reviewerName: reviewerName?.trim(),
            rating: parseFloat(rating),
            reviewText: reviewText?.trim(),
            platform: platform?.trim(),
            reviewLink: reviewLink?.trim(),
          });
        }
      })
      .on("end", async () => {
        if (reviews.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid reviews found in the CSV." });
        }

        await PrivateStayReview.insertMany(reviews);

        res.status(200).json({
          message: `Successfully inserted ${reviews.length} reviews.`,
        });
      })
      .on("error", (err) => {
        console.error("CSV parsing error:", err);
        return res.status(500).json({ message: "Error parsing CSV file." });
      });
  } catch (error) {
    next(error);
  }
};
