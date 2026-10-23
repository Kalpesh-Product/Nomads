import axios from "axios";

const MASTERPANEL_API_BASE_URL = (
  process.env.MASTERPANEL_API_BASE_URL || "http://localhost:5007/api"
).replace(/\/$/, "");

// The only place a "$199" figure should be typed anymore — everywhere else
// (AiHostPricing card, AiHostSignup plan dropdown, the host-signup
// confirmation email) reads it live from here instead of a hardcoded
// string, so it always matches whatever staff set on MasterPanel's Plan
// Pricing settings page. Fails soft to DEFAULT_PROFESSIONAL_PLAN_PRICE_USD
// if MasterPanel is unreachable, so public pages never break because of it.
export const DEFAULT_PROFESSIONAL_PLAN_PRICE_USD = 199;

export const getProfessionalPlanPricing = async () => {
  try {
    const { data } = await axios.get(`${MASTERPANEL_API_BASE_URL}/public/plan-pricing`, {
      timeout: 5000,
    });
    const monthly = Number(data?.professionalPlanPriceUsd);
    const resolvedMonthly =
      Number.isFinite(monthly) && monthly > 0 ? monthly : DEFAULT_PROFESSIONAL_PLAN_PRICE_USD;
    // Annual is the full yearly total (e.g. $1,999/yr), charged once for a
    // 12-month cycle. Falls back to 12× the monthly rate (no discount) when
    // unset so display/charging never breaks on a missing value.
    const annual = Number(data?.professionalAnnualPlanPriceUsd);
    const resolvedAnnual =
      Number.isFinite(annual) && annual > 0
        ? annual
        : Math.round(resolvedMonthly * 12 * 100) / 100;
    return {
      professionalPlanPriceUsd: resolvedMonthly,
      professionalAnnualPlanPriceUsd: resolvedAnnual,
    };
  } catch (error) {
    console.error("Failed to fetch live Professional plan price from MasterPanel:", error.message);
    return {
      professionalPlanPriceUsd: DEFAULT_PROFESSIONAL_PLAN_PRICE_USD,
      professionalAnnualPlanPriceUsd:
        Math.round(DEFAULT_PROFESSIONAL_PLAN_PRICE_USD * 12 * 100) / 100,
    };
  }
};

export const getProfessionalPlanPriceUsd = async () => {
  const { professionalPlanPriceUsd } = await getProfessionalPlanPricing();
  return professionalPlanPriceUsd;
};