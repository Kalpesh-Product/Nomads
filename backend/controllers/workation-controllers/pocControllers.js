import Workation from "../../models/workations/Workations.js";
import PointOfContact from "../../models/workations/PointOfContact.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertWorkationPoc = async (req, res, next) => {
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

    const pocs = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const {
          "Business ID": businessId,
          "POC Name": name,
          "POC Designation": designation,
          Email: email,
          "Phone Number": phone,
          "LinkedIn Profile": linkedInProfile,
          Languages: languagesSpoken,
          Address: address,
          "Availibility time": availibilityTime,
        } = row;

        const coworkingCompanyId = workationMap.get(businessId?.trim());

        if (!coworkingCompanyId) {
          return;
        }

        const poc = {
          workation: coworkingCompanyId,
          name,
          designation,
          email,
          phone,
          linkedInProfile,
          languagesSpoken: languagesSpoken
            ? languagesSpoken
                ?.trim()
                ?.split(",")
                ?.map((items) => items.trim())
            : [],
          address,
          availibilityTime,
          isActive: true,
        };

        pocs.push(poc);
      })
      .on("end", async () => {
        try {
          if (pocs.length === 0) {
            return res
              .status(400)
              .json({ message: "No valid records to insert." });
          }
          const inserted = await PointOfContact.insertMany(pocs);
          res.status(201).json({
            message: `Successfully inserted ${inserted.length} point(s) of contact.`,
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
