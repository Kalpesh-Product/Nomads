import StateWiseWeight from "../models/StateWiseWeight.js";
import { stateWiseWeightCalculation } from "../controllers/stateWiseWeightCalculation.js";

export const getStateWiseWeight = async (req, res, next) => {
    try {
        const { continent, attribute = "bestForNomads" } = req.body;

        let query = {};

        // 1. Filter by continent if provided and not "World"
        if (continent && continent.toLowerCase() !== "world") {
            query.continent = { $regex: new RegExp(`^${continent}$`, "i") };
        }

        // 2. Fetch state weights based on query
        const stateWeights = await StateWiseWeight.find(query).lean();


        // 3. Calculate scores for each state and pick the requested attribute
        const results = stateWeights.map(item => {
            const allScores = stateWiseWeightCalculation(item.weight);
            const scoreForSorting = allScores[attribute] || 0;

            return {
                state: item.state,
                weight: item.weight,
                calculatedScores: allScores
            };
        });

        // 4. Sort by the requested attribute score in descending order
        results.sort((a, b) => {
            const scoreA = a.calculatedScores[attribute] || 0;
            const scoreB = b.calculatedScores[attribute] || 0;
            return scoreB - scoreA;
        });


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
