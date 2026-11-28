const partnersPanelApiBaseUrl = () => {
  const configured =
    process.env.PARTNERS_PANEL_API_URL ||
    (process.env.NODE_ENV === "production"
      ? process.env.PARTNERS_PANEL_API_URL_PROD
      : process.env.PARTNERS_PANEL_API_URL_DEV);

  return String(configured || "http://localhost:5008/api")
    .trim()
    .replace(/\/+$/, "");
};

export const checkPartnerPanelEmail = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return false;

  let url;
  let response;
  try {
    url = new URL(`${partnersPanelApiBaseUrl()}/admin/check-email`);
    url.searchParams.set("email", normalizedEmail);
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-admin-api-key": String(process.env.PARTNERS_PANEL_ADMIN_API_KEY || ""),
      },
      signal:
        typeof AbortSignal?.timeout === "function"
          ? AbortSignal.timeout(8_000)
          : undefined,
    });
  } catch (cause) {
    const error = new Error("Partners Panel email validation is unavailable");
    error.status = 503;
    error.cause = cause;
    throw error;
  }

  if (!response.ok) {
    const error = new Error("Partners Panel email validation is unavailable");
    error.status = 503;
    throw error;
  }

  const data = await response.json();
  return Boolean(data?.exists);
};
