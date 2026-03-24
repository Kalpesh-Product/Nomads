import React from "react";
import AiValueAdditionForm from "./AiValueAdditionForm";

const consultationOptions = [
  "Visa Consultation",
  "Immigration Consultation",
  "Tax Consultation",
  "Financial Consultation",
  "Accommodation Consultation",
  "Lifestyle Consultation",
  "Business registration Consultation",
  "Compliance & regulatory",
  "Terms & conditions Consultation",
  "Privacy policies Consultation",
  "Visa renewal & extension Consultation",
  "Personalised",
];

const AiConsultation = () => (
  <AiValueAdditionForm
    title="Consultation"
    selectLabel="Consultation Required"
    selectFieldName="consultationRequired"
    options={consultationOptions}
    sheetName="AI_Consultation"
  />
);

export default AiConsultation;
