import StateWiseWeight from "../models/StateWiseWeight.js";
import { stateWiseWeightCalculation } from "../controllers/stateWiseWeightCalculation.js";

export const getStateWiseWeight = async (req, res, next) => {
    try {
        const stateWiseWeight = await StateWiseWeight.find().populate({
            path: "company",
            select: "continent, country, state"
        });

        const dataWithScores = stateWiseWeight.map(item => {
            const plainItem = item.toObject();

            plainItem.calculatedScores = stateWiseWeightCalculation(plainItem.weight);

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