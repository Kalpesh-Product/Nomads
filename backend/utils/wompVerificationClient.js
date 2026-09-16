// Outbound calls into WoNoMasterPanel for self-serve verification
// renew/change-plan. Unlike nomadListingStatus.js (best-effort, swallows
// failures), these calls are ones the user is actively waiting on, so they
// throw on failure instead — same style as hostPanelAccounts.js's
// checkHostPanelEmail.
const wompBaseUrl = () =>
  String(process.env.MASTERPANEL_API_BASE_URL || "http://localhost:5007/api")
    .trim()
    .replace(/\/+$/, "");

const callWomp = async (path, { method = "GET", body } = {}) => {
  const url = `${wompBaseUrl()}${path}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-nomads-service-key": process.env.WOMP_INTERNAL_API_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal:
        typeof AbortSignal?.timeout === "function"
          ? AbortSignal.timeout(15_000)
          : undefined,
    });
  } catch (cause) {
    const error = new Error("Payment service is unavailable");
    error.status = 503;
    error.cause = cause;
    throw error;
  }

  if (!response.ok) {
    const rawBody = await response.text();
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(rawBody)?.message;
    } catch {
      // Not JSON — likely an HTML error page from a crash/proxy. Log the raw
      // body below so the real cause is visible instead of just the fallback.
    }
    console.error(
      `WoMP call failed (status ${response.status}, url ${url}):`,
      rawBody.slice(0, 2000),
    );
    const error = new Error(parsedMessage || "Payment service request failed");
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const createVerificationPaymentLink = async ({ nomadsRequestId, tier }) =>
  callWomp(
    `/internal/verification-payments/${encodeURIComponent(nomadsRequestId)}/create-link`,
    { method: "POST", body: { tier } },
  ); // { paymentLinkUrl }

export const getVerificationPaymentHistory = async ({ nomadsRequestId }) =>
  callWomp(
    `/internal/verification-payments/${encodeURIComponent(nomadsRequestId)}/history`,
  ); // { data: [...] }
