import { Readable } from "stream";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import Place from "../models/Place.js";

const REQUIRED_COLUMNS = ["Place Name", "Destination"];

const PLACE_FIELDS = [
  "serialNumber",
  "link",
  "mainImage",
  "placeName",
  "shortDescription",
  "address",
  "googleMapsLink",
  "rating",
  "category",
  "month",
  "venue",
  "destination",
  "placeType",
  "sections",
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

const buildPlacePayload = (body, { partial = false } = {}) => {
  const payload = {};

  for (const field of PLACE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;

    payload[field] =
      field === "sections"
        ? buildSectionsFromPayload(body[field])
        : normalizeString(body[field]);
  }

  if (!partial) {
    payload.sections = Object.prototype.hasOwnProperty.call(body, "sections")
      ? buildSectionsFromPayload(body.sections)
      : [];
  }

  return payload;
};

const validateRequiredPlaceFields = (payload) => {
  const missingFields = ["placeName", "destination"].filter(
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

const buildPlace = (row) => ({
  serialNumber: row["S. No"] || "",
  link: row["Link"] || "",
  mainImage: row["Main Image URL"] || "",
  placeName: row["Place Name"],
  shortDescription: row["Short Description"] || "",
  address: row["Address"] || "",
  googleMapsLink: row["Google Maps Link"] || "",
  rating: row["Rating"] || "",
  category: row["Category"] || "",
  month: row["Month"] || "",
  venue: row["Venue"] || "",
  destination: row["Destination"],
  placeType: row["Type"] || "",
  sections: buildSections(row),
});

export const getPlaces = async (req, res, next) => {
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

    const places = await Place.find(query).sort({ destination: 1, placeName: 1 });
    return res.status(200).json(places);
  } catch (error) {
    next(error);
  }
};

export const getPlacesByDestination = async (req, res, next) => {
  try {
    const destination = String(req.params.destination || "").trim();

    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }

    const places = await Place.find({
      destination: {
        $regex: `^${buildExactDestinationPattern(destination)}$`,
        $options: "i",
      },
    }).sort({ placeName: 1 });

    return res.status(200).json(places);
  } catch (error) {
    next(error);
  }
};

export const bulkInsertPlaces = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a CSV file." });
    }

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

      rows.push(row);
    });

    parser.on("error", next);

    parser.on("end", async () => {
      if (errors.length > 0) {
        return res.status(400).json({
          message: "CSV validation failed. No places were inserted.",
          errorCount: errors.length,
          errors,
        });
      }

      if (rows.length === 0) {
        return res.status(400).json({
          message: "The CSV file does not contain any place rows.",
        });
      }

      try {
        const places = rows.map(buildPlace);
        await Place.insertMany(places, { ordered: true });

        return res.status(201).json({
          message: "Places uploaded successfully",
          count: places.length,
        });
      } catch (error) {
        return next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};


export const addPlace = async (req, res, next) => {
  try {
    const payload = buildPlacePayload(req.body || {});
    const missingFields = validateRequiredPlaceFields(payload);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Required place fields are missing.",
        missingFields,
      });
    }

    const place = await Place.create(payload);

    return res.status(201).json({
      message: "Place created successfully",
      place,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlaceById = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (!mongoose.isValidObjectId(placeId)) {
      return res.status(400).json({ message: "Valid place identifier is required" });
    }

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    return res.status(200).json(place);
  } catch (error) {
    next(error);
  }
};

export const updatePlace = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (!mongoose.isValidObjectId(placeId)) {
      return res.status(400).json({ message: "Valid place identifier is required" });
    }

    const payload = buildPlacePayload(req.body || {}, { partial: true });

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        message: "At least one place field is required to update.",
      });
    }

    const emptyRequiredFields = ["placeName", "destination"].filter(
      (field) =>
        Object.prototype.hasOwnProperty.call(payload, field) && !payload[field],
    );

    if (emptyRequiredFields.length > 0) {
      return res.status(400).json({
        message: "Required place fields cannot be empty.",
        missingFields: emptyRequiredFields,
      });
    }

    const place = await Place.findByIdAndUpdate(placeId, payload, {
      new: true,
      runValidators: true,
    });

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    return res.status(200).json({
      message: "Place updated successfully",
      place,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlaceStatus = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const { isActive } = req.body || {};

    if (!mongoose.isValidObjectId(placeId)) {
      return res.status(400).json({ message: "Valid place identifier is required" });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean value.",
      });
    }

    const place = await Place.findByIdAndUpdate(
      placeId,
      { isActive },
      { new: true, runValidators: true },
    );

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    return res.status(200).json({
      message: `Place status updated to ${isActive ? "active" : "inactive"}`,
      place,
    });
  } catch (error) {
    next(error);
  }
};
