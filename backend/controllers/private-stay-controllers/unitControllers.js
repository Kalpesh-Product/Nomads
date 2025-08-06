import PrivateStayUnit from "../../models/private-stay/Units.js";
import PrivateStay from "../../models/private-stay/PrivateStay.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertPrivateStayUnits = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const units = [];

    // Get all private stays to map businessId to _id
    const privateStays = await PrivateStay.find().lean();
    const privateStayMap = new Map(
      privateStays.map((company) => [company.businessId?.trim(), company._id])
    );

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();
        const privateStayId = privateStayMap.get(businessId);

        if (!privateStayId) return; // Skip if no match found

        const rawTypes = row["Type"] || "";
        const allUnits = rawTypes
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t); // Remove empty strings

        if (allUnits.length === 0) return; // Skip rows with no valid types

        units.push({
          privateStay: privateStayId,
          allUnits,
        });
      })
      .on("end", async () => {
        try {
          if (units.length === 0) {
            return res
              .status(400)
              .json({ message: "No valid unit data found in CSV." });
          }

          const result = await PrivateStayUnit.insertMany(units);
          res.status(200).json({
            message: `${result.length} private stay units inserted successfully.`,
            insertedCount: result.length,
          });
        } catch (error) {
          next(error);
        }
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
