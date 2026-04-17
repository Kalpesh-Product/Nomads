import StateWiseWeight from "../models/StateWiseWeight.js";
import { stateWiseWeightCalculation } from "../controllers/stateWiseWeightCalculation.js";
import { deleteFileFromS3ByUrl, uploadFileToS3 } from "../config/s3Config.js";
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

const CSV_TO_LABEL_MAP = {
  labelcostoflivingpermonth: "labelCostOfLivingPerMonth",
  labelinternetspeed: "labelInternetSpeed",
  labelaqivalue: "labelAqiValue",
  labelnomadtax: "labelNomadTax",
  labelresidenttax: "labelResidentTax",
  labelmostaffordable: "labelMostAffordable",
  labelsafestcities: "labelSafestCities",
  labeleasyvisa: "labelEasyVisa",
  labelstrongnomadcommunity: "labelStrongNomadCommunity",
  labelhealthcarefriendly: "labelHealthcareFriendly",
  labelstartupbusinessopportunities: "labelStartupBusinessOpportunities",
  labelcleanairenvironment: "labelCleanAirEnvironment",
  labelbestworkinfrastructure: "labelBestWorkInfrastructure",
  labelcheapestplaces: "labelCheapestPlaces",
  labelbestconnectedcitiesflights: "labelBestConnectedCitiesFlights",
  labelstrongnomadcommunitywfa: "labelStrongNomadCommunityWfa",
  labelfastinternetcities: "labelFastInternetCities",
  labelbestworkinfrastructurewfa: "labelBestWorkInfrastructureWfa",
  labelmaximumsavings: "labelMaximumSavings",
  labellowtaxation: "labelLowTaxation",
  labelpurchasingpower: "labelPurchasingPower",
  labelfinancialstability: "labelFinancialStability",
  labelstartupsetupcost: "labelStartupSetupCost",
  labelbalancedfinanciallifestyle: "labelBalancedFinancialLifestyle",
  labelsocialpartylifestyle: "labelSocialPartyLifestyle",
  labelchillwellnesslifestyle: "labelChillWellnessLifestyle",
  labeladventureexploration: "labelAdventureExploration",
  labelnomadcommunitynetworking: "labelNomadCommunityNetworking",
  labelcouplefriendlylifestyle: "labelCoupleFriendlyLifestyle",
  labelfamilyfriendlylifestyle: "labelFamilyFriendlyLifestyle",
  labelfemalefriendlylifestyle: "labelFemaleFriendlyLifestyle",
  labelfoundernomads: "labelFounderNomads",
  labelsolonamads: "labelSoloNomads",
  labelstartupecosystems: "labelStartupEcosystems",
  labelremotejobopportunities: "labelRemoteJobOpportunities",
  labelfoundernomadsayc: "labelFounderNomadsAyc",
  labeltechtalentdensity: "labelTechTalentDensity",
  labelstartupincubatorsaccelerators: "labelStartupIncubatorsAccelerators",
  labelbalancedcareergrowth: "labelBalancedCareerGrowth",
  labelventurecapitalpresence: "labelVentureCapitalPresence",
  labelconferencesevents: "labelConferencesEvents",
};

// Normalizes raw CSV keys so we can map inconsistent headers safely.
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
  const row = normalize(rawRow);

  const continent = row["continent"];
  const country = row["country"];
  const state = row["destination"];

  // Handle your new root-level fields
  const imageUrl = row["imagelink"]; // matches "Image Link" after normalize

  // Handle rank
  const rank = toNumber(row["rank"] !== undefined ? row["rank"] : row[""]);

  const weight = {};

  // Build the nested weight object from the mapping table.
  for (const [csvKey, schemaKey] of Object.entries(CSV_TO_SCHEMA_MAP)) {
    weight[schemaKey] = toNumber(row[csvKey]);
  }

  const labels = {};

  for (const [csvKey, schemaKey] of Object.entries(CSV_TO_LABEL_MAP)) {
    labels[schemaKey] = row[csvKey];
  }

  return {
    continent,
    country,
    state,
    rank,
    weight,
    imageUrl,
    labels,
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
      if (attribute === "strongNomadCommunity")
        effectiveAttribute = "strongNomadCommunityWFA";
      if (attribute === "bestWorkInfrastructure")
        effectiveAttribute = "bestWorkInfrastructureWFA";
    }

    // 2. Filter by continent if provided and not "World"
    if (continent && continent.toLowerCase() !== "world") {
      query.continent = { $regex: new RegExp(`^${continent}$`, "i") };
    }

    // 3. Fetch state weights based on query
    const stateWeights = await StateWiseWeight.find(query).lean();

    // 4. Calculate scores for each state and pick the requested attribute
    const results = stateWeights.map((item) => {
      const allScores = stateWiseWeightCalculation(item.weight);
      const scoreForSorting = allScores[effectiveAttribute] || 0;

      return {
        state: item.state,
        country: item.country,
        isActive: item.isActive,
        [effectiveAttribute]: scoreForSorting,
        imageUrl: item.imageUrl,
        labels: item.labels,
      };
    });

    // 5. Sort by the requested attribute score in descending order
    results.sort((a, b) => b[effectiveAttribute] - a[effectiveAttribute]);

    res.status(200).json({
      success: true,
      count: results.length,
      selectedAttribute: attribute,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllStateWiseWeight = async (req, res, next) => {
  try {
    const stateWiseWeight = await StateWiseWeight.find();

    const dataWithScores = stateWiseWeight.map((item) => {
      const plainItem = item.toObject();
      plainItem.calculatedScores = stateWiseWeightCalculation(plainItem.weight);
      return plainItem;
    });

    res.status(200).json({
      success: true,
      count: dataWithScores.length,
      data: dataWithScores,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStateWiseWeight = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "State-wise weight id is required.",
      });
    }

    const existingStateWiseWeight = await StateWiseWeight.findById(id);

    if (!existingStateWiseWeight) {
      return res.status(404).json({
        success: false,
        message: "State-wise weight data not found.",
      });
    }

    const updatePayload = { ...req.body };

    if (typeof updatePayload.weight === "string") {
      try {
        updatePayload.weight = JSON.parse(updatePayload.weight);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for weight field.",
        });
      }
    }

    if (typeof updatePayload.labels === "string") {
      try {
        updatePayload.labels = JSON.parse(updatePayload.labels);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for labels field.",
        });
      }
    }

    if (req.file) {
      const fileName = String(req.file.originalname || "image")
        .replace(/[/\\?%*:|"<>]/g, "_")
        .replace(/\s+/g, "_");
      const fileKey = `nomads/destinations/${id}/${Date.now()}-${fileName}`;
      const uploadedImage = await uploadFileToS3(fileKey, req.file);
      updatePayload.imageUrl = uploadedImage.url;

      const currentImageUrl = existingStateWiseWeight.imageUrl;
      const bucketHost = `${process.env.PROJECT_S3_BUCKET_NAME}.s3.${process.env.PROJECT_AWS_REGION}.amazonaws.com`;

      if (
        currentImageUrl &&
        currentImageUrl.includes(bucketHost) &&
        currentImageUrl !== uploadedImage.url
      ) {
        await deleteFileFromS3ByUrl(currentImageUrl);
      }
    }

    const updatedStateWiseWeight = await StateWiseWeight.findByIdAndUpdate(
      id,
      {
        $set: updatePayload,
      },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "State-wise weight data updated successfully.",
      data: updatedStateWiseWeight,
    });
  } catch (error) {
    return next(error);
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

          // SAFE BULK WRITE LOGIC
          const operations = rows.map((row) => {
            // 1. Always update these core fields
            const updateData = {
              continent: row.continent,
              country: row.country,
              state: row.state,
              rank: row.rank,
              weight: row.weight,
              labels: row.labels,
            };

            // 2. Conditionally add new fields ONLY if they exist in the CSV.
            // This prevents accidentally deleting existing DB data if a CSV column is missing.
            if (
              row.imageUrl !== undefined &&
              row.imageUrl !== null &&
              row.imageUrl !== ""
            ) {
              updateData.imageUrl = row.imageUrl;
            }

            return {
              updateOne: {
                filter: { country: row.country, state: row.state },
                update: { $set: updateData },
                upsert: true,
              },
            };
          });

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
