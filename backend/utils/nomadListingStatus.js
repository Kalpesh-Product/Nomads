import axios from "axios";

const MASTERPANEL_API_BASE_URL = (
  process.env.MASTERPANEL_API_BASE_URL || "http://localhost:5007/api"
).replace(/\/$/, "");

// Shared by leadsController.js and reviewControllers.js: a company can only
// receive website leads/reviews once it's a real Companies-page entry in
// Nomads' own DB (each caller's own `Company.findOne` — that's the actual
// gate, unchanged by this). This just figures out *why* it isn't one yet, by
// asking MasterPanel (source of truth for host onboarding state) which of
// the 3 steps — add a listing, request to be listed, staff transfer — is
// missing, so a generic "Company not found" can become an actionable
// message instead. Never blocks/changes the gate itself; if this lookup
// fails for any reason, returns null so the caller falls back to its
// original generic message.
export const describeMissingNomadListingStep = async (companyId) => {
  try {
    const { data } = await axios.get(
      `${MASTERPANEL_API_BASE_URL}/hosts/host-companies/${encodeURIComponent(companyId)}/nomad-link`,
      { timeout: 5000 },
    );
    if (data?.alreadyInCompanies || data?.linkedNomadsCompanyId) {
      // Data inconsistency (says transferred but not found locally yet) —
      // no specific step to blame, fall back to the generic message.
      return null;
    }
    if (data?.companiesListingRequestedAt) {
      return "Your request to be listed is still pending staff review — this site can't accept enquiries/reviews until it's approved and transferred.";
    }
    return "Submit a request to be listed on Nomads before this site can accept enquiries/reviews.";
  } catch (error) {
    if (error?.response?.status === 404) {
      return "Add at least one Nomads listing before this site can accept enquiries/reviews.";
    }
    // MasterPanel unreachable or any other error — don't let a diagnostics
    // call fail the response, just fall back to the generic message.
    return null;
  }
};
