import { Readable } from "stream"; // corrected typo from "steam"
import csvParser from "csv-parser";
import HostelPointOfContact from "../../models/hostels/PointOfContact.js";
import Hostels from "../../models/hostels/Hostel.js";

export const bulkInsertHostelPointOfContact = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Please provide a valid CSV file" });
    }

    const hostels = await Hostels.find().lean().exec();
    const hostelMap = new Map(hostels.map((hostel) => [hostel.businessId, hostel._id]));

    const pointOfContacts = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();

        const hostelId = hostelMap.get(businessId);
        if (!hostelId) return; // Skip if hostel not found

        const contact = {
          hostel: hostelId,
          name: row["POC Name"]?.trim(),
          designation: row["POC Designation"]?.trim(),
          email: row["Email"]?.trim(),
          phone: row["Phone Number"]?.trim(),
          linkedInProfile: row["LinkedIn Profile"]?.trim(),
          languagesSpoken: row["Languages"]
            ? row["Languages"].split(",").map((lang) => lang.trim())
            : [],
          address: row["Address"]?.trim(),
          profileImage: row["POC Image"]?.trim(),
          availibilityTime: row["Availibility time"]?.trim(),
        };

        pointOfContacts.push(contact);
      })
      .on("end", async () => {
        if (pointOfContacts.length === 0) {
          return res.status(400).json({ message: "No valid data found in CSV." });
        }

        await HostelPointOfContact.insertMany(pointOfContacts);
        return res.status(200).json({ message: "POC data uploaded successfully." });
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
