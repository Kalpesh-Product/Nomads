import StateWiseWeight from "../models/StateWiseWeight.js";
import { stateWiseWeightCalculation } from "../controllers/stateWiseWeightCalculation.js";

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
