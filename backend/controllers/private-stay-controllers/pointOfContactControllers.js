import PrivateStayPointOfContact from "../../models/private-stay/PointOfContact.js";
import PrivateStay from "../../models/private-stay/PrivateStay.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

export const bulkInsertPrivateStayPointOfContact = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const privateStays = await PrivateStay.find().lean();
    const privateStayMap = new Map(
      privateStays.map((stay) => [stay.businessId?.trim(), stay._id])
    );

    const pocs = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessName = row["Business Name"]?.trim();
        const privateStayId = privateStayMap.get(businessName);

        if (!privateStayId) {
          console.warn(`No PrivateStay found for business: ${businessName}`);
          return;
        }

        const languages =
          row["Languages"]?.split(",").map((lang) => lang.trim()) ||
          row["Languages"]?.trim();

        const pocData = {
          privateStay: privateStayId,
          name: row["POC Name"]?.trim(),
          image: row["POC Image"]?.trim(),
          designation: row["POC Designation"]?.trim(),
          email: row["Email"]?.trim().toLowerCase(),
          phoneNumber: row["Phone Number"]?.trim(),
          linkedInProfile: row["LinkedIn Profile"]?.trim(),
          languages,
          address: row["Address"]?.trim(),
          availabilityTime: row["Availibility time"]?.trim(),
        };

        // Basic validation
        if (pocData.name && pocData.email && privateStayId) {
          pocs.push(pocData);
        }
      })
      .on("end", async () => {
        if (pocs.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid POC data found in CSV." });
        }

        await PrivateStayPointOfContact.insertMany(pocs);
        res
          .status(201)
          .json({ message: `${pocs.length} POCs inserted successfully.` });
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
