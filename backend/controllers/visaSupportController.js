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

const getRowValue = (row, keys = []) =>
  keys
    .map((key) => row[key])
    .find((value) => String(value || "").trim()) || "";

const parseNumber = (value) => {
  const cleaned = String(value ?? "").replace(/,/g, "").trim();
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

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

const buildVisaSupportPartnerFromRow = (row) => {
  const country = String(getRowValue(row, ["Country"]) || "").trim();
  const destination = String(
    getRowValue(row, ["Destination", "City"]) || "",
  ).trim();
  const company = String(
    getRowValue(row, ["Company", "Company "]) || "",
  ).trim();

  return {
    srNo: parseNumber(getRowValue(row, ["Sr No", "Sr No."])),
    continent: String(getRowValue(row, ["Continent"]) || "").trim(),
    country,
    destination,
    visaType: String(getRowValue(row, ["Visa Type"]) || "").trim(),
    company,
    agentName: String(getRowValue(row, ["Agent Name"]) || "").trim(),
    website: String(getRowValue(row, ["Website"]) || "").trim(),
    contact: String(getRowValue(row, ["Contact", "Phone"]) || "").trim(),
    email: String(getRowValue(row, ["Email"]) || "").trim().toLowerCase(),
    address: String(getRowValue(row, ["Address"]) || "").trim(),
    rating: parseNumber(getRowValue(row, ["Rating"])),
    googleReviews: parseNumber(
      getRowValue(row, ["Google Reviews", "Google Reviews "]),
    ),
    status: "Active",
    normalizedCountry: normalizeKey(country),
    normalizedDestination: normalizeKey(destination),
    normalizedCompany: normalizeKey(company),
  };
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
      const partner = buildVisaSupportPartnerFromRow(row);

      if (!partner.country || !partner.destination || !partner.company) {
        skippedRows.push({
          row: index + 2,
          country: partner.country,
          destination: partner.destination,
          company: partner.company,
          reason:
            !partner.country || !partner.destination
              ? "Country and Destination are required"
              : "Company is required",
        });
        return;
      }

      operations.push({
        updateOne: {
          filter: {
            normalizedCountry: partner.normalizedCountry,
            normalizedDestination: partner.normalizedDestination,
            normalizedCompany: partner.normalizedCompany,
            email: partner.email,
            contact: partner.contact,
          },
          update: {
            $set: partner,
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

    await VisaSupportPartner.collection
      .dropIndex("normalizedCountry_1_normalizedCity_1")
      .catch((error) => {
        if (error?.codeName !== "IndexNotFound" && error?.code !== 27) {
          throw error;
        }
      });

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
    const { country, destination, city } = req.query;
    const query = {
      normalizedDestination: { $exists: true, $ne: "" },
      normalizedCompany: { $exists: true, $ne: "" },
    };

    if (country) query.normalizedCountry = normalizeKey(country);
    if (destination || city) {
      query.normalizedDestination = normalizeKey(destination || city);
    }

    const partners = await VisaSupportPartner.find(query)
      .sort({ continent: 1, country: 1, destination: 1, company: 1 })
      .lean();

    return res.status(200).json({
      message: "Visa support partners fetched successfully",
      data: partners,
    });
  } catch (error) {
    return next(error);
  }
};
