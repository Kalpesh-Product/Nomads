import PrivateStay from "../../models/private-stay/PrivateStay.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertPrivateStay = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const privateStayList = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const {
          "Business ID": businessId,
          "Business Name": companyName,
          "Registered Entity Name": registeredEntityName,
          Website: website,
          Logo: logo,
          Images: images,
          Address: address,
          City: city,
          State: state,
          Country: country,
          About: about,
          latitude,
          longitude,
          "Google map": googleMap,
          Ratings: ratings,
          "Total Reviews": totalReviews,
        } = row;

        // Only include fields that exist in the schema
        privateStayList.push({
          businessId: businessId?.trim(),
          companyName: companyName?.trim(),
          registeredEntityName: registeredEntityName?.trim(),
          website: website?.trim(),
          address: address?.trim(),
          city: city?.trim(),
          about: about?.trim(),
          state: state?.trim(),
          country: country?.trim(),
          latitude: parseFloat(latitude) || undefined,
          longitude: parseFloat(longitude) || undefined,
          googleMap: googleMap?.trim(),
          ratings: parseFloat(ratings) || undefined,
          totalReviews: parseInt(totalReviews) || undefined,
        });
      })
      .on("end", async () => {
        try {
          // Optional: remove duplicates based on businessId
          const bulkOps = privateStayList.map((entry) => ({
            updateOne: {
              filter: { businessId: entry.businessId },
              update: { $set: entry },
              upsert: true, // Insert if not found
            },
          }));

          await PrivateStay.bulkWrite(bulkOps);

          res.status(200).json({
            message: `${privateStayList.length} records processed successfully.`,
          });
        } catch (err) {
          next(err);
        }
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
