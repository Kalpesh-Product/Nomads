import StateWiseWeight from "../models/StateWiseWeight.js";
import Company from "../models/Company.js";
import { stateWiseWeightCalculation } from "../controllers/stateWiseWeightCalculation.js";

export const getStateWiseWeight = async (req, res, next) => {
    try {
        const { attribute = "bestForNomads" } = req.query;

        // 1. Fetch all state weights and calculate scores
        const stateWeights = await StateWiseWeight.find().lean();
        const stateScoreMap = {};

        stateWeights.forEach(item => {
            const scores = stateWiseWeightCalculation(item.weight);
            // Normalize state name for joining
            const stateKey = item.state.trim().toLowerCase();
            stateScoreMap[stateKey] = scores;
        });

        // 2. Fetch all active companies
        const companies = await Company.find({
            isActive: true,
            companyType: { $ne: "privatestay" }
        })
            .select("_id companyName companyId companyType country state city address about website businessId registeredEntityName images logo ratings totalReviews inclusions latitude longitude continent")
            .lean();

        // 3. Join companies with their state scores
        const enrichedCompanies = companies.map(company => {
            const stateKey = (company.state || "").trim().toLowerCase();
            const scores = stateScoreMap[stateKey] || {};

            return {
                ...company,
                calculatedScores: scores
            };
        });

        // 4. Sort by requested attribute in descending order
        enrichedCompanies.sort((a, b) => {
            const scoreA = a.calculatedScores[attribute] || 0;
            const scoreB = b.calculatedScores[attribute] || 0;
            return scoreB - scoreA;
        });

        res.status(200).json({
            success: true,
            count: enrichedCompanies.length,
            selectedAttribute: attribute,
            data: enrichedCompanies
        });
    } catch (error) {
        next(error);
    }
};