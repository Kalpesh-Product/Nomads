import HostelUnits from "../../models/hostels/Unit.js";
import Hostels from "../../models/hostels/Hostel.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertHostelUnits = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const hostels = await Hostels.find().lean().exec();
    const hostelMap = new Map(
      hostels.map((hostel) => [hostel.businessId, hostel._id])
    );

    const units = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();
        const hostelId = hostelMap.get(businessId);

        if (!hostelId) return; // Skip rows with invalid Business ID

        const unitList =
          row["All Units"]?.split(",").map((unit) => unit.trim()) || [];

        if (unitList.length > 0) {
          units.push({
            hostel: hostelId,
            units: unitList,
          });
        }
      })
      .on("end", async () => {
        if (units.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid hostel unit entries found in CSV." });
        }

        await HostelUnits.insertMany(units);
        res.status(201).json({
          message: `${units.length} hostel unit records inserted successfully.`,
        });
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
