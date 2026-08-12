import { Readable } from "stream";
import csvParser from "csv-parser";
import * as yup from "yup";
import VisaSupport from "../models/VisaSupport.js";
import VisaSupportPartner from "../models/VisaSupportPartner.js";

const visaSupportSchema = yup.object({
  visaType: yup.string().trim().required("Visa type is required"),
  fullName: yup.string().trim().required("Full name is required"),
  nationality: yup.string().trim().required("Nationality is required"),
  travellingCountry: yup
    .string()
    .trim()
    .required("Travelling country is required"),
  email: yup
    .string()
    .trim()
    .email("Please provide a valid email")
    .required("Email is required"),
  contactCode: yup.string().trim().required("Contact code is required"),
  contactNumber: yup.string().trim().required("Contact number is required"),
  comments: yup.string().trim().default(""),
});

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

const normalizeKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const normalizeRow = (row = {}) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      String(key || "")
        .replace(/\uFEFF/g, "")
        .trim(),
      normalizeString(value),
    ]),
  );

const readVisaSupportPartnerRows = (file) =>
  new Promise((resolve, reject) => {
    const rows = [];

    Readable.from(file.buffer.toString("utf-8").trim())
      .pipe(csvParser())
      .on("data", (rawRow) => {
        const row = normalizeRow(rawRow);
        const hasAnyValue = Object.values(row).some(
          (value) => value !== undefined && value !== null && value !== "",
        );

        if (hasAnyValue) rows.push(row);
      })
      .on("end", () => resolve(rows))
      .on("error", reject);
  });

const getAgentValue = (row, agentNumber, field) => {
  const candidateKeys = {
    name: [`Agent ${agentNumber} name`],
    website: [`Agent ${agentNumber} Website`],
    email: [`Agent ${agentNumber} Email`],
    contact: [
      `Agent ${agentNumber} Contact`,
      `Agent ${agentNumber} Phone`,
    ],
  };

  return (
    candidateKeys[field]
      ?.map((key) => row[key])
      .find((value) => String(value || "").trim()) || ""
  );
};

const buildPartnersFromRow = (row) => {
  const partners = [];

  for (let agentNumber = 1; agentNumber <= 8; agentNumber += 1) {
    const partner = {
      agentNumber,
      name: getAgentValue(row, agentNumber, "name"),
      website: getAgentValue(row, agentNumber, "website"),
      email: getAgentValue(row, agentNumber, "email"),
      contact: getAgentValue(row, agentNumber, "contact"),
    };

    const hasAnyPartnerValue = Object.entries(partner).some(
      ([key, value]) => key !== "agentNumber" && String(value || "").trim(),
    );

    if (hasAnyPartnerValue) partners.push(partner);
  }

  return partners;
};

export const createVisaSupport = async (req, res, next) => {
  try {
    const payload = await visaSupportSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const visaSupport = await VisaSupport.create(payload);

    return res.status(201).json({
      message: "Visa support request submitted successfully",
      data: visaSupport,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.errors[0] });
    }

    return next(error);
  }
};

export const getVisaSupportRequests = async (req, res, next) => {
  try {
    const requests = await VisaSupport.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Visa support requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    return next(error);
  }
};

export const importVisaSupportPartnersCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          "Please upload a CSV file using form-data field visa-support-partners-file.",
      });
    }

    const rows = await readVisaSupportPartnerRows(req.file);
    const operations = [];
    const skippedRows = [];

    rows.forEach((row, index) => {
      const country = String(row.Country || "").trim();
      const city = String(row.City || "").trim();
      const partners = buildPartnersFromRow(row);

      if (!country || !city || !partners.length) {
        skippedRows.push({
          row: index + 2,
          country,
          city,
          reason:
            !country || !city
              ? "Country and City are required"
              : "No partner data found",
        });
        return;
      }

      const normalizedCountry = normalizeKey(country);
      const normalizedCity = normalizeKey(city);

      operations.push({
        updateOne: {
          filter: { normalizedCountry, normalizedCity },
          update: {
            $set: {
              country,
              city,
              normalizedCountry,
              normalizedCity,
              partners,
            },
          },
          upsert: true,
        },
      });
    });

    if (!operations.length) {
      return res.status(400).json({
        message: "No valid visa support partner rows found in CSV.",
        skippedRows,
      });
    }

    const result = await VisaSupportPartner.bulkWrite(operations, {
      ordered: false,
    });

    return res.status(201).json({
      message: "Visa support partners imported successfully",
      processedRows: rows.length,
      importedRows: operations.length,
      skippedRowsCount: skippedRows.length,
      skippedRows,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
    });
  } catch (error) {
    return next(error);
  }
};

export const getVisaSupportPartners = async (req, res, next) => {
  try {
    const { country, city } = req.query;
    const query = {};

    if (country) query.normalizedCountry = normalizeKey(country);
    if (city) query.normalizedCity = normalizeKey(city);

    const partners = await VisaSupportPartner.find(query)
      .sort({ country: 1, city: 1 })
      .lean();

    return res.status(200).json({
      message: "Visa support partners fetched successfully",
      data: partners,
    });
  } catch (error) {
    return next(error);
  }
};
