import PointOfContact from "../models/PointOfContact.js";
import { Readable } from "stream";
import csvParser from "csv-parser";
import Company from "../models/Company.js";

export const bulkInsertPoc = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const companies = await Company.find().lean();
    const companyMap = new Map(
      companies.map((item) => [item.businessId?.trim(), item._id])
    );

    const pocs = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();
        const companyId = companyMap.get(businessId);

        if (!companyId) {
          console.warn(`No PrivateStay found for business: ${businessId}`);
          return;
        }

        const languages =
          row["Languages"]?.split(",").map((lang) => lang.trim()) ||
          row["Languages"]?.trim();

        const pocData = {
          company: companyId,
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
        pocs.push(pocData);
      })
      .on("end", async () => {
        console.log(pocs);
        if (pocs.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid POC data found in CSV." });
        }

        await PointOfContact.insertMany(pocs);
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

export const createPOC = async (req, res, next) => {
  try {
    const payload = req.body;

    const pocData = {
      name: payload?.name,
      companyId: payload?.companyId,
      designation: payload?.designation,
      email: payload?.email,
      phone: payload?.phone,
      linkedInProfile: payload?.linkedInProfile,
      languagesSpoken: payload?.languages || [],
      address: payload?.address,
      profileImage: payload?.profileImage,
      isActive: payload?.isActive ?? true,
      availibilityTime: payload?.availibilityTime,
    };

    const poc = await PointOfContact.findOne({ email: payload.email });

    if (poc) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newPOC = new PointOfContact(pocData);
    const savedPOC = await newPOC.save();

    return res.status(201).json({
      success: true,
      message: "Point of Contact created successfully",
      data: savedPOC,
    });
  } catch (error) {
    next(error);
  }
};

export const getPocDetails = async (req, res, next) => {
  try {
    const { companyId } = req.query;

    const pocDetails = await PointOfContact.find({ companyId });

    if (!pocDetails) {
      return res.status(400).json({ message: "No POC details found" });
    }

    return res.status(200).json(pocDetails);
  } catch (error) {
    next(error);
  }
};
