// Shared between VerifyBusiness.jsx (initial submission) and MyVerification.jsx
// (self-serve renew/change-plan) — keep in sync with the backend's
// VERIFICATION_TIER_AMOUNTS_USD in D:\Nomads\backend\controllers\verificationControllers.js.
export const TIER_OPTIONS = [
  { value: "1m", label: "1 Month", price: 10 },
  { value: "3m", label: "3 Months", price: 25 },
  { value: "6m", label: "6 Months", price: 45 },
  { value: "1y", label: "1 Year", price: 80 },
];

export const TIER_LABELS = TIER_OPTIONS.reduce((acc, tier) => {
  acc[tier.value] = tier.label;
  return acc;
}, {});

export const TIER_MONTHS = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 };

export const CHANGE_TYPE_LABELS = {
  initial: "Initial Activation",
  renewal: "Renewal",
  upgrade: "Upgrade",
  downgrade: "Downgrade",
};

// Mirrors computeExtendedExpiry/computeProjectedPeriod on the backends — used
// here only to PREVIEW the new plan's start/end dates before paying; the
// authoritative value is whatever Nomads computes once payment succeeds.
export const computeProjectedPeriod = (currentExpiresAt, tier) => {
  const months = TIER_MONTHS[tier] || 1;
  const start =
    currentExpiresAt && new Date(currentExpiresAt) > new Date()
      ? new Date(currentExpiresAt)
      : new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  return { start, end };
};
