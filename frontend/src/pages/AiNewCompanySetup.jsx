import React from "react";
import AiServiceSupportForm from "./AiServiceSupportForm";

const newCompanySetupOptions = [
  "Company Registration",
  "Tax Setup",
  "Legal & Compliance",
  "Banking Assistance",
  "Office/Virtual Office Setup",
  "Other",
];

const AiNewCompanySetup = () => (
  <AiServiceSupportForm
    title="New Company Setup"
    countryLabel="New Company Country"
    countryFieldName="newCompanyCountry"
    supportFieldName="supportRequired"
    supportOptions={newCompanySetupOptions}
    sheetName="AI_New_Company_Setup"
  />
);

export default AiNewCompanySetup;
