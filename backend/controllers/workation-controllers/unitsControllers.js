import Workation from "../../models/workations/Workations.js";
import WorkationUnits from "../../models/workations/Units.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertWorkationUnits = async (req, res, next) => {
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

    const units = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const workationId = workationMap.get(row["Business ID"]?.trim());
        const unit = {
          workation: workationId,
          allUnits: row["Type"]
            ? row["Type"]?.split(",").map((item) => item?.trim())
            : [],
        };
        units.push(unit);
      })
      .on("end", async () => {
        try {
          // Check for duplicates based on businessId
          const businessIds = workations.map((w) => w.businessId);
          const existing = await Workation.find({
            businessId: { $in: businessIds },
          });
          const existingIds = new Set(existing.map((e) => e.businessId));

          const toInsert = units.filter((w) => !existingIds.has(w.businessId));

          if (toInsert.length === 0) {
            return res
              .status(409)
              .json({ message: "All workations already exist." });
          }

          const inserted = await WorkationUnits.insertMany(toInsert);
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
