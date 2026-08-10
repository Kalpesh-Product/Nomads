const hostPanelBaseUrl = () =>
  String(process.env.HOST_PANEL_BE || "https://hostpanel.wono.co")
    .trim()
    .replace(/\/+$/, "");

export const checkHostPanelEmail = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return false;

  const url = new URL(`${hostPanelBaseUrl()}/api/auth/check-email`);
  url.searchParams.set("email", normalizedEmail);

  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal:
        typeof AbortSignal?.timeout === "function"
          ? AbortSignal.timeout(8_000)
          : undefined,
    });
  } catch (cause) {
    const error = new Error("HostPanel email validation is unavailable");
    error.status = 503;
    error.cause = cause;
    throw error;
  }

  if (!response.ok) {
    const error = new Error("HostPanel email validation is unavailable");
    error.status = 503;
    throw error;
  }

  const data = await response.json();
  return Boolean(data?.exists);
};
