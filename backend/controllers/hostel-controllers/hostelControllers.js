import Hostels from "../../models/hostels/Hostel.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertHostels = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const hostels = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        // Clean and map data
        const hostel = {
          businessId: row["Business ID"]?.trim(),
          companyName: row["Business Name"]?.trim(),
          registeredEntityName: row["Registered Entity Name"]?.trim(),
          website: row["Website"]?.trim(),
          address: row["Address"]?.trim(),
          city: row["City"]?.trim(),
          about: row["About"]?.trim(),
          latitude: row["Latitude"] ? parseFloat(row["Latitude"]) : undefined,
          longitude: row["Longitude"]
            ? parseFloat(row["Longitude"])
            : undefined,
          googleMap: row["Google Map"]?.trim(),
          ratings: row["Ratings"] ? parseFloat(row["Ratings"]) : undefined,
          totalReviews: row["Total Reviews"]
            ? parseInt(row["Total Reviews"])
            : 0,
        };

        hostels.push(hostel);
      })
      .on("end", async () => {
        try {
          const result = await Hostels.insertMany(hostels);
          res.status(200).json({
            message: `${result.length} hostels inserted successfully`,
            data: result,
          });
        } catch (insertError) {
          next(insertError);
        }
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
