import Workation from "../../models/workations/Workations.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertWorkations = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const workations = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const workation = {
          businessId: row["Business ID"],
          companyName: row["Business Name"],
          registeredEntityName: row["Registered Entity name"] || undefined,
          website: row["Website"] || undefined,
          units: parseInt(row["Units"]) || 0,
          address: row["Address"] || undefined,
          city: row["City"] || undefined,
          state: row["State"] || "Goa",
          country: row["Country"] || "India",
          about: row["About"] || undefined,
          latitude: row["latitude"] ? parseFloat(row["latitude"]) : undefined,
          longitude: row["longitude"]
            ? parseFloat(row["longitude"])
            : undefined,
          googleMap: row["Google map"] || undefined,
          ratings: row["Ratings"] ? parseFloat(row["Ratings"]) : undefined,
          totalReviews: row["Total Reviews"]
            ? parseInt(row["Total Reviews"])
            : 0,
          inclusions: row["Inclusions"]
            ? row["Inclusions"].split(",").map((i) => i.trim())
            : [],
        };

        // Only include if required field is present
        if (workation.businessId && workation.companyName) {
          workations.push(workation);
        }
      })
      .on("end", async () => {
        try {
          // Check for duplicates based on businessId
          const businessIds = workations.map((w) => w.businessId);
          const existing = await Workation.find({
            businessId: { $in: businessIds },
          });
          const existingIds = new Set(existing.map((e) => e.businessId));

          const toInsert = workations.filter(
            (w) => !existingIds.has(w.businessId)
          );

          if (toInsert.length === 0) {
            return res
              .status(409)
              .json({ message: "All workations already exist." });
          }

          const inserted = await Workation.insertMany(toInsert);
          res.status(201).json({
            message: `Successfully inserted ${inserted.length} workations.`,
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
