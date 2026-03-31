import React from "react";
import AiServiceSupportForm from "./AiServiceSupportForm";

const consultationOptions = [
  "Visa Consultation",
  "Immigration Consultation",
  "Tax Consultation",
  "Financial Consultation",
  "Accommodation Consultation",
  "Business Setup Consultation",
  "Other",
];

const AiConsultation = () => (
  <AiServiceSupportForm
    title="Consultation"
    countryLabel="Consultation Country"
    countryFieldName="consultationCountry"
    supportFieldName="supportRequired"
    supportOptions={consultationOptions}
    sheetName="AI_Consultation"
  />
);

export default AiConsultation;
