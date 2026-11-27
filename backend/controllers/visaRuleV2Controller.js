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

// Shared by the live endpoint below and the background cache refresher —
// one scoped, already-proven-fast query per passport, never an unfiltered
// full-collection scan.
const fetchVisaRulesForPassport = async (passport) => {
  const normalizedPassport = normalizeCountryKey(passport);

  const data = await VisaRuleV2.find({
    $or: [{ passport }, { normalizedPassport }],
  })
    .sort({ destination: 1 })
    .lean();

  return data.filter(
    (rule) =>
      (rule.normalizedPassport || normalizeCountryKey(rule.passport)) ===
      normalizedPassport,
  );
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

    const filteredData = await fetchVisaRulesForPassport(passport);

    return res.status(200).json({
      success: true,
      count: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    next(error);
  }
};

// --- IN-MEMORY CACHE (mirrors masterpanel's destinationDataControllers.js
// stale-while-revalidate pattern) ---
// Refresh batches the same scoped per-passport query already proven safe —
// never an unfiltered collection scan, just done once on a timer instead of
// once per export click. Export reads only ever come from here; dry-run and
// commit always hit the live DB directly, never this cache.
const VISA_CACHE_TTL_MS = 10 * 60 * 1000;
const VISA_CACHE_BATCH_SIZE = 5;
// Minimum gap between retry attempts when a refresh fails, so repeated
// requests during an outage can't hammer the DB.
const VISA_CACHE_RETRY_MS = 30 * 1000;

const visaRulesCache = { countries: null, byPassport: null, fetchedAt: 0 };
let visaRulesRefreshPromise = null;
let visaRulesRefreshAttemptAt = 0;

const refreshVisaRulesCache = () => {
  if (!visaRulesRefreshPromise) {
    visaRulesRefreshPromise = (async () => {
      const rawCountries = await VisaRuleV2.distinct("destination");
      const countries = Array.from(
        new Set(rawCountries.map((value) => String(value || "").trim()).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b));

      const byPassport = new Map();
      for (let i = 0; i < countries.length; i += VISA_CACHE_BATCH_SIZE) {
        const batch = countries.slice(i, i + VISA_CACHE_BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((passport) => fetchVisaRulesForPassport(passport)),
        );
        results.forEach((result, index) => {
          const passport = batch[index];
          // A failed passport is just left out of this pass — picked up on
          // the next refresh, never blocks the rest of the cache.
          if (result.status === "fulfilled") {
            byPassport.set(passport, result.value);
          }
        });
      }

      visaRulesCache.countries = countries;
      visaRulesCache.byPassport = byPassport;
      visaRulesCache.fetchedAt = Date.now();
      return visaRulesCache;
    })().finally(() => {
      visaRulesRefreshPromise = null;
    });
  }

  return visaRulesRefreshPromise;
};

const getVisaRulesCacheState = () => {
  const isFresh =
    visaRulesCache.byPassport &&
    Date.now() - visaRulesCache.fetchedAt < VISA_CACHE_TTL_MS;

  if (isFresh) {
    return {
      countries: visaRulesCache.countries,
      byPassport: visaRulesCache.byPassport,
      isRefreshing: false,
      isInitialLoading: false,
    };
  }

  if (
    !visaRulesRefreshPromise &&
    Date.now() - visaRulesRefreshAttemptAt >= VISA_CACHE_RETRY_MS
  ) {
    visaRulesRefreshAttemptAt = Date.now();
    refreshVisaRulesCache().catch((error) => {
      console.error("Background visa rules cache refresh failed:", error.message);
    });
  }

  return {
    countries: visaRulesCache.countries || [],
    byPassport: visaRulesCache.byPassport || new Map(),
    isRefreshing: true,
    isInitialLoading: !visaRulesCache.byPassport,
  };
};

// Export reads from the cache. A cold cache (first request after a restart)
// waits for the one-time refresh instead of returning empty — same
// trade-off as the live per-passport endpoint, just paid once globally
// rather than once per page load.
export const getVisaRulesV2Cached = async (req, res, next) => {
  try {
    let state = getVisaRulesCacheState();

    if (state.isInitialLoading) {
      await refreshVisaRulesCache();
      state = getVisaRulesCacheState();
    }

    return res.status(200).json({
      success: true,
      isRefreshing: state.isRefreshing,
      fetchedAt: visaRulesCache.fetchedAt,
      countries: state.countries,
      rulesByPassport: Object.fromEntries(state.byPassport),
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
      // Only fetch the pairs the uploaded file actually mentions — a full
      // unfiltered collection scan here hangs in production. Grouped by
      // passport (same as the row importer) so a full matrix doesn't turn
      // into one $or clause per pair.
      const neededPairs = new Map();
      requirementMap.forEach((entry) =>
        neededPairs.set(`${entry.passport}|${entry.destination}`, entry),
      );
      durationMap.forEach((entry) =>
        neededPairs.set(`${entry.passport}|${entry.destination}`, entry),
      );

      const destinationsByPassport = new Map();
      neededPairs.forEach((entry) => {
        if (!destinationsByPassport.has(entry.passport)) {
          destinationsByPassport.set(entry.passport, new Set());
        }
        destinationsByPassport.get(entry.passport).add(entry.destination);
      });

      const neededDocs = destinationsByPassport.size
        ? await VisaRuleV2.find({
            $or: Array.from(destinationsByPassport.entries()).map(
              ([passport, destinations]) => ({
                passport,
                destination: { $in: Array.from(destinations) },
              }),
            ),
          })
            .maxTimeMS(25000)
            .lean()
        : [];

      const docByKey = new Map(
        neededDocs.map((doc) => [
          `${normalizeCountryKey(doc.passport)}|${normalizeCountryKey(doc.destination)}`,
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
    visaRulesCache.fetchedAt = 0; // next export refreshes instead of serving stale data

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

      if (normalizeCountryKey(passport) === normalizeCountryKey(destination)) {
        rowErrors.push({
          rowNumber,
          reason: "Passport and Destination are the same country — no visa rule needed",
        });
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
      // Only fetch the pairs this file mentions — a full unfiltered
      // collection scan here hangs in production. Grouped by passport
      // (destinations repeat under far fewer passports than there are
      // rows) instead of one $or clause per row, so a full-sheet upload
      // (tens of thousands of rows) doesn't turn into a tens-of-thousands
      // -clause query.
      const destinationsByPassport = new Map();
      rows.forEach((row) => {
        if (!destinationsByPassport.has(row.passport)) {
          destinationsByPassport.set(row.passport, new Set());
        }
        destinationsByPassport.get(row.passport).add(row.destination);
      });

      const neededDocs = await VisaRuleV2.find({
        $or: Array.from(destinationsByPassport.entries()).map(([passport, destinations]) => ({
          passport,
          destination: { $in: Array.from(destinations) },
        })),
      })
        .maxTimeMS(25000)
        .lean();

      const docByKey = new Map(
        neededDocs.map((doc) => [
          `${normalizeCountryKey(doc.passport)}|${normalizeCountryKey(doc.destination)}`,
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
    visaRulesCache.fetchedAt = 0; // next export refreshes instead of serving stale data

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
    const rules = await VisaRuleV2.find()
      .sort({ passport: 1, destination: 1 })
      .maxTimeMS(25000)
      .lean();

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

    visaRulesCache.fetchedAt = 0; // next export refreshes instead of serving stale data

    return res.status(200).json({
      success: true,
      message: "Visa rule updated successfully.",
      data: updatedRule,
    });
  } catch (error) {
    next(error);
  }
};
