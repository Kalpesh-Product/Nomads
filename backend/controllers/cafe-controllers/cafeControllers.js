import Cafe from "../../models/cafe/Cafe.js";
import { Readable } from "stream";
import csvParser from "csv-parser";
import { uploadFileToS3 } from "../../config/s3Config.js";

export const bulkInsertCafe = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const validEntries = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        // Filter and map only allowed fields to schema keys
        const cafeData = {
          businessId: row["Business ID"]?.trim(),
          companyName: row["Business name"]?.trim(),
          registeredEntityName: row["Registered Entity Name"]?.trim(),
          website: row["Website"]?.trim(),
          address: row["Address"]?.trim(),
          city: row["City"]?.trim(),
          state: "Goa",
          country: "India",
          about: row["About"]?.trim(),
          latitude: row["Latitude"]?.trim()
            ? parseFloat(row["Latitude"]?.trim())
            : undefined,
          longitude: row["Longitude"]?.trim()
            ? parseFloat(row["Longitude"]?.trim())
            : undefined,
          googleMap: row["Google Map"]?.trim(),
          ratings: row["Ratings"]?.trim()
            ? parseFloat(row["Ratings"]?.trim())
            : 0,
          totalReviews: row["Total Reviews"]?.trim()
            ? parseInt(row["Total Reviews"]?.trim())
            : 0,
        };

        // Add only if businessId and companyName exist
        if (cafeData.businessId && cafeData.companyName) {
          validEntries.push(cafeData);
        }
      })
      .on("end", async () => {
        // Upsert each entry (insert if not exists, update if exists)
        const results = await Promise.all(
          validEntries.map((entry) =>
            Cafe.findOneAndUpdate(
              { businessId: entry.businessId },
              { $set: entry },
              { upsert: true, new: true }
            )
          )
        );

        return res.status(200).json({
          message: `${results.length} cafes processed successfully`,
          data: results,
        });
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};

export const uploadCafeImage = async (req, res, next) => {
  try {
    const file = req.file;
    const { type, cafeId } = req.body;
    if (type?.toLowerCase() === "logo") {
      const cafe = await Cafe.findOne({ _id: cafeId }).exec();
      if (!cafe) {
        return res.status(404).json({ message: "No such company found" });
      }
      try {
        const response = await uploadFileToS3(
          `nomads/cafe/${cafe?.companyName}/logo/${file?.originalName}`,
          file
        );
        cafe.logo = response;
        await cafe.save({ validateBeforeSave: false });
        return res
          .status(400)
          .json({ message: "Successfully uploaded cafe logo" });
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Failed to upload image to S3" });
      }
    }
  } catch (error) {
    next(error);
  }
};
