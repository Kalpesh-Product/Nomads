import mongoose from "mongoose";
import { config } from "dotenv";
import ExcelJS from "exceljs";
import StateWiseWeightV2 from "../models/StateWiseWeightV2.js";

config({ override: true });

const XLSX_PATH = process.argv[2];
if (!XLSX_PATH) {
  console.error(
    "Usage: node scripts/importAlgo2Data.js <path-to-WoNo-AI-Algo-2.0.xlsx>",
  );
  process.exit(1);
}

const METRIC_NAME_TO_KEY = {
  "Cost of Living": "costOfLiving",
  Internet: "internet",
  Safety: "safety",
  "Nomad Community": "nomadCommunity",
  "Work Infrastructure": "workInfrastructure",
  "Air Quality Index": "airQualityIndex",
  "Startup Ecosystem": "startupEcosystem",
  "Healthcare Cost Index": "healthcareCostIndex",
  "Purchasing Power": "purchasingPower",
  "Inflation Stability": "inflationStability",
  "Meetups & Events": "meetupsEvents",
  "Startup Incubators & Accelerators": "incubators",
  "Climate & Environment": "climateEnvironment",
  "Lower Taxes": "lowerTaxes",
  "Nature Nomad Travelling": "natureNomadTravelling",
  Yoga: "yoga",
  "Venture Capital Presence": "ventureCapitalPresence",
  "Venture Capital Investments": "ventureCapitalInvestments",
  "Easy Visa / Long Stay": "visaOpenness",
  "Healthcare Friendly": "healthcareQuality",
  "Best Connected Cities (Flights)": "flightConnectivity",
  "Remote Job Opportunities": "remoteJobs",
  "Tech Talent Density": "techTalentDensity",
  "Conferences & Events": "conferencesEvents",
};

// ExcelJS returns rich text / formula / hyperlink cells as objects instead of
// plain scalars; coerce to the value a plain CSV read would have given us.
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

const sheetToRows = (worksheet) => {
  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = String(cellScalar(cell) || "").trim();
  });

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (header) record[header] = cellScalar(cell);
    });
    if (Object.keys(record).length) rows.push(record);
  });
  return rows;
};

const toNumberOrNull = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const run = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is required");
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(XLSX_PATH);

  const dataSheet = workbook.getWorksheet("stateWiseWeight 2.0");
  if (!dataSheet) {
    throw new Error('Sheet "stateWiseWeight 2.0" not found in workbook.');
  }

  const dataRows = sheetToRows(dataSheet);

  await mongoose.connect(process.env.MONGO_URL);

  let successful = 0;
  const failed = [];
  const operations = [];

  for (const row of dataRows) {
    const destination = String(row.Destination || "").trim();
    const country = String(row.Country || "").trim();
    const continent = String(row.Continent || "").trim();

    if (!destination || !country || !continent) {
      failed.push({ destination: destination || "(blank)", reason: "Missing destination/country/continent" });
      continue;
    }

    const weight = {};
    const invalidMetrics = [];
    for (const [sheetName, schemaKey] of Object.entries(METRIC_NAME_TO_KEY)) {
      const num = toNumberOrNull(row[sheetName]);
      if (num === null || num < 1.0 || num > 10.0) {
        invalidMetrics.push(sheetName);
        weight[schemaKey] = 5.0; // defensive fallback, matches calculation engine's clamp
      } else {
        weight[schemaKey] = num;
      }
    }

    if (invalidMetrics.length) {
      failed.push({
        destination,
        reason: `Invalid/out-of-range metrics: ${invalidMetrics.join(", ")}`,
      });
      continue;
    }

    const rank = toNumberOrNull(row["Sr. No."]) ?? 9999;

    operations.push({
      updateOne: {
        filter: { country, state: destination },
        update: {
          $set: { continent, country, state: destination, rank, weight },
          $setOnInsert: { isActive: true, images: {} },
        },
        upsert: true,
      },
    });
    successful += 1;
  }

  let result = { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
  if (operations.length) {
    result = await StateWiseWeightV2.bulkWrite(operations, { ordered: false });
  }

  console.log("--- Algo 2.0 Import Summary ---");
  console.log(`Total rows in sheet: ${dataRows.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length) {
    console.log("Failures:", JSON.stringify(failed, null, 2));
  }
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
