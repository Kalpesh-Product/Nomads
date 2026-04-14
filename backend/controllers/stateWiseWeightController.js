import StateWiseWeight from "../models/StateWiseWeight.js";
import { stateWiseWeightCalculation } from "../controllers/stateWiseWeightCalculation.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

// --- CSV MAPPING LOGIC ---

const CSV_TO_SCHEMA_MAP = {
    // Core Infra
    costofliving: "costOfLiving",
    internet: "internet",
    safety: "safety",
    nomadcommunity: "nomadCommunity",
    workinfrastructure: "workInfrastructure",
    qualityoflife: "qualityOfLife",
    visaflexibility: "visaFlexibility",
    lifestyleentertainment: "lifestyleEntertainment",
    climateenvironment: "climateEnvironment",
    accessibility: "accessibility",
    airqualityindex: "airQualityIndex",
    startupecosystemscore: "startupEcosystemScore",
    airportconnectivity: "airportConnectivity",
    directinternationalflights: "directInternationalFlights",

    // Financial
    "lowertaxes-taxfriendly": "taxFriendly",
    purchasingpower: "purchasingPower",
    inflationstability: "inflationStability",
    startupsetupcost: "startupSetupCost",

    // Career / Startup
    venturecapitalpresence: "ventureCapital",
    startupincubatorsaccelerators: "incubators",
    techtalentdensity: "techTalentDensity",
    conferencesevents: "conferences",
    remotejobavailability: "remoteJobs",

    // Lifestyle
    foundernomads: "founderNomads",
    meetupsevents: "meetupsEvents",
    solonomadtraveller: "soloNomad",
    familynomadtraveller: "familyNomads",
    girlnomadtraveller: "femaleNomads",
    couplenomadtravelletrs: "coupleNomads",
    partyeventsnomadtraveller: "partyLifestyle",
    naturenomadtravelling: "nature",
    adventurenomadtravelling: "adventure",
    nightlifepubs: "nightlife",
    yoga: "yoga",
    healthcarecostindex: "healthcareCostIndex",
};

// Normalizes raw CSV keys so we can map inconsistent headers safely.
// Example: "Cost of Living", "cost_of_living" and "Cost-of-Living" become "costofliving".
const normalize = (row = {}) =>
    Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
            String(key || "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace(/[_-]/g, "")
                .replace(/&/g, ""),
            typeof value === "string" ? value.trim() : value,
        ]),
    );

// Converts CSV values to numbers and defaults invalid/missing values to 0.
const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

const mapCsvRowToStateWiseWeight = (rawRow = {}) => {
    // 1) Normalize incoming headers/values first.
    const row = normalize(rawRow);

    const continent = row["continent"];
    const country = row["country"];
    const state = row["destination"];

    // 2) Handle rank whether the CSV header is named "Rank" or accidentally blank.
    const rank = toNumber(row["rank"] !== undefined ? row["rank"] : row[""]);

    const weight = {};

    // 3) Build the nested weight object from the mapping table.
    for (const [csvKey, schemaKey] of Object.entries(CSV_TO_SCHEMA_MAP)) {
        weight[schemaKey] = toNumber(row[csvKey]);
    }

    return {
        continent,
        country,
        state,
        rank,
        weight,
    };
};


// --- CONTROLLERS ---

export const getStateWiseWeight = async (req, res, next) => {
    try {
        const { selectionType, continent, attribute = "bestForNomads" } = req.body;

        let query = {};

        // 1. Resolve effective attribute based on selectionType
        let effectiveAttribute = attribute;
        if (selectionType === "Work From Anywhere") {
            if (attribute === "strongNomadCommunity") effectiveAttribute = "strongNomadCommunityWFA";
            if (attribute === "bestWorkInfrastructure") effectiveAttribute = "bestWorkInfrastructureWFA";
        }

        // 2. Filter by continent if provided and not "World"
        if (continent && continent.toLowerCase() !== "world") {
            query.continent = { $regex: new RegExp(`^${continent}$`, "i") };
        }

        // 3. Fetch state weights based on query
        const stateWeights = await StateWiseWeight.find(query).lean();

        // 4. Calculate scores for each state and pick the requested attribute
        const results = stateWeights.map(item => {
            // Compute all derived scores once, then select the requested attribute.
            const allScores = stateWiseWeightCalculation(item.weight);
            const scoreForSorting = allScores[effectiveAttribute] || 0;

            return {
                state: item.state,
                [effectiveAttribute]: scoreForSorting
            };
        });

        // 5. Sort by the requested attribute score in descending order
        results.sort((a, b) => b[effectiveAttribute] - a[effectiveAttribute]);

        res.status(200).json({
            success: true,
            count: results.length,
            selectedAttribute: attribute,
            data: results
        });

    } catch (error) {
        next(error);
    }
};

export const bulkInsertStateWiseWeightCsv = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a CSV file using field state-wise-weight-file.",
            });
        }

        const rows = [];
        const rowErrors = [];
        let rowNumber = 1;

        // Parse uploaded CSV buffer row-by-row to avoid loading a separate temp file.
        Readable.from(req.file.buffer.toString("utf-8"))
            .pipe(csvParser())
            .on("data", (rawRow) => {
                rowNumber += 1;

                const row = mapCsvRowToStateWiseWeight(rawRow);

                if (!row.continent || !row.country || !row.state || !row.rank) {
                    rowErrors.push({
                        rowNumber,
                        reason: "Missing required fields: continent/country/state/rank",
                    });
                    return;
                }

                rows.push(row);
            })
            .on("end", async () => {
                try {
                    if (!rows.length) {
                        return res.status(400).json({
                            message: "No valid rows were found in CSV.",
                            rowErrors,
                        });
                    }

                    // Upsert by country + state so repeated imports update existing records.
                    const operations = rows.map((row) => ({
                        updateOne: {
                            filter: { country: row.country, state: row.state },
                            update: { $set: row },
                            upsert: true,
                        },
                    }));

                    const result = await StateWiseWeight.bulkWrite(operations, {
                        ordered: false,
                    });

                    return res.status(200).json({
                        message: "State-wise weight CSV imported successfully.",
                        processedRows: rows.length,
                        rowErrors,
                        matchedCount: result.matchedCount,
                        modifiedCount: result.modifiedCount,
                        upsertedCount: result.upsertedCount,
                    });
                } catch (error) {
                    return next(error);
                }
            });
    } catch (error) {
        next(error);
    }
};