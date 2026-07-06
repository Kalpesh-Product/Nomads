import { Readable } from "stream";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";

const REQUIRED_COLUMNS = [
  "Business ID",
  "Business Name",
  "Continent",
  "Country",
  "State",
  "City",
  "Type",
];

const RESTAURANT_FIELDS = [
  "businessId",
  "restaurantId",
  "businessName",
  "mainImage",
  "logo",
  "images",
  "restaurantName",
  "restaurantTitle",
  "registeredEntityName",
  "website",
  "shortDescription",
  "address",
  "continent",
  "country",
  "state",
  "city",
  "about",
  "totalSeats",
  "latitude",
  "longitude",
  "googleMap",
  "googleMapsLink",
  "ratings",
  "rating",
  "totalReviews",
  "reviews",
  "poc",
  "inclusions",
  "services",
  "units",
  "destination",
  "restaurantType",
];

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

const buildSectionsFromPayload = (sections) => {
  if (!Array.isArray(sections)) return [];

  return sections.map((section = {}) => ({
    title: normalizeString(section.title) || "",
    image: normalizeString(section.image) || "",
    content: normalizeString(section.content) || "",
  }));
};

const buildRestaurantPayload = (body, { partial = false } = {}) => {
  const payload = {};

  const bodyWithAliases = { ...body };

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantName") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "businessName")
  ) {
    bodyWithAliases.restaurantName = bodyWithAliases.businessName;
  }

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "businessName") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantName")
  ) {
    bodyWithAliases.businessName = bodyWithAliases.restaurantName;
  }

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantTitle") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantName")
  ) {
    bodyWithAliases.restaurantTitle = bodyWithAliases.restaurantName;
  }

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantId") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "businessId")
  ) {
    bodyWithAliases.restaurantId = bodyWithAliases.businessId;
  }

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "destination") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "state")
  ) {
    bodyWithAliases.destination = bodyWithAliases.state;
  }

  if (
    !Object.prototype.hasOwnProperty.call(bodyWithAliases, "restaurantType") &&
    Object.prototype.hasOwnProperty.call(bodyWithAliases, "placeType")
  ) {
    bodyWithAliases.restaurantType = bodyWithAliases.placeType;
  }

  for (const field of RESTAURANT_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(bodyWithAliases, field)) continue;

    payload[field] =
      field === "sections"
        ? buildSectionsFromPayload(bodyWithAliases[field])
        : normalizeString(bodyWithAliases[field]);
  }

  return payload;
};

const validateRequiredRestaurantFields = (payload) => {
  const missingFields = [
    "businessId",
    "restaurantId",
    "businessName",
    "restaurantName",
    "restaurantTitle",
    "continent",
    "country",
    "state",
    "city",
    "destination",
    "restaurantType",
  ].filter(
    (field) => !payload[field],
  );

  return missingFields;
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const DASH_VARIANTS = /[-\u2010-\u2015\u2212\uFE63\uFF0D]/u;
const DASH_VARIANT_PATTERN = [
  "[-",
  String.fromCodePoint(0x2010),
  "-",
  String.fromCodePoint(0x2015, 0x2212, 0xfe63, 0xff0d),
  "]",
].join("");

const buildExactDestinationPattern = (destination) =>
  destination
    .split(DASH_VARIANTS)
    .map(escapeRegex)
    .join(DASH_VARIANT_PATTERN);

const normalizeRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/\uFEFF/g, "").trim(),
      typeof value === "string" ? value.trim() : value,
    ]),
  );

const buildSections = (row) => {
  const sections = [];

  for (let i = 1; i <= 20; i++) {
    const title = row[`Section ${i} Title`];
    const image = row[`Section ${i} Image`];
    const content = row[`Section ${i} Content`];

    if (title || image || content) {
      sections.push({
        title: title || "",
        image: image || "",
        content: content || "",
      });
    }
  }

  return sections;
};

const parseNumber = (value) => {
  const parsed = Number(String(value || "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildRestaurant = (row) => ({
  businessId: row["Business ID"],
  restaurantId: row["Business ID"],
  businessName: row["Business Name"],
  restaurantName: row["Business Name"],
  restaurantTitle: row["Business Name"],
  registeredEntityName: row["Registered Entity name"] || "",
  website: row["Website"] || "",
  logo: row["Logo"] || "",
  images: row["Images"] || "",
  mainImage: row["Images"] || row["Logo"] || "",
  shortDescription: row["About"] || "",
  address: row["Address"] || "",
  continent: row["Continent"],
  country: row["Country"],
  state: row["State"],
  city: row["City"],
  about: row["About"] || "",
  totalSeats: parseNumber(row["Total Seats"]),
  latitude: parseNumber(row["latitude"]),
  longitude: parseNumber(row["longitude"]),
  googleMap: row["Google map"] || "",
  googleMapsLink: row["Google map"] || "",
  ratings: parseNumber(row["Ratings"]),
  rating: row["Ratings"] || "",
  totalReviews: parseNumber(row["Total Reviews"]) || 0,
  reviews: row["Reviews"] || "",
  poc: row["POC"] || "",
  inclusions: row["Inclusions"] || "",
  services: row["Services"] || "",
  units: row["Units"] || "",
  destination: row["Destination"] || row["State"] || row["City"],
  restaurantType: row["Type"] || "",
});

export const getRestaurants = async (req, res, next) => {
  try {
    const { destination, category, month } = req.query;
    const query = {};

    if (destination) {
      query.destination = {
        $regex: `^${buildExactDestinationPattern(destination)}$`,
        $options: "i",
      };
    }
    if (category) {
      query.category = { $regex: escapeRegex(category), $options: "i" };
    }
    if (month) {
      query.month = { $regex: escapeRegex(month), $options: "i" };
    }

    const restaurants = await Restaurant.find(query).sort({
      destination: 1,
      restaurantName: 1,
    });
    return res.status(200).json(restaurants);
  } catch (error) {
    next(error);
  }
};

export const getRestaurantsByDestination = async (req, res, next) => {
  try {
    const destination = String(req.params.destination || "").trim();

    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }

    const restaurants = await Restaurant.find({
      destination: {
        $regex: `^${buildExactDestinationPattern(destination)}$`,
        $options: "i",
      },
    }).sort({ restaurantName: 1 });

    return res.status(200).json(restaurants);
  } catch (error) {
    next(error);
  }
};

export const bulkInsertRestaurants = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a CSV file." });
    }

    const existingRestaurants = await Restaurant.find()
      .select("businessId restaurantName")
      .lean();
    const existingBusinessIds = new Set(
      existingRestaurants.map((restaurant) => restaurant.businessId?.trim()),
    );

    const rows = [];
    const errors = [];
    let rowNumber = 1;

    const parser = Readable.from(req.file.buffer.toString("utf-8")).pipe(
      csvParser(),
    );

    parser.on("data", (rawRow) => {
      rowNumber++;
      const row = normalizeRow(rawRow);
      const hasAnyValue = Object.values(row).some(
        (value) => value !== undefined && value !== null && value !== "",
      );

      if (!hasAnyValue) return;

      for (const column of REQUIRED_COLUMNS) {
        if (!row[column]) {
          errors.push({
            row: rowNumber,
            field: column,
            reason: "Required field missing",
          });
        }
      }

      rows.push({ rowNumber, row });
    });

    parser.on("error", next);

    parser.on("end", async () => {
      if (errors.length > 0) {
        return res.status(400).json({
          message: "CSV validation failed. No restaurants were inserted.",
          errorCount: errors.length,
          errors,
        });
      }

      if (rows.length === 0) {
        return res.status(400).json({
          message: "The CSV file does not contain any restaurant rows.",
        });
      }

      try {
        const seenInCSV = new Set();
        const duplicateExistingRows = [];
        const duplicateCSVRows = [];
        const restaurants = [];

        for (const item of rows) {
          const businessId = item.row["Business ID"]?.trim();

          if (existingBusinessIds.has(businessId)) {
            duplicateExistingRows.push({
              row: item.rowNumber,
              businessId,
              businessName: item.row["Business Name"],
              reason: "Already exists in database",
            });
            continue;
          }

          if (seenInCSV.has(businessId)) {
            duplicateCSVRows.push({
              row: item.rowNumber,
              businessId,
              businessName: item.row["Business Name"],
              reason: "Duplicate within CSV",
            });
            continue;
          }

          seenInCSV.add(businessId);
          restaurants.push(buildRestaurant(item.row));
        }

        if (restaurants.length === 0) {
          return res.status(400).json({
            message: "No valid restaurant data found in CSV.",
            skippedExisting: duplicateExistingRows.length,
            duplicateExistingRows,
            skippedDuplicateInCSV: duplicateCSVRows.length,
            duplicateCSVRows,
          });
        }

        const result = await Restaurant.insertMany(restaurants, {
          ordered: false,
        });

        return res.status(201).json({
          message: "Restaurants uploaded successfully",
          total:
            restaurants.length +
            duplicateExistingRows.length +
            duplicateCSVRows.length,
          inserted: result.length,
          skippedExisting: duplicateExistingRows.length,
          duplicateExistingRows,
          skippedDuplicateInCSV: duplicateCSVRows.length,
          duplicateCSVRows,
        });
      } catch (error) {
        return next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addRestaurant = async (req, res, next) => {
  try {
    const payload = buildRestaurantPayload(req.body || {});
    const missingFields = validateRequiredRestaurantFields(payload);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Required restaurant fields are missing.",
        missingFields,
      });
    }

    const restaurant = await Restaurant.create(payload);

    return res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({
        message: "Valid restaurant identifier is required",
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json(restaurant);
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({
        message: "Valid restaurant identifier is required",
      });
    }

    const payload = buildRestaurantPayload(req.body || {}, { partial: true });

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        message: "At least one restaurant field is required to update.",
      });
    }

    const emptyRequiredFields = ["restaurantName", "destination"].filter(
      (field) =>
        Object.prototype.hasOwnProperty.call(payload, field) && !payload[field],
    );

    if (emptyRequiredFields.length > 0) {
      return res.status(400).json({
        message: "Required restaurant fields cannot be empty.",
        missingFields: emptyRequiredFields,
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurantStatus = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { isActive } = req.body || {};

    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({
        message: "Valid restaurant identifier is required",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean value.",
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { isActive },
      { new: true, runValidators: true },
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({
      message: `Restaurant status updated to ${isActive ? "active" : "inactive"}`,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};
