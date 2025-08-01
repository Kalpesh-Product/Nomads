import PointOfContact from "../models/PointOfContact.js";
import Company from "../models/Company.js";
import { Readable } from "stream";
import csvParser from "csv-parser";
import * as yup from "yup";

export const createNewPointOfContact = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      company: yup.string().required("Please provide the company object ID"),
      name: yup
        .string()
        .min(1, "Please provide your name")
        .required("Please provide your name"),
      designation: yup.string().nullable(),
      email: yup.string().email("Please provide a valid email"),
      phone: yup.string().required("Please provide a POC phone number"),
      languagesSpoken: yup.array().of(yup.string()).nullable(),
      address: yup.string().nullable(),
      isActive: yup.boolean().nullable(),
    });

    // Validate the request body
    const validatedData = await schema.validate(req.body, {
      abortEarly: false,
    });

    // Create and save the PointOfContact
    const newPOC = new PointOfContact(validatedData);
    await newPOC.save();

    res.status(201).json({
      success: true,
      message: "Point of contact created successfully",
      data: newPOC,
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const getPoc = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const poc = await PointOfContact.findOne({
      company: companyId,
      isActive: true,
    })
      .lean()
      .exec();
    if (!poc) {
      return res.status(400).json({ message: "No POC found for the company" });
    }
    return res.status(200).json(poc);
  } catch (error) {
    next(error);
  }
};

export const deactivatePoc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const poc = await PointOfContact.findOne({
      _id: id,
    }).exec();
    if (!poc) {
      return res.status(400).json({
        message: "The POC dosen't exist",
      });
    }
    if (poc.isActive) {
      return res.status(400).json({ message: "POC is already deactivated" });
    }
    poc.isActive = false;
    await poc.save({ validateBeforeSave: false });
    return res.status(200).json({
      message: `POC ${poc.firstName} ${poc.lastName} deactivated successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkInsertPoc = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    // Get all companies to map Business ID to _id
    const companies = await Company.find().lean().exec();
    const companyMap = new Map(
      companies.map((company) => [company.businessId, company._id.toString()])
    );

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    const pocArray = [];

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const businessId = row["Business ID"]?.trim();
        const companyId = companyMap.get(businessId);

        if (companyId) {
          const poc = {
            company: companyId,
            name: row["POC Name"]?.trim(),
            designation: row["POC Designation"]?.trim(),
            email: row["Email"]?.trim(),
            phone: row["Phone"]?.trim(),
            linkedInProfile: row["LinkedIn Profile"]?.trim() || null,
            languagesSpoken: row["Languages"]
              ? row["Languages"]?.split(",").map((lang) => lang.trim())
              : [],
            address: row["Address"]?.trim() || null,
            availibilityTime: row["Availibility time"]?.trim() || null,
          };
          pocArray.push(poc);
        }
      })
      .on("end", async () => {
        try {
          const inserted = await PointOfContact.insertMany(pocArray, {
            ordered: false, // allow partial insert
          });

          const insertedCount = inserted.length;
          const failedCount = pocArray.length - insertedCount;

          res.status(200).json({
            message: "POC bulk insert completed",
            total: pocArray.length,
            inserted: insertedCount,
            failed: failedCount,
          });
        } catch (insertError) {
          if (insertError.name === "BulkWriteError") {
            const insertedCount = insertError.result?.nInserted || 0;
            const failedCount = pocArray.length - insertedCount;

            res.status(200).json({
              message: "POC bulk insert completed with partial failure",
              total: pocArray.length,
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
              message: "Unexpected error during POC bulk insert",
              error: insertError.message,
            });
          }
        }
      });
  } catch (error) {
    next(error);
  }
};
