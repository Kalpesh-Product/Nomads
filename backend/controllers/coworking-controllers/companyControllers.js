import CoworkingCompany from "../../models/coworking/CoworkingCompany.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

export const bulkInsertCompanies = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const companies = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const formatted = {
          businessId: row["Business ID"]?.trim(),
          companyName: row["Business Name"]?.trim(),
          registeredEntityName: row["Registered Entity name"]?.trim(),
          website: row["Website"]?.trim() || null,
          address: row["Address"]?.trim(),
          city: row["City"]?.trim(),
          about: row["About"]?.trim(),
          totalSeats: parseInt(row["Total Seats"]) || null,
          latitude: parseFloat(row["latitude"]?.trim()),
          longitude: parseFloat(row["longitude"]?.trim()),
          googleMapLink: row["Google map"]?.trim(),
        };
        companies.push(formatted);
      })
      .on("end", async () => {
        try {
          const result = await CoworkingCompany.insertMany(companies);

          const insertedCount = result.length;
          const failedCount = companies.length - insertedCount;

          res.status(200).json({
            message: "Bulk insert completed with partial success",
            total: companies.length,
            inserted: insertedCount,
            failed: failedCount,
          });
        } catch (insertError) {
          if (insertError.name === "BulkWriteError") {
            const insertedCount = insertError.result?.nInserted || 0;
            const failedCount = companies.length - insertedCount;

            res.status(200).json({
              message: "Bulk insert completed with partial failure",
              total: companies.length,
              inserted: insertedCount,
              failed: failedCount,
              writeErrors: insertError.writeErrors?.map((e) => ({
                index: e.index,
                errmsg: e.errmsg,
                code: e.code,
                op: e.op,
              })),
            });
          } else {
            res.status(500).json({
              message: "Unexpected error during bulk insert",
              error: insertError.message,
            });
          }
        }
      });
  } catch (error) {
    next(error);
  }
};
