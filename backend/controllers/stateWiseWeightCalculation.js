// Core Factors Naming Convention (camelCase)
const bestForNomads =
    0.25 * workInfrastructure +
    0.25 * internet +
    0.15 * nomadCommunity +
    0.10 * costOfLiving +
    0.10 * visaFlexibility +
    0.05 * safety +
    0.05 * healthcareCostIndex +
    0.03 * startupEcosystemScore +
    0.02 * airQualityIndex;

const mostAffordable =
    0.45 * costOfLiving +
    0.15 * healthcareCostIndex +
    0.10 * safety +
    0.10 * airQualityIndex +
    0.08 * visaFlexibility +
    0.07 * internet +
    0.03 * workInfrastructure +
    0.01 * nomadCommunity +
    0.01 * startupEcosystemScore;

const safestCities =
    0.40 * safety +
    0.15 * healthcareCostIndex +
    0.10 * airQualityIndex +
    0.10 * costOfLiving +
    0.08 * visaFlexibility +
    0.07 * internet +
    0.05 * workInfrastructure +
    0.03 * nomadCommunity +
    0.02 * startupEcosystemScore;

const easyVisaOrLongStay =
    0.40 * visaFlexibility +
    0.20 * costOfLiving +
    0.10 * safety +
    0.08 * healthcareCostIndex +
    0.07 * nomadCommunity +
    0.05 * internet +
    0.05 * workInfrastructure +
    0.03 * airQualityIndex +
    0.02 * startupEcosystemScore;

const bestForRemoteWorkSetup =
    0.30 * internet +
    0.20 * workInfrastructure +
    0.15 * nomadCommunity +
    0.10 * costOfLiving +
    0.10 * airportConnectivity +
    0.15 * directInternationalFlights;

const cheapestPlaces =
    0.50 * costOfLiving +
    0.10 * internet +
    0.10 * workInfrastructure +
    0.10 * nomadCommunity +
    0.10 * airportConnectivity +
    0.10 * directInternationalFlights;

const bestConnectedCities =
    0.35 * directInternationalFlights +
    0.30 * airportConnectivity +
    0.10 * internet +
    0.10 * workInfrastructure +
    0.10 * nomadCommunity +
    0.05 * costOfLiving;

// Financial Factors
const maximumSavings =
    0.30 * costOfLiving +
    0.20 * taxFriendly +
    0.20 * purchasingPower +
    0.10 * inflationStability +
    0.10 * healthcareCostIndex +
    0.10 * startupSetupCost;

const lowTaxation =
    0.35 * taxFriendly +
    0.20 * costOfLiving +
    0.20 * purchasingPower +
    0.10 * inflationStability +
    0.10 * healthcareCostIndex +
    0.05 * startupSetupCost;

const financialStability =
    0.30 * inflationStability +
    0.20 * healthcareCostIndex +
    0.15 * costOfLiving +
    0.15 * taxFriendly +
    0.10 * purchasingPower +
    0.10 * startupSetupCost;

// Lifestyle Factors
const socialAndPartyLifestyle =
    0.25 * partyLifestyle +
    0.20 * nightlife +
    0.15 * meetupsEvents +
    0.15 * nomadCommunity +
    0.10 * soloNomad +
    0.05 * founderNomads +
    0.05 * coupleNomads +
    0.05 * femaleNomads;

const chillAndWellnessLifestyle =
    0.25 * yoga +
    0.20 * nature +
    0.15 * nomadCommunity +
    0.10 * soloNomad +
    0.10 * femaleNomads +
    0.10 * coupleNomads +
    0.10 * familyNomads;

const adventureAndExploration =
    0.30 * adventure +
    0.25 * nature +
    0.15 * soloNomad +
    0.10 * nomadCommunity +
    0.10 * coupleNomads +
    0.10 * femaleNomads;

const femaleFriendlyLifestyle =
    0.30 * femaleNomads +
    0.25 * safety +
    0.15 * nomadCommunity +
    0.10 * soloNomad +
    0.10 * meetupsEvents +
    0.05 * coupleNomads +
    0.05 * healthcareCostIndex;

// Career / Startup
const startupEcosystems =
    0.30 * startupEcosystemScore +
    0.20 * ventureCapital +
    0.15 * incubators +
    0.15 * techTalentDensity +
    0.10 * founderNomads +
    0.10 * conferences;

const remoteJobOpportunities =
    0.35 * remoteJobs +
    0.20 * internet +
    0.15 * workInfrastructure +
    0.10 * nomadCommunity +
    0.10 * startupEcosystemScore +
    0.10 * costOfLiving;