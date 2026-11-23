import mongoose from "mongoose";
import { config } from "dotenv";
import ExcelJS from "exceljs";
import VisaRuleV2 from "../models/VisaRuleV2.js";
import {
  normalizeCountryKey,
  normalizeVisaRequirement,
} from "../controllers/visaRuleController.js";

config({ override: true });

const XLSX_PATH = process.argv[2];
if (!XLSX_PATH) {
  console.error(
    "Usage: node scripts/importVisaRulesV2.js <path-to-WoNo-AI-Algo-2.0.xlsx>",
  );
  process.exit(1);
}

// Sheet headers are like "Egypt (Cairo, Giza)" — VisaRule matches on the
// country itself (see stateWiseWeightV2Controller: normalizeCountryKey(item.country)).
const stripCityList = (label = "") => String(label).replace(/\s*\(.*\)\s*$/, "").trim();

const cellScalar = (cell) => {
  const value = cell.value;
  if (value === null || value === undefined) return value;
  if (typeof value === "object") {
    if (value.result !== undefined) return value.result;
    if (value.text !== undefined) return value.text;
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("");
    }
    return cell.text;
  }
  return value;
};

// Reads an origin(row) x destination(column) matrix sheet into
// [{ origin, destination, value }], skipping self-pairs and blank/N/A cells.
const readMatrixSheet = (worksheet, valueMapper) => {
  const headerRow = worksheet.getRow(1);
  const destinationByCol = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber === 1) return; // "↓ Origin / Destination →" label
    destinationByCol[colNumber] = stripCityList(cellScalar(cell));
  });

  const entries = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const origin = stripCityList(cellScalar(row.getCell(1)));
    if (!origin) return;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber === 1) return;
      const destination = destinationByCol[colNumber];
      if (!destination || destination === origin) return;

      const raw = cellScalar(cell);
      const cleaned = String(raw ?? "").trim();
      if (!cleaned || cleaned.toUpperCase() === "N/A" || cleaned === "-1") return;

      const value = valueMapper(cleaned);
      if (value === undefined || value === null) return;

      entries.push({ origin, destination, value });
    });
  });

  return entries;
};

const parseDurationValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const run = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is required");
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(XLSX_PATH);

  const requirementSheet = workbook.getWorksheet("Visa Type");
  const durationSheet = workbook.getWorksheet("Visa Duration");
  if (!requirementSheet || !durationSheet) {
    throw new Error('Sheets "Visa Type" and "Visa Duration" are both required.');
  }

  const requirementEntries = readMatrixSheet(requirementSheet, (v) =>
    normalizeVisaRequirement(v),
  );
  const durationEntries = readMatrixSheet(durationSheet, parseDurationValue);

  const durationByKey = new Map(
    durationEntries.map((e) => [
      `${normalizeCountryKey(e.origin)}|${normalizeCountryKey(e.destination)}`,
      e.value,
    ]),
  );

  await mongoose.connect(process.env.MONGO_URL);

  const operations = [];
  const seenKeys = new Set();

  for (const entry of requirementEntries) {
    const key = `${normalizeCountryKey(entry.origin)}|${normalizeCountryKey(entry.destination)}`;
    seenKeys.add(key);

    operations.push({
      updateOne: {
        filter: { passport: entry.origin, destination: entry.destination },
        update: {
          $set: {
            passport: entry.origin,
            normalizedPassport: normalizeCountryKey(entry.origin),
            destination: entry.destination,
            normalizedDestination: normalizeCountryKey(entry.destination),
            requirement: entry.value,
            durationDays: durationByKey.get(key) ?? null,
          },
        },
        upsert: true,
      },
    });
  }

  // Duration-only pairs (requirement cell was N/A but duration was given).
  for (const entry of durationEntries) {
    const key = `${normalizeCountryKey(entry.origin)}|${normalizeCountryKey(entry.destination)}`;
    if (seenKeys.has(key)) continue;

    operations.push({
      updateOne: {
        filter: { passport: entry.origin, destination: entry.destination },
        update: {
          $set: {
            passport: entry.origin,
            normalizedPassport: normalizeCountryKey(entry.origin),
            destination: entry.destination,
            normalizedDestination: normalizeCountryKey(entry.destination),
            durationDays: entry.value,
          },
          $setOnInsert: { requirement: "" },
        },
        upsert: true,
      },
    });
  }

  let result = { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
  if (operations.length) {
    result = await VisaRuleV2.bulkWrite(operations, { ordered: false });
  }

  console.log("--- Visa Rules V2 Import Summary ---");
  console.log(`Requirement entries: ${requirementEntries.length}`);
  console.log(`Duration entries: ${durationEntries.length}`);
  console.log(`Total upsert operations: ${operations.length}`);
  console.log(
    `Mongo: matched=${result.matchedCount} modified=${result.modifiedCount} upserted=${result.upsertedCount}`,
  );
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
