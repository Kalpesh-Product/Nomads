import HostelReviews from "../../models/hostels/Review.js";
import Hostels from "../../models/hostels/Hostel.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertHostelReviewControllers = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const hostels = await Hostels.find().lean().exec();
    const hostelsMap = new Map(
      hostels.map((hostel) => [hostel.businessId, hostel._id])
    );

    const hostelReviews = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();
        const hostelId = hostelsMap.get(businessId);

        if (!hostelId) return;

        const review = {
          hostel: hostelId,
          name: row["Reviewer Name"]?.trim(),
          rating: Number(row["Rating"]),
          reviewText: row["Review Text"]?.trim(),
          platform: row["Platform"]?.trim(),
          reviewLink: row["Review Link"]?.trim() || null,
        };

        hostelReviews.push(review);
      })
      .on("end", async () => {
        if (hostelReviews.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid hostel reviews found in CSV." });
        }

        await HostelReviews.insertMany(hostelReviews);
        res.status(201).json({
          message: `${hostelReviews.length} hostel reviews inserted successfully.`,
        });
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};

