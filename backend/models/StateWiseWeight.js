import mongoose from "mongoose";

const stateWiseWeightSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },

        rank: {
            type: Number,
            required: true,
        },

        weight: {
            // Core Infra
            workInfrastructure: { type: Number, default: 0, required: true },
            internet: { type: Number, default: 0, required: true },
            costOfLiving: { type: Number, default: 0, required: true },
            safety: { type: Number, default: 0, required: true },
            visaFlexibility: { type: Number, default: 0, required: true },
            nomadCommunity: { type: Number, default: 0, required: true },
            healthcareCostIndex: { type: Number, default: 0, required: true },
            startupEcosystemScore: { type: Number, default: 0, required: true },
            airQualityIndex: { type: Number, default: 0, required: true },

            // Connectivity
            airportConnectivity: { type: Number, default: 0, required: true },
            directInternationalFlights: { type: Number, default: 0, required: true },

            // Financial
            taxFriendly: { type: Number, default: 0, required: true },
            purchasingPower: { type: Number, default: 0, required: true },
            inflationStability: { type: Number, default: 0, required: true },
            startupSetupCost: { type: Number, default: 0, required: true },

            // Lifestyle
            partyLifestyle: { type: Number, default: 0, required: true },
            nightlife: { type: Number, default: 0, required: true },
            meetupsEvents: { type: Number, default: 0, required: true },
            soloNomad: { type: Number, default: 0, required: true },
            coupleNomads: { type: Number, default: 0, required: true },
            femaleNomads: { type: Number, default: 0, required: true },
            familyNomads: { type: Number, default: 0, required: true },
            founderNomads: { type: Number, default: 0, required: true },
            yoga: { type: Number, default: 0, required: true },
            nature: { type: Number, default: 0, required: true },
            adventure: { type: Number, default: 0, required: true },

            // Career / Startup
            ventureCapital: { type: Number, default: 0, required: true },
            incubators: { type: Number, default: 0, required: true },
            techTalentDensity: { type: Number, default: 0, required: true },
            conferences: { type: Number, default: 0, required: true },
            remoteJobs: { type: Number, default: 0, required: true },
        },
    },
    { timestamps: true }
);

export default mongoose.model("StateWiseWeight", stateWiseWeightSchema);