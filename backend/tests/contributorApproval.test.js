import test from "node:test";
import assert from "node:assert/strict";
import BecomeContributor from "../models/BecomeContributor.js";
import NomadUser from "../models/NomadUser.js";
import { createBecomeContributor, getBecomeContributorRequests, updateContributorLeadStatus } from "../controllers/becomeContributorController.js";
import { authenticateContributorSubmission, requireContributorRole } from "../middlewares/contributorAccess.js";
import { verifyAdminApiKey } from "../middlewares/verifyAdminApiKey.js";
import { getRequestedContributorRoles, getContributorRoleStatus } from "../utils/contributorRoles.js";
import { addB2CformSubmission } from "../controllers/form-controllers/b2cFormControllers.js";

const leadId = "507f1f77bcf86cd799439011";
const userId = "507f191e810c19729de860ea";
const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const fail = (error) => { throw error; };
const query = (data) => ({ select() { return this; }, lean: async () => data });

test("new accounts are inactive and combined requests map to independent roles", () => {
  assert.deepEqual(getContributorRoleStatus(new NomadUser()), {
    isBlogger: false, isNewsWriter: false, isEventWriter: false, isPlaceWriter: false,
  });
  assert.deepEqual(getRequestedContributorRoles("Become a Nomad Blog & News Writer"), ["isBlogger", "isNewsWriter"]);
  assert.deepEqual(getRequestedContributorRoles("Become a Content Creator"), ["isEventWriter", "isPlaceWriter"]);
  assert.deepEqual(getRequestedContributorRoles("Become a Visa & Immigration Partner"), []);
});

test("submission records the signed-in account and never grants roles supplied in the body", async (t) => {
  let saved;
  t.mock.method(BecomeContributor, "create", async (payload) => { saved = payload; return payload; });
  const res = response();
  await createBecomeContributor({ userData: { _id: userId }, body: {
    contributionType: "Become a Nomad Blog & News Writer", fullName: "Test Contributor",
    currentCountry: "India", linkedinProfile: "https://example.com/test", email: "test@example.com",
    contactCode: "+91", contactNumber: "1234567890", nomadUser: leadId, isBlogger: true,
  } }, res, fail);
  assert.equal(res.statusCode, 201);
  assert.equal(saved.nomadUser, userId);
  assert.equal(saved.isBlogger, undefined);
});

test("the website form saves its pending lead before acknowledging submission", async (t) => {
  let saved;
  t.mock.method(BecomeContributor, "create", async (payload) => { saved = payload; });
  // Email and Sheets are separate background work; do not send external test messages.
  t.mock.method(globalThis, "setImmediate", () => {});
  const res = response();
  await addB2CformSubmission({ userData: { _id: userId }, body: {
    sheetName: "AI_Become_Contributor", contributionType: "Become a Content Creator",
    fullName: "Test Contributor", currentCountry: "India", linkedinProfile: "https://example.com/test",
    email: "test@example.com", contactCode: "+91", contactNumber: "1234567890", isEventWriter: true,
  } }, res, fail);
  assert.equal(res.statusCode, 201);
  assert.equal(saved.nomadUser, userId);
  assert.equal(saved.contributionType, "Become a Content Creator");
  assert.equal(saved.isEventWriter, undefined);
});

test("a lead is inactive until approval and status follows the linked account rather than editable email", async (t) => {
  t.mock.method(BecomeContributor, "find", () => ({ sort: () => query([
    { _id: leadId, nomadUser: userId, email: "other@example.com" },
    { _id: "legacy", email: "legacy@example.com" },
    { _id: "missing", email: "missing@example.com" },
  ]) }));
  t.mock.method(NomadUser, "find", () => query([
    { _id: userId, email: "account@example.com", isBlogger: true, isNewsWriter: false },
    { _id: "legacy-user", email: "legacy@example.com", isPlaceWriter: true },
  ]));
  const res = response();
  await getBecomeContributorRequests({}, res, fail);
  assert.equal(res.body.data[0].isBlogger, true);
  assert.equal(res.body.data[0].isNewsWriter, false);
  assert.equal(res.body.data[1].isPlaceWriter, true);
  assert.equal(res.body.data[2].isBlogger, false);
});

test("approval and revocation update only the selected role for each of the four tabs", async (t) => {
  const account = getContributorRoleStatus();
  t.mock.method(BecomeContributor, "findById", () => query({
    _id: leadId, nomadUser: userId, email: "other@example.com",
    contributionType: "Become a Nomad Blog & News Writer, Become a Content Creator",
  }));
  t.mock.method(NomadUser, "findOneAndUpdate", (filter, update) => {
    assert.deepEqual(filter, { _id: userId });
    assert.equal(Object.keys(update.$set).length, 1);
    Object.assign(account, update.$set);
    return query({ ...account });
  });
  for (const role of Object.keys(account)) {
    for (const isActive of [true, false]) {
      const before = { ...account };
      const res = response();
      await updateContributorLeadStatus({ params: { id: leadId }, body: { role, isActive } }, res, fail);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(account, { ...before, [role]: isActive });
      assert.equal(res.body.data[role], isActive);
    }
  }
});

test("invalid roles, unrequested roles and string statuses cannot activate access", async (t) => {
  t.mock.method(BecomeContributor, "findById", () => query({ contributionType: "Become a Nomad Blog & News Writer" }));
  for (const body of [{ role: "isAdmin", isActive: true }, { role: "isBlogger", isActive: "true" }, { role: "isPlaceWriter", isActive: true }]) {
    const res = response();
    await updateContributorLeadStatus({ params: { id: leadId }, body }, res, fail);
    assert.equal(res.statusCode, 400);
  }
});

test("legacy leads use their registered email and missing accounts produce a clear error", async (t) => {
  t.mock.method(BecomeContributor, "findById", () => query({ email: "legacy@example.com", contributionType: "Become a Blogger" }));
  t.mock.method(NomadUser, "findOneAndUpdate", (filter) => {
    assert.deepEqual(filter, { email: "legacy@example.com" });
    return query(null);
  });
  const res = response();
  await updateContributorLeadStatus({ params: { id: leadId }, body: { role: "isBlogger", isActive: true } }, res, fail);
  assert.equal(res.statusCode, 409);
});

test("server checks current approval even when the JWT still claims active access", async (t) => {
  let active = false;
  t.mock.method(NomadUser, "findById", () => query({ isBlogger: active }));
  const req = { userData: { _id: userId, isBlogger: true } };
  const res = response();
  await requireContributorRole("isBlogger")(req, res, () => assert.fail("Inactive role passed"));
  assert.equal(res.statusCode, 403);
  active = true;
  let allowed = false;
  await requireContributorRole("isBlogger")(req, response(), () => { allowed = true; });
  assert.equal(allowed, true);
});

test("contributor submission needs login; partner submissions remain public; admin status needs admin key", () => {
  const res = response();
  authenticateContributorSubmission({ headers: {}, body: { contributionType: "Become a Content Creator" } }, res, () => assert.fail("Anonymous contributor passed"));
  assert.equal(res.statusCode, 401);
  let allowed = false;
  authenticateContributorSubmission({ body: { contributionType: "Not Sure - Lets Connect & Explore" } }, response(), () => { allowed = true; });
  assert.equal(allowed, true);
  const adminRes = response();
  verifyAdminApiKey({ headers: {} }, adminRes, () => assert.fail("Non-admin passed"));
  assert.equal(adminRes.statusCode, 401);
});
