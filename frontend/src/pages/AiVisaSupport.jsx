import React from "react";
import AiValueAdditionForm from "./AiValueAdditionForm";

const visaSupportOptions = [
  "Free Services - Visa eligibility check",
  "Free Services - Required documents checklist",
  "Free Services - Processing timeline",
  "Free Services - Recommended visa type",
  "Free Services - Estimated approval chances",
  "Paid Services - Visa Consultation (1-on-1 expert call / Personalized visa strategy / Country comparison)",
  "Paid Services - Application Support (Form filling assistance / Document review / SOP / cover letter drafting)",
  "Paid Services - End-to-End Visa Processing (Appointment booking / Submission tracking)",
];

const AiVisaSupport = () => (
  <AiValueAdditionForm
    title="Visa Support"
    selectLabel="Service Required"
    selectFieldName="serviceRequired"
    options={visaSupportOptions}
    sheetName="AI_Visa_Support"
    extraFields={[
      {
        name: "passportValidity",
        label: "Passport Validity (expiry date)",
        type: "date",
        required: true,
      },
      {
        name: "currentResidence",
        label: "Current City/Country of Residence",
        required: true,
      },
    ]}
  />
);

export default AiVisaSupport;
