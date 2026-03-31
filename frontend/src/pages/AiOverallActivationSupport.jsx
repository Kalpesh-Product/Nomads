import React from "react";
import AiServiceSupportForm from "./AiServiceSupportForm";

const activationSupportOptions = [
  "Visa & Immigration",
  "Relocation Assistance",
  "Accommodation Support",
  "On-ground Activation",
  "Compliance & Documentation",
  "Other",
];

const AiOverallActivationSupport = () => (
  <AiServiceSupportForm
    title="Overall Activation Support"
    countryLabel="Travel Country"
    countryFieldName="travelCountry"
    supportFieldName="supportRequired"
    supportOptions={activationSupportOptions}
    sheetName="AI_Overall_Activation_Support"
  />
);

export default AiOverallActivationSupport;
