import VisaRuleV2 from "../models/VisaRuleV2.js";
import {
  normalizeCountryKey,
  normalizeVisaRequirement,
  parseCsvBuffer,
  buildMatrixMap,
  parseDurationValue,
} from "./visaRuleController.js";

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasValue = (value) =>
  value !== undefined &&
  value !== null &&
  !(typeof value === "string" && value.trim() === "");

const escapeCsvValue = (value) => {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const getVisaRulesV2 = async (req, res, next) => {
  try {
    const {
      passportCountry,
      destinationCountry,
      requirement: rawRequirement,
    } = req.query;

    const requirement = normalizeVisaRequirement(rawRequirement);
    const query = {};

    if (passportCountry) {
      const normalizedPassport = normalizeCountryKey(passportCountry);
      query.$or = [{ passport: passportCountry }, { normalizedPassport }];
    }
    if (destinationCountry) {
      query.normalizedDestination = normalizeCountryKey(destinationCountry);
    }
    if (requirement) query.requirement = requirement;

    const data = (
      await VisaRuleV2.find(query).sort({ passport: 1, destination: 1 }).lean()
    ).filter((rule) => {
      if (
        passportCountry &&
        (rule.normalizedPassport || normalizeCountryKey(rule.passport)) !==
          normalizeCountryKey(passportCountry)
      ) {
        return false;
      }

      if (
        destinationCountry &&
        (rule.normalizedDestination ||
          normalizeCountryKey(rule.destination)) !==
          normalizeCountryKey(destinationCountry)
      ) {
        return false;
      }

      return true;
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getUniqueDestinationCountriesV2 = async (req, res, next) => {
  try {
    const destinationCountries = await VisaRuleV2.aggregate([
      {
        $project: {
          destination: 1,
          normalizedKey: {
            $toLower: {
              $trim: {
                input: {
                  $ifNull: ["$normalizedDestination", "$destination"],
                },
              },
            },
          },
        },
      },
      {
        $match: {
          destination: { $type: "string", $ne: "" },
          normalizedKey: { $ne: "" },
        },
      },
      {
        $group: {
          _id: "$normalizedKey",
          destination: { $first: "$destination" },
        },
      },
      { $sort: { destination: 1 } },
      {
        $project: {
          _id: 0,
          destination: 1,
        },
      },
    ]);

    const countries = destinationCountries.map((item) => item.destination);

    return res.status(200).json({
      success: true,
      count: countries.length,
      countries,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisaRuleDetailsByPassportV2 = async (req, res, next) => {
  try {
    const passport = String(req.params.passport || "").trim();

    if (!passport) {
      return res.status(400).json({
        success: false,
        message: "passport is required in route params.",
      });
    }

    const normalizedPassport = normalizeCountryKey(passport);

    const data = await VisaRuleV2.find({
      $or: [{ passport }, { normalizedPassport }],
    })
      .sort({ destination: 1 })
      .lean();

    const filteredData = data.filter(
      (rule) =>
        (rule.normalizedPassport || normalizeCountryKey(rule.passport)) ===
        normalizedPassport,
    );

    return res.status(200).json({
      success: true,
      count: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    next(error);
  }
};

export const importVisaRulesV2Csv = async (req, res, next) => {
  try {
    const requirementFile = req.files?.["visa-requirement-file"]?.[0];
    const durationFile = req.files?.["visa-duration-file"]?.[0];

    if (!requirementFile || !durationFile) {
      return res.status(400).json({
        message:
          "Upload both CSV files using fields visa-requirement-file and visa-duration-file.",
      });
    }

    const [requirementRows, durationRows] = await Promise.all([
      parseCsvBuffer(requirementFile.buffer),
      parseCsvBuffer(durationFile.buffer),
    ]);

    const requirementMap = buildMatrixMap(requirementRows, (value) => {
      const cleaned = String(value ?? "").trim();
      if (!cleaned || cleaned === "-1") return "";
      return normalizeVisaRequirement(cleaned);
    });
    const durationMap = buildMatrixMap(durationRows, parseDurationValue);

    const isDryRun =
      String(req.query.dryRun || req.body.dryRun || "").toLowerCase() === "true";

    if (isDryRun) {
      // Diff only, nothing written — mirrors the exact two update paths
      // below (requirement-row path sets both fields; duration-only path
      // never touches an existing row's requirement).
      const allDocs = await VisaRuleV2.find().lean();
      const docByKey = new Map(
        allDocs.map((doc) => [
          `${doc.normalizedPassport || normalizeCountryKey(doc.passport)}|${
            doc.normalizedDestination || normalizeCountryKey(doc.destination)
          }`,
          doc,
        ]),
      );

      const preview = [];
      const seenKeysDry = new Set();
      let willInsertCount = 0;
      let willUpdateCount = 0;
      let unchangedCount = 0;

      requirementMap.forEach((entry, key) => {
        seenKeysDry.add(key);
        const durationEntry = durationMap.get(key);
        const newRequirement = entry.value;
        const newDurationDays = durationEntry?.value ?? null;
        const existing = docByKey.get(key);

        if (!existing) {
          willInsertCount += 1;
          preview.push({
            passport: entry.passport,
            destination: entry.destination,
            action: "insert",
            changedFields: [
              { field: "requirement", oldValue: null, newValue: newRequirement },
              { field: "durationDays", oldValue: null, newValue: newDurationDays },
            ],
          });
          return;
        }

        const changedFields = [];
        if ((existing.requirement || "") !== newRequirement) {
          changedFields.push({
            field: "requirement",
            oldValue: existing.requirement || "",
            newValue: newRequirement,
          });
        }
        if ((existing.durationDays ?? null) !== newDurationDays) {
          changedFields.push({
            field: "durationDays",
            oldValue: existing.durationDays ?? null,
            newValue: newDurationDays,
          });
        }

        if (!changedFields.length) {
          unchangedCount += 1;
          return;
        }

        willUpdateCount += 1;
        preview.push({
          passport: entry.passport,
          destination: entry.destination,
          action: "update",
          changedFields,
        });
      });

      durationMap.forEach((entry, key) => {
        if (seenKeysDry.has(key)) return;
        const existing = docByKey.get(key);
        const newDurationDays = entry.value;

        if (!existing) {
          willInsertCount += 1;
          preview.push({
            passport: entry.passport,
            destination: entry.destination,
            action: "insert",
            changedFields: [
              { field: "durationDays", oldValue: null, newValue: newDurationDays },
            ],
          });
          return;
        }

        if ((existing.durationDays ?? null) === newDurationDays) {
          unchangedCount += 1;
          return;
        }

        willUpdateCount += 1;
        preview.push({
          passport: entry.passport,
          destination: entry.destination,
          action: "update",
          changedFields: [
            {
              field: "durationDays",
              oldValue: existing.durationDays ?? null,
              newValue: newDurationDays,
            },
          ],
        });
      });

      return res.status(200).json({
        dryRun: true,
        processedRules: willInsertCount + willUpdateCount + unchangedCount,
        willInsertCount,
        willUpdateCount,
        unchangedCount,
        preview,
      });
    }

    const operations = [];
    const seenKeys = new Set();

    requirementMap.forEach((entry, key) => {
      seenKeys.add(key);
      const durationEntry = durationMap.get(key);

      operations.push({
        updateOne: {
          filter: {
            passport: entry.passport,
            destination: entry.destination,
          },
          update: {
            $set: {
              passport: entry.passport,
              normalizedPassport: normalizeCountryKey(entry.passport),
              destination: entry.destination,
              normalizedDestination: normalizeCountryKey(entry.destination),
              requirement: entry.value,
              durationDays: durationEntry?.value ?? null,
            },
          },
          upsert: true,
        },
      });
    });

    durationMap.forEach((entry, key) => {
      if (seenKeys.has(key)) return;

      operations.push({
        updateOne: {
          filter: {
            passport: entry.passport,
            destination: entry.destination,
          },
          update: {
            $set: {
              passport: entry.passport,
              normalizedPassport: normalizeCountryKey(entry.passport),
              destination: entry.destination,
              normalizedDestination: normalizeCountryKey(entry.destination),
              durationDays: entry.value,
            },
            $setOnInsert: { requirement: "" },
          },
          upsert: true,
        },
      });
    });

    if (!operations.length) {
      return res.status(400).json({
        message: "No visa rules were found in the uploaded CSV files.",
      });
    }

    const result = await VisaRuleV2.bulkWrite(operations, { ordered: false });

    return res.status(200).json({
      message: "Visa rules (v2) imported successfully.",
      processedRules: operations.length,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
    });
  } catch (error) {
    next(error);
  }
};

// Row-per-pair CSV: one file, columns Passport/Destination/Requirement/
// DurationDays. Blank cell = leave that field unchanged (no column-mismatch
// wipe risk like the matrix importer above). "-1" = explicit clear.
export const importVisaRulesV2RowCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a CSV file using field visa-rules-file.",
      });
    }

    const rawRows = await parseCsvBuffer(req.file.buffer);
    const rows = [];
    const rowErrors = [];

    rawRows.forEach((rawRow, index) => {
      const rowNumber = index + 2; // header is row 1

      const row = {};
      for (const [key, value] of Object.entries(rawRow)) {
        row[String(key || "").trim().toLowerCase()] = value;
      }

      const passport = String(row["passport"] || "").trim();
      const destination = String(row["destination"] || "").trim();

      if (!passport || !destination) {
        rowErrors.push({ rowNumber, reason: "Missing Passport or Destination" });
        return;
      }

      const update = {};

      if (hasValue(row["requirement"])) {
        const cleaned = String(row["requirement"]).trim();
        update.requirement = cleaned === "-1" ? "" : normalizeVisaRequirement(cleaned);
      }

      if (hasValue(row["durationdays"])) {
        const cleaned = String(row["durationdays"]).trim();
        if (cleaned === "-1") {
          update.durationDays = null;
        } else {
          const parsed = Number(cleaned);
          if (!Number.isFinite(parsed)) {
            rowErrors.push({ rowNumber, reason: `Invalid DurationDays value: ${cleaned}` });
            return;
          }
          update.durationDays = parsed;
        }
      }

      if (!Object.keys(update).length) {
        rowErrors.push({
          rowNumber,
          reason: "Requirement and DurationDays both blank — nothing to update",
        });
        return;
      }

      rows.push({ rowNumber, passport, destination, update });
    });

    if (!rows.length) {
      return res
        .status(400)
        .json({ message: "No valid rows were found in CSV.", rowErrors });
    }

    const isDryRun =
      String(req.query.dryRun || req.body.dryRun || "").toLowerCase() === "true";

    if (isDryRun) {
      const allDocs = await VisaRuleV2.find().lean();
      const docByKey = new Map(
        allDocs.map((doc) => [
          `${doc.normalizedPassport || normalizeCountryKey(doc.passport)}|${
            doc.normalizedDestination || normalizeCountryKey(doc.destination)
          }`,
          doc,
        ]),
      );

      const preview = [];
      let willInsertCount = 0;
      let willUpdateCount = 0;
      let unchangedCount = 0;

      for (const row of rows) {
        const key = `${normalizeCountryKey(row.passport)}|${normalizeCountryKey(row.destination)}`;
        const existing = docByKey.get(key);

        if (!existing) {
          willInsertCount += 1;
          preview.push({
            rowNumber: row.rowNumber,
            passport: row.passport,
            destination: row.destination,
            action: "insert",
            changedFields: Object.entries(row.update).map(([field, newValue]) => ({
              field,
              oldValue: null,
              newValue,
            })),
          });
          continue;
        }

        const changedFields = Object.entries(row.update)
          .map(([field, newValue]) => ({
            field,
            oldValue: field === "requirement" ? existing.requirement || "" : existing.durationDays ?? null,
            newValue,
          }))
          .filter((entry) => entry.oldValue !== entry.newValue);

        if (!changedFields.length) {
          unchangedCount += 1;
          continue;
        }

        willUpdateCount += 1;
        preview.push({
          rowNumber: row.rowNumber,
          passport: row.passport,
          destination: row.destination,
          action: "update",
          changedFields,
        });
      }

      return res.status(200).json({
        dryRun: true,
        processedRows: rows.length,
        willInsertCount,
        willUpdateCount,
        unchangedCount,
        rowErrors,
        preview,
      });
    }

    const operations = rows.map(({ passport, destination, update }) => ({
      updateOne: {
        filter: { passport, destination },
        update: {
          $set: {
            passport,
            normalizedPassport: normalizeCountryKey(passport),
            destination,
            normalizedDestination: normalizeCountryKey(destination),
            ...update,
          },
          $setOnInsert: {
            ...(update.requirement === undefined ? { requirement: "" } : {}),
            ...(update.durationDays === undefined ? { durationDays: null } : {}),
          },
        },
        upsert: true,
      },
    }));

    const result = await VisaRuleV2.bulkWrite(operations, { ordered: false });

    return res.status(200).json({
      message: "Visa rules (v2) updated from CSV.",
      processedRows: rows.length,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      rowErrors,
    });
  } catch (error) {
    next(error);
  }
};

// Mirrors importVisaRulesV2RowCsv's exact column shape, so export → edit →
// reupload is a round trip.
export const exportVisaRulesV2Csv = async (req, res, next) => {
  try {
    const rules = await VisaRuleV2.find().sort({ passport: 1, destination: 1 }).lean();

    const header = ["Passport", "Destination", "Requirement", "DurationDays"];
    const lines = [header.join(",")];

    for (const rule of rules) {
      lines.push(
        [rule.passport, rule.destination, rule.requirement || "", rule.durationDays ?? ""]
          .map(escapeCsvValue)
          .join(","),
      );
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="wono_visa_rules_v2.csv"',
    );
    return res.status(200).send(lines.join("\n"));
  } catch (error) {
    next(error);
  }
};

export const updateVisaRuleByPassportV2 = async (req, res, next) => {
  try {
    const passport = String(req.params.passport || "").trim();

    if (!passport) {
      return res.status(400).json({
        success: false,
        message: "passport is required in route params.",
      });
    }

    const destination = String(req.body.destination || "").trim();
    if (!destination) {
      return res.status(400).json({
        success: false,
        message: "destination is required in request body.",
      });
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "requirement")) {
      updates.requirement = normalizeVisaRequirement(req.body.requirement);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "durationDays")) {
      const rawDuration = req.body.durationDays;
      if (rawDuration === null || rawDuration === "") {
        updates.durationDays = null;
      } else {
        const parsed = Number(rawDuration);
        if (!Number.isFinite(parsed)) {
          return res.status(400).json({
            success: false,
            message: "durationDays must be a valid number or null.",
          });
        }
        updates.durationDays = parsed;
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least one editable field (requirement, durationDays).",
      });
    }

    const normalizedPassport = normalizeCountryKey(passport);
    const normalizedDestination = normalizeCountryKey(destination);

    const updatedRule = await VisaRuleV2.findOneAndUpdate(
      {
        $and: [
          {
            $or: [
              { normalizedPassport },
              { passport: new RegExp(`^${escapeRegExp(passport)}$`, "i") },
            ],
          },
          {
            $or: [
              { normalizedDestination },
              {
                destination: new RegExp(`^${escapeRegExp(destination)}$`, "i"),
              },
            ],
          },
        ],
      },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedRule) {
      return res.status(404).json({
        success: false,
        message:
          "Visa rule not found for the provided passport and destination.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Visa rule updated successfully.",
      data: updatedRule,
    });
  } catch (error) {
    next(error);
  }
};
