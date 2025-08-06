import ColivingPointOfContact from "../../models/coliving/PointOfContact.js";
import { Readable } from "stream";
import csvParser from "csv-parser";
import ColivingCompany from "../../models/coliving/ColivingCompany.js";

export const bulkInsertColivingPointOfContact = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const colivingCompanies = await ColivingCompany.find().lean().exec();
    const colivingCompaniesMap = new Map(
      colivingCompanies.map((company) => [company.businessId, company._id])
    );

    const contacts = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();
        const colivingCompanyId = colivingCompaniesMap.get(businessId);

        if (!colivingCompanyId) return;

        const languages = row["Languages"]
          ?.split(",")
          .map((lang) => lang.trim())
          .filter(Boolean);

        contacts.push({
          colivingCompany: colivingCompanyId,
          name: row["POC Name"]?.trim(),
          profileImage: row["POC Image"]?.trim() || "",
          designation: row["POC Designation"]?.trim(),
          email: row["Email"]?.trim() || "",
          phone: row["Phone Number"]?.trim() || "",
          linkedInProfile: row["LinkedIn Profile"]?.trim() || "",
          languagesSpoken: languages,
          address: row["Address"]?.trim(),
          availabilityTime: row["Availibility time"]?.trim() || "",
        });
      })
      .on("end", async () => {
        if (contacts.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid contacts found to insert." });
        }

        await ColivingPointOfContact.insertMany(contacts);
        res
          .status(200)
          .json({
            message: "POC records inserted successfully",
            count: contacts.length,
          });
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
