import CafePoc from "../../models/cafe/PointOfContact.js";
import Cafe from "../../models/cafe/Cafe.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertCafePoc = async (req, res, next) => {
  try {
    const file = req.file; // Assuming you're using multer for CSV file upload

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const allCafe = await Cafe.find().lean().exec();
    const cafeMap = new Map(allCafe.map((cafe) => [cafe.businessId, cafe._id]));

    const cafePocs = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"];
        const cafeId = cafeMap.get(businessId);

        if (!cafeId) return; // Skip if Cafe not found

        cafePocs.push({
          cafe: cafeId,
          name: row["POC Name"]?.trim(),
          designation: row["POC Designation"]?.trim() || undefined,
          email: row["Email"]?.trim(),
          phoneNumber: row["Phone Number"]?.trim(),
          linkedInProfile: row["LinkedIn Profile"]?.trim() || undefined,
          languages: row["Languages"]?.trim()
            ? row["Languages"].split(",").map((l) => l.trim())
            : [],
          address: row["Address"]?.trim() || undefined,
          availabilityTime: row["Availibility time"]?.trim() || undefined,
        });
      })
      .on("end", async () => {
        try {
          const inserted = await CafePoc.insertMany(cafePocs);
          res.status(201).json({
            message: `${inserted.length} Cafe POCs inserted successfully`,
            data: inserted,
          });
        } catch (insertError) {
          next(insertError);
        }
      })
      .on("error", (streamError) => {
        next(streamError);
      });
  } catch (error) {
    next(error);
  }
};
