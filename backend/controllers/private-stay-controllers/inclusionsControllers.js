import PrivateStayInclusions from "../../models/private-stay/Inclusions.js";
import PrivateStay from "../../models/private-stay/PrivateStay.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertPrivateStayInclusions = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const inclusions = [];

    // Get all private stays to map businessId to _id
    const privateStays = await PrivateStay.find().lean();
    const privateStayMap = new Map(
      privateStays.map((stay) => [stay.businessId?.trim(), stay._id])
    );

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();
        const privateStayId = privateStayMap.get(businessId);

        if (!privateStayId) return;

        const inclusion = {
          privateStay: privateStayId,
          swimmingPool: row["Swimming pool"]?.trim().toLowerCase() === "yes",
          kidsPool: row["Kids Pool"]?.trim().toLowerCase() === "yes",
          lift: row["Lift"]?.trim().toLowerCase() === "yes",
          wifi: row["Wifi"]?.trim().toLowerCase() === "yes",
          lawn: row["Lawn"]?.trim().toLowerCase() === "yes", 
          powerBackup: row["Power backup"]?.trim().toLowerCase() === "yes",
          airConditioning:
            row["Air conditioning"]?.trim().toLowerCase() === "yes",
          parking: row["Parking"]?.trim().toLowerCase() === "yes", // Note: extra space
          laundryService:
            row["Laundry Service"]?.trim().toLowerCase() === "yes", // Note: extra space
          tv: row["TV"]?.trim().toLowerCase() === "yes",
          roomService: row["Room Service"]?.trim().toLowerCase() === "yes", // Note: extra space
          refrigerator: row["Refrigerator"]?.trim().toLowerCase() === "yes", // Note: extra space
          ironIroningBoard:
            row["Iron/Ironing Board"]?.trim().toLowerCase() === "yes",
          gym: row["Gym"]?.trim().toLowerCase() === "yes",
          privateBathroom: row["Private Bathroom"] === "yes",
          workdesk: row["Workdesk"]?.trim().toLowerCase() === "yes",
          balcony: row["Balcony"]?.trim().toLowerCase() === "yes",
          kitchen: row["Kitchen"]?.trim().toLowerCase() === "yes",
          security: row["Security"]?.trim().toLowerCase() === "yes",
          towelsAndLinen:
            row["Towels and linen"]?.trim().toLowerCase() === "yes",
          conferenceRoom:
            row["Conference Room"]?.trim().toLowerCase() === "yes", // Note: extra space
          spa: row["Spa"]?.trim().toLowerCase() === "yes",
          kitchenette: row["Kitchenette"]?.trim().toLowerCase() === "yes",
          cctv: row["CCTV"]?.trim().toLowerCase() === "yes",
        };

        inclusions.push(inclusion);
      })
      .on("end", async () => {
        if (inclusions.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid inclusions to insert" });
        }

        await PrivateStayInclusions.insertMany(inclusions);
        res.status(200).json({
          message: "Private stay inclusions inserted successfully",
          count: inclusions.length,
        });
      })
      .on("error", (error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};
