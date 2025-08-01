import Company from "../models/Company.js";
import yup from "yup";
import csvParser from "csv-parser";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

export const addNewCompany = async (req, res, next) => {
  try {
    const {
      businessId,
      companyName,
      registeredEntityName,
      website,
      service,
      logo,
      images,
      address,
      city,
      about,
      totalSeats,
      latitude,
      longitude,
      googleMapLink,
    } = req.body;

    const schema = yup.object().shape({
      companyName: yup.string().required("Please provide your company name"),
      registeredEntityName: yup
        .string()
        .required("Please provide a Registered Entity Name"),
      website: yup.string().optional().url("Please provide a valid url"),
      service: yup.string().required("Please provide your business service"),
      address: yup.string().required("Please provide your address"),
      country: yup.string().required("Please provide your country"),
      state: yup.string().required("Please provide your state"),
      city: yup.string().required("Please provide your city"),
      totalSeats: yup
        .number()
        .min(1, "You must have minimum 1 seat to be registered"),
      latitude: yup.number().required("Please provide your latitude"),
      longitude: yup.number().required("Please provide your longitude"),
      about: yup
        .string()
        .min(1)
        .required("Please provide a brief descriptio about your company"),
      googleMapLink: yup
        .string()
        .required("Please provide you google map location")
        .url("Please provide a valid google map location url"),
    });

    await schema.validate(req.body, { abortEarly: false });

    const existingCompany = await Company.findOne({ businessId });
    if (existingCompany) {
      return res.status(409).json({
        message: "A company with this businessId already exists.",
      });
    }

    const newCompany = new Company({
      businessId,
      companyName,
      registeredEntityName,
      website,
      service,
      logo,
      images,
      address,
      country,
      state,
      city,
      about,
      totalSeats,
      latitude,
      longitude,
      googleMapLink,
    });

    const savedCompany = await newCompany.save();

    res.status(201).json({
      message: "Company added successfully.",
      data: savedCompany,
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        message: error.errors,
        errors: error.errors,
      });
    }
    next(error);
  }
};

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
          service: row["Service"]?.trim() || "Not Provided",
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
          const result = await Company.insertMany(companies);

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
