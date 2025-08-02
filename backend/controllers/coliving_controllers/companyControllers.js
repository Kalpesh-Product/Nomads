import ColivingCompany from "../../models/coliving/ColivingCompany.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertColivingCompanies = async (req, res, next) => {
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
        // Extract only schema-relevant fields
        const entry = {
          businessId: row["Business ID"]?.trim(),
          name: row["Business Name"]?.trim(),
          registeredEntityName: row["Registered Entity Name"]?.trim(),
          website: row["Website"]?.trim(),
          address: row["Address"]?.trim(),
          city: row["City"]?.trim(),
          state: row["State"]?.trim(), 
          country: row["Country"]?.trim(),
          about: row["About"]?.trim(),
          latitude: parseFloat(row["latitude"]) || undefined,
          longitude: parseFloat(row["longitude"]) || undefined,
          googleMap: row["Google map"]?.trim(),
        };

        if (entry.businessId && entry.name) {
          validEntries.push(entry);
        }
      })
      .on("end", async () => {
        try {
          const result = await ColivingCompany.insertMany(validEntries, {
            ordered: false,
          });
          res.status(200).json({
            message: `${result.length} companies inserted successfully.`,
          });
        } catch (insertError) {
          next(insertError);
        }
      });
  } catch (error) {
    next(error);
  }
};
