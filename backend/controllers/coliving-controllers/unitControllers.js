import ColivingUnits from "../../models/coliving/Units.js";
import ColivingCompany from "../../models/coliving/ColivingCompany.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertUnits = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid csv file" });
    }

    // Map businessId to _id from ColivingCompany
    const colivingClients = await ColivingCompany.find().lean().exec();
    const colivingClientsMap = new Map(
      colivingClients.map((client) => [client.businessId, client._id])
    );

    const unitsToInsert = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessIdStr = row["Business ID"]?.trim();
        const businessName = row["Business Name"]?.trim();
        const allUnits = row["All Units"]?.trim();

        const colivingId = colivingClientsMap.get(businessIdStr);

        if (colivingId && businessName && allUnits) {
          unitsToInsert.push({
            businessId: colivingId,
            businessName: businessName,
            allUnits: allUnits?.split(",")?.length
              ? allUnits?.split(",").map((unit) => unit?.trim())
              : allUnits,
          });
        }
      })
      .on("end", async () => {
        try {
          const inserted = await ColivingUnits.insertMany(unitsToInsert);
          res.status(200).json({
            message: `${inserted.length} units inserted successfully.`,
          });
        } catch (insertErr) {
          next(insertErr);
        }
      })
      .on("error", (parseErr) => {
        next(parseErr);
      });
  } catch (error) {
    next(error);
  }
};
