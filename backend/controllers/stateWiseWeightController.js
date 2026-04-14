import StateWiseWeight from "../models/StateWiseWeight";
import { stateWiseWeightCalculation } from "../controllers/stateWiseWeightCalculation.js"; // Update path if needed

export const getStateWiseWeight = async (req, res, next) => {
    try {
        // 1. Fetch data from Database
        const stateWiseWeight = await StateWiseWeight.find().populate({
            path: "company",
            select: "continent, country, state"
        });

        // 2. Loop through each city and calculate the 37 formulas
        const dataWithScores = stateWiseWeight.map(item => {
            const plainItem = item.toObject();

            // 3. Directly pass the DB weights to the calculation function!
            plainItem.calculatedScores = stateWiseWeightCalculation(plainItem.weight);

            return plainItem;
        });

        // 4. Send the final response
        res.status(200).json({
            success: true,
            count: dataWithScores.length,
            data: dataWithScores
        });
    } catch (error) {
        next(error);
    }
};