import * as yup from "yup";
import StateWiseWeight from "../models/StateWiseWeight";

import * as yup from "yup";

const stateWiseWeightSchema = yup.object({
    company: yup.string().trim().required("Company is required"),

    rank: yup
        .number()
        .typeError("Rank must be a number")
        .required("Rank is required"),

    weight: yup.object({
        // Core Infra
        workInfrastructure: yup.number().default(0).required(),
        internet: yup.number().default(0).required(),
        costOfLiving: yup.number().default(0).required(),
        safety: yup.number().default(0).required(),
        visaFlexibility: yup.number().default(0).required(),
        nomadCommunity: yup.number().default(0).required(),
        healthcareCostIndex: yup.number().default(0).required(),
        startupEcosystemScore: yup.number().default(0).required(),
        airQualityIndex: yup.number().default(0).required(),

        // Connectivity
        airportConnectivity: yup.number().default(0).required(),
        directInternationalFlights: yup.number().default(0).required(),

        // Financial
        taxFriendly: yup.number().default(0).required(),
        purchasingPower: yup.number().default(0).required(),
        inflationStability: yup.number().default(0).required(),
        startupSetupCost: yup.number().default(0).required(),

        // Lifestyle
        partyLifestyle: yup.number().default(0).required(),
        nightlife: yup.number().default(0).required(),
        meetupsEvents: yup.number().default(0).required(),
        soloNomad: yup.number().default(0).required(),
        coupleNomads: yup.number().default(0).required(),
        femaleNomads: yup.number().default(0).required(),
        familyNomads: yup.number().default(0).required(),
        founderNomads: yup.number().default(0).required(),
        yoga: yup.number().default(0).required(),
        nature: yup.number().default(0).required(),
        adventure: yup.number().default(0).required(),

        // Career / Startup
        ventureCapital: yup.number().default(0).required(),
        incubators: yup.number().default(0).required(),
        techTalentDensity: yup.number().default(0).required(),
        conferences: yup.number().default(0).required(),
        remoteJobs: yup.number().default(0).required(),
    }),
});

export const getStateWiseWeight = async (req, res, next) => {
    try {
        const stateWiseWeight = await stateWiseWeightSchema.find().populate({
            path: "company",
            select: "continent, country, state"
        })

        res.status(200).json({
            sucess: true,
            count: stateWiseWeight.length,
            data: stateWiseWeight
        })
    } catch (error) {
        next(error);
    }
}