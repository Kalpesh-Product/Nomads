import Cafe from "../../models/cafe/Cafe.js";
import CafeInclusions from "../../models/cafe/Inclusions.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertCafeInclusions = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const allCafe = await Cafe.find().lean().exec();
    const cafeMap = new Map(allCafe.map((cafe) => [cafe.businessId, cafe._id]));

    const cafeInclusions = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"];
        const cafeId = cafeMap.get(businessId);

        if (!cafeId) return; // Skip if no matching Cafe found

        // Normalize keys from CSV to match schema fields
        const inclusion = {
          cafe: cafeId,
          airCondition: toBoolean(row["Air Condition"]),
          wifi: toBoolean(row["Wife"]), // Assuming typo in header "Wife" = "Wifi"
          secure: toBoolean(row["Secure"]),
          community: toBoolean(row["Community"]),
          gamingZone: toBoolean(row["Gaming Zone"]),
          furnishedOffice: toBoolean(row["Furnished Office"]),
          stationery: toBoolean(row["Stationery"]),
          library: toBoolean(row["Library"]),
          parking: toBoolean(row["Parking"]),
          privateStorage: toBoolean(row["Private Storage"]),
          freeLoungeAccess: toBoolean(row["Free lounge access"]),
          dailyCleaning: toBoolean(row["Daily cleaning"]),
          waterfront: toBoolean(row["Waterfront"]),
          tv: toBoolean(row["TV"]),
        };

        cafeInclusions.push(inclusion);
      })
      .on("end", async () => {
        if (cafeInclusions.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid entries found in the CSV." });
        }

        await CafeInclusions.insertMany(cafeInclusions);
        res.status(200).json({
          message: "Cafe inclusions inserted successfully",
          count: cafeInclusions.length,
        });
      })
      .on("error", (error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

// Helper to convert various truthy values to Boolean
function toBoolean(value) {
  if (typeof value === "string") {
    const val = value.trim().toLowerCase();
    return val === "yes" || val === "true" || val === "1";
  }
  return Boolean(value);
}

