import { Readable } from "stream";
import csvParser from "csv-parser";
import * as yup from "yup";
import ConsultationSupportPartner from "../models/ConsultationSupportPartner.js";

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

const readConsultationSupportPartnerRows = (file) =>
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

const buildConsultationSupportPartnerFromRow = (row) => {
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
    supportProviding: String(
      getRowValue(row, ["Support Providing", "Support Required"]) || "",
    ).trim(),
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

const nullableNumber = () =>
  yup.number().nullable().transform((value, originalValue) => {
    if (
      originalValue === "" ||
      originalValue === null ||
      originalValue === undefined
    ) {
      return null;
    }

    return Number.isFinite(value) ? value : null;
  });

const editableConsultationSupportPartnerSchema = yup.object({
  srNo: nullableNumber(),
  continent: yup.string().trim().default(""),
  country: yup.string().trim().required("Country is required"),
  destination: yup.string().trim().required("Destination is required"),
  supportProviding: yup.string().trim().default(""),
  company: yup.string().trim().required("Company is required"),
  agentName: yup.string().trim().default(""),
  website: yup.string().trim().default(""),
  contact: yup.string().trim().default(""),
  email: yup.string().trim().email("Please provide a valid email").default(""),
  address: yup.string().trim().default(""),
  rating: nullableNumber(),
  googleReviews: nullableNumber(),
  status: yup.string().trim().default("Active"),
});

const buildEditableConsultationSupportPartnerPayload = async (body = {}) => {
  const payload = await editableConsultationSupportPartnerSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    ...payload,
    email: String(payload.email || "").trim().toLowerCase(),
    normalizedCountry: normalizeKey(payload.country),
    normalizedDestination: normalizeKey(payload.destination),
    normalizedCompany: normalizeKey(payload.company),
  };
};

export const importConsultationSupportPartnersCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          "Please upload a CSV file using form-data field consultation-support-partners-file.",
      });
    }

    const rows = await readConsultationSupportPartnerRows(req.file);
    const operations = [];
    const skippedRows = [];

    rows.forEach((row, index) => {
      const partner = buildConsultationSupportPartnerFromRow(row);

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
        message: "No valid consultation support partner rows found in CSV.",
        skippedRows,
      });
    }

    const result = await ConsultationSupportPartner.bulkWrite(operations, {
      ordered: false,
    });

    return res.status(201).json({
      message: "Consultation support partners imported successfully",
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

export const getConsultationSupportPartners = async (req, res, next) => {
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

    const partners = await ConsultationSupportPartner.find(query)
      .sort({ continent: 1, country: 1, destination: 1, company: 1 })
      .lean();

    return res.status(200).json({
      message: "Consultation support partners fetched successfully",
      data: partners,
    });
  } catch (error) {
    return next(error);
  }
};

export const getConsultationSupportPartnerById = async (req, res, next) => {
  try {
    const partner = await ConsultationSupportPartner.findById(
      req.params.partnerId,
    ).lean();

    if (!partner) {
      return res
        .status(404)
        .json({ message: "Consultation support partner not found" });
    }

    return res.status(200).json({
      message: "Consultation support partner fetched successfully",
      data: partner,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateConsultationSupportPartner = async (req, res, next) => {
  try {
    const payload = await buildEditableConsultationSupportPartnerPayload(
      req.body,
    );
    const partner = await ConsultationSupportPartner.findByIdAndUpdate(
      req.params.partnerId,
      { $set: payload },
      { new: true, runValidators: true },
    ).lean();

    if (!partner) {
      return res
        .status(404)
        .json({ message: "Consultation support partner not found" });
    }

    return res.status(200).json({
      message: "Consultation support partner updated successfully",
      data: partner,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.errors[0] });
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "A consultation support partner with the same country, destination, company, email, and contact already exists.",
      });
    }

    return next(error);
  }
};
