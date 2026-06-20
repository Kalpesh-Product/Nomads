import { Readable } from "stream";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import Event from "../models/Event.js";

const REQUIRED_COLUMNS = ["Event Name", "Short Description", "Destination"];

const EVENT_FIELDS = [
  "serialNumber",
  "link",
  "mainImage",
  "eventName",
  "shortDescription",
  "category",
  "month",
  "venue",
  "destination",
  "eventType",
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

const buildEventPayload = (body, { partial = false } = {}) => {
  const payload = {};

  for (const field of EVENT_FIELDS) {
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

const validateRequiredEventFields = (payload) => {
  const missingFields = ["eventName", "shortDescription", "destination"].filter(
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

const buildEvent = (row) => ({
  serialNumber: row["S. No"] || "",
  link: row["Link"] || "",
  mainImage: row["Main Image URL"] || "",
  eventName: row["Event Name"],
  shortDescription: row["Short Description"],
  category: row["Category"] || "",
  month: row["Month"] || "",
  venue: row["Venue"] || "",
  destination: row["Destination"],
  eventType: row["Type"] || "",
  sections: buildSections(row),
});

export const getEvents = async (req, res, next) => {
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

    const events = await Event.find(query).sort({ destination: 1, eventName: 1 });
    return res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventsByDestination = async (req, res, next) => {
  try {
    const destination = String(req.params.destination || "").trim();

    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }

    const events = await Event.find({
      destination: {
        $regex: `^${buildExactDestinationPattern(destination)}$`,
        $options: "i",
      },
    }).sort({ eventName: 1 });

    return res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export const bulkInsertEvents = async (req, res, next) => {
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
          message: "CSV validation failed. No events were inserted.",
          errorCount: errors.length,
          errors,
        });
      }

      if (rows.length === 0) {
        return res.status(400).json({
          message: "The CSV file does not contain any event rows.",
        });
      }

      try {
        const events = rows.map(buildEvent);
        await Event.insertMany(events, { ordered: true });

        return res.status(201).json({
          message: "Events uploaded successfully",
          count: events.length,
        });
      } catch (error) {
        return next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};


export const addEvent = async (req, res, next) => {
  try {
    const payload = buildEventPayload(req.body || {});
    const missingFields = validateRequiredEventFields(payload);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Required event fields are missing.",
        missingFields,
      });
    }

    const event = await Event.create(payload);

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Valid event identifier is required" });
    }

    const payload = buildEventPayload(req.body || {}, { partial: true });

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        message: "At least one event field is required to update.",
      });
    }

    const emptyRequiredFields = [
      "eventName",
      "shortDescription",
      "destination",
    ].filter(
      (field) =>
        Object.prototype.hasOwnProperty.call(payload, field) && !payload[field],
    );

    if (emptyRequiredFields.length > 0) {
      return res.status(400).json({
        message: "Required event fields cannot be empty.",
        missingFields: emptyRequiredFields,
      });
    }

    const event = await Event.findByIdAndUpdate(eventId, payload, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEventStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { isActive } = req.body || {};

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Valid event identifier is required" });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean value.",
      });
    }

    const event = await Event.findByIdAndUpdate(
      eventId,
      { isActive },
      { new: true, runValidators: true },
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: `Event status updated to ${isActive ? "active" : "inactive"}`,
      event,
    });
  } catch (error) {
    next(error);
  }
};
