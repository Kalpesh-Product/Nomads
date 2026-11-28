import test from "node:test";
import assert from "node:assert/strict";
import { checkPartnerPanelEmail } from "../utils/partnerPanelAccounts.js";

test("partner email validation normalizes the email and reports joined accounts", async (t) => {
  const previousUrl = process.env.PARTNERS_PANEL_API_URL_DEV;
  const previousKey = process.env.PARTNERS_PANEL_ADMIN_API_KEY;
  process.env.PARTNERS_PANEL_API_URL_DEV = "http://localhost:5008/api";
  process.env.PARTNERS_PANEL_ADMIN_API_KEY = "test-key";
  t.after(() => {
    if (previousUrl === undefined) delete process.env.PARTNERS_PANEL_API_URL_DEV;
    else process.env.PARTNERS_PANEL_API_URL_DEV = previousUrl;
    if (previousKey === undefined) delete process.env.PARTNERS_PANEL_ADMIN_API_KEY;
    else process.env.PARTNERS_PANEL_ADMIN_API_KEY = previousKey;
  });

  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(
      String(url),
      "http://localhost:5008/api/admin/check-email?email=partner%40example.com",
    );
    assert.equal(options.headers["x-admin-api-key"], "test-key");
    return { ok: true, json: async () => ({ exists: true }) };
  });

  assert.equal(await checkPartnerPanelEmail(" Partner@Example.com "), true);
});

test("partner email validation fails closed when Partners Panel is unavailable", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({ ok: false }));
  await assert.rejects(
    () => checkPartnerPanelEmail("partner@example.com"),
    (error) => error.status === 503,
  );
});
