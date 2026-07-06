import { Readable } from "stream";
import csvParser from "csv-parser";
import Restaurant from "../models/Restaurant.js";
import RestaurantPOC from "../models/RestaurantPOC.js";

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

const normalizeRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/\uFEFF/g, "").trim(),
      normalizeString(value),
    ]),
  );

const readCsvRows = (file) =>
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

const parseLanguages = (value) =>
  value
    ? value
        .split(",")
        .map((language) => language.trim())
        .filter(Boolean)
    : [];

export const bulkInsertRestaurantPocs = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const restaurants = await Restaurant.find()
      .select("businessId restaurantId businessName")
      .lean();
    const restaurantMap = new Map(
      restaurants.map((restaurant) => [restaurant.businessId?.trim(), restaurant]),
    );

    const existingPocs = await RestaurantPOC.find()
      .select("email businessId phone")
      .lean();
    const existingPocSet = new Set(
      existingPocs.map((poc) => {
        const identity = poc.email?.trim().toLowerCase() || poc.phone?.trim();
        return `${identity}|${poc.businessId?.trim()}`;
      }),
    );

    const rows = await readCsvRows(req.file);
    const pocs = [];
    const seenInCSV = new Set();
    const duplicateExistingLogs = [];
    const duplicateCSVLogs = [];
    const missingRestaurantRows = [];

    for (const row of rows) {
      const businessId = row["Business ID"]?.trim();
      const restaurant = restaurantMap.get(businessId);
      const email = row["Email"]?.trim().toLowerCase() || "";
      const phone = row["Phone Number"]?.trim() || "";
      const identity = email || phone;

      if (!restaurant) {
        missingRestaurantRows.push({
          businessId,
          pocName: row["POC Name"]?.trim(),
          email,
          reason: "Invalid Business ID - Restaurant not found",
        });
        continue;
      }

      if (!identity) continue;

      const pocKey = `${identity}|${businessId}`;

      if (existingPocSet.has(pocKey)) {
        duplicateExistingLogs.push({
          businessId,
          restaurantId: restaurant.restaurantId,
          name: row["POC Name"],
          email,
          reason: "Already exists in database",
        });
        continue;
      }

      if (seenInCSV.has(pocKey)) {
        duplicateCSVLogs.push({
          businessId,
          restaurantId: restaurant.restaurantId,
          name: row["POC Name"],
          email,
          reason: "Duplicate within same CSV",
        });
        continue;
      }

      const availabilityTime = row["Availibility time"] || "";

      seenInCSV.add(pocKey);
      pocs.push({
        restaurant: restaurant._id,
        restaurantId: restaurant.restaurantId,
        businessId,
        businessName: row["Business Name"] || restaurant.businessName,
        name: row["POC Name"] || "",
        profileImage: row["POC Image"] || "",
        designation: row["POC Designation"] || "",
        email,
        phone,
        linkedInProfile: row["LinkedIn Profile"] || "",
        languagesSpoken: parseLanguages(row["Languages"]),
        address: row["Address"] || "",
        availibilityTime: availabilityTime,
        availabilityTime,
      });
    }

    if (pocs.length === 0) {
      return res.status(400).json({
        message: "No valid restaurant POC data found in CSV.",
        skippedExisting: duplicateExistingLogs.length,
        duplicateExistingLogs,
        skippedDuplicateInCSV: duplicateCSVLogs.length,
        duplicateCSVLogs,
        missingRestaurantCount: missingRestaurantRows.length,
        missingRestaurantRows,
      });
    }

    const result = await RestaurantPOC.insertMany(pocs, { ordered: false });

    return res.status(201).json({
      message: "Restaurant POCs uploaded successfully",
      total:
        pocs.length +
        duplicateExistingLogs.length +
        duplicateCSVLogs.length +
        missingRestaurantRows.length,
      inserted: result.length,
      skippedExisting: duplicateExistingLogs.length,
      duplicateExistingLogs,
      skippedDuplicateInCSV: duplicateCSVLogs.length,
      duplicateCSVLogs,
      missingRestaurantCount: missingRestaurantRows.length,
      missingRestaurantRows,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantPocs = async (req, res, next) => {
  try {
    const { restaurantId, businessId } = req.query;
    const query = {};

    if (restaurantId) query.restaurantId = restaurantId;
    if (businessId) query.businessId = businessId;

    const pocs = await RestaurantPOC.find(query)
      .populate("restaurant", "businessId restaurantName restaurantId city state country")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(pocs);
  } catch (error) {
    next(error);
  }
};
