import StateWiseWeight from "../models/StateWiseWeight";
import { stateWiseWeightCalculation } from "../controllers/stateWiseWeightCalculation.js"; // <-- Your 37 formulas file

const FORMULA_KEY_MAP = {
    workInfrastructure: "workInfrastructure",
    internet: "internet",
    costOfLiving: "costOfLiving",
    safety: "safety",
    visaFlexibility: "visaFlexibility",
    nomadCommunity: "nomadCommunity",
    healthcareCostIndex: "healthcareCostIndex",
    startupEcosystemScore: "startupEcosystemScore",
    airQualityIndex: "airQualityIndex",
    airportConnectivity: "airportConnectivity",
    directInternationalFlights: "directInternationalFlights",
    purchasingPower: "purchasingPower",
    inflationStability: "inflationStability",
    startupSetupCost: "startupSetupCost",
    founderNomads: "founderNomads",
    yoga: "yoga",
    techTalentDensity: "techTalentDensity",
    taxFriendly: "lowerTaxesTaxFriendly",
    partyLifestyle: "partyAndEventsNomadTraveller",
    nightlife: "nightlifeAndPubs",
    meetupsEvents: "meetupsAndEvents",
    soloNomad: "soloNomadTraveller",
    coupleNomads: "coupleNomadTravelletrs",
    femaleNomads: "girlNomadTraveller",
    familyNomads: "familyNomadTraveller",
    nature: "natureNomadTravelling",
    adventure: "adventureNomadTravelling",
    ventureCapital: "ventureCapitalPresence",
    incubators: "startupIncubatorsAndAccelerators",
    conferences: "conferencesAndEvents",
    remoteJobs: "remoteJobAvailability",
    qualityOfLife: "qualityOfLife",
    lifestyleEntertainment: "lifestyleEntertainment",
    climateEnvironment: "climateEnvironment",
    accessibility: "accessibility",
};

export const getStateWiseWeight = async (req, res, next) => {
    try {
        const stateWiseWeight = await StateWiseWeight.find().populate({
            path: "company",
            select: "continent, country, state"
        });

        const dataWithScores = stateWiseWeight.map(item => {
            const plainItem = item.toObject();
            const dbWeight = plainItem.weight;

            // 1. Translate DB keys to Company Formula keys
            const formattedForFormula = Object.entries(dbWeight).reduce((acc, [dbKey, value]) => {
                const formulaKey = FORMULA_KEY_MAP[dbKey];
                if (formulaKey) {
                    acc[formulaKey] = value;
                }
                return acc;
            }, {});

            // 2. Run the company's exact calculation
            plainItem.calculatedScores = stateWiseWeightCalculation(formattedForFormula);

            return plainItem;
        });

        res.status(200).json({
            success: true,
            count: dataWithScores.length,
            data: dataWithScores
        });
    } catch (error) {
        next(error);
    }
};