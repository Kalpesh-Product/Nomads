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

export const getProfessionalPlanPriceUsd = async () => {
  try {
    const { data } = await axios.get(`${MASTERPANEL_API_BASE_URL}/public/plan-pricing`, {
      timeout: 5000,
    });
    const price = Number(data?.professionalPlanPriceUsd);
    return Number.isFinite(price) && price > 0 ? price : DEFAULT_PROFESSIONAL_PLAN_PRICE_USD;
  } catch (error) {
    console.error("Failed to fetch live Professional plan price from MasterPanel:", error.message);
    return DEFAULT_PROFESSIONAL_PLAN_PRICE_USD;
  }
};
