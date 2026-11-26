export const CONTRIBUTOR_ROLE_OPTIONS = {
  isBlogger: ["become a blogger", "become a nomad blog & news writer"],
  isNewsWriter: ["become a news writer", "become a nomad blog & news writer"],
  isEventWriter: ["contribute to events", "become a content creator", "become a content contributor"],
  isPlaceWriter: ["contribute to places", "become a content creator", "become a content contributor"],
  isVisaPartner: ["become a visa & immigration partner"],
  isCompanySetupPartner: ["become a company setup services partner"],
  isActivationSupportPartner: ["become a activation support partner"],
  isConsultationSupportPartner: ["become a consultation support partner"],
  isWorkationPartner: ["become a workation support partner"],
};

// These roles are leads for the Partners Panel, not the Contributions program —
// they get their own invite/registration flow (TODO), not the Contributions email below.
export const PARTNER_ROLE_KEYS = [
  "isVisaPartner",
  "isCompanySetupPartner",
  "isActivationSupportPartner",
  "isConsultationSupportPartner",
  "isWorkationPartner",
];

export const getRequestedContributorRoles = (contributionType) => {
  const options = (Array.isArray(contributionType) ? contributionType : String(contributionType || "").split(","))
    .map((option) => String(option).toLowerCase().replace(/\s+/g, " ").trim());
  return Object.keys(CONTRIBUTOR_ROLE_OPTIONS).filter((role) =>
    CONTRIBUTOR_ROLE_OPTIONS[role].some((option) => options.includes(option)),
  );
};

export const getContributorRoleStatus = (user) =>
  Object.fromEntries(Object.keys(CONTRIBUTOR_ROLE_OPTIONS).map((role) => [role, user?.[role] === true]));
