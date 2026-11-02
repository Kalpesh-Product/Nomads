import test from "node:test";
import assert from "node:assert/strict";
import NomadUser from "../models/NomadUser.js";
import { buildContributorActivationEmail, notifyFirstContributorActivation } from "../utils/contributorActivationEmail.js";

const user = { _id: "507f191e810c19729de860ea", email: "test@example.com", fullName: "Test Contributor" };
const query = (data) => ({ select() { return this; }, lean: async () => data });

test("the activation email uses the WONO shell, personal greeting and Contributions link", () => {
  const email = buildContributorActivationEmail({ ...user, fullName: "Test <script>" });
  assert.equal(email.to, user.email);
  assert.match(email.subject, /Contributions.*Activated/);
  assert.match(email.html, /Contributions Activated!/);
  assert.match(email.html, /Hello Test &lt;script&gt;/);
  assert.ok(!email.html.includes("Hello Test <script>"));
  assert.match(email.html, /email-logo-wono/);
  assert.match(email.html, /response@wono.co/);
  assert.match(email.html, /https:\/\/www.wono.co\/contributions/);
  assert.match(email.text, /categories approved for you/);
});

test("first activation sends once across simultaneous approvals and subsequent reactivations", async (t) => {
  let sentAt = null;
  const deliveries = [];
  t.mock.method(NomadUser, "findOneAndUpdate", (filter, update) => {
    assert.equal(filter._id, user._id);
    assert.equal(filter.contributionsActivationEmailSentAt, null);
    assert.equal(filter.$or.length, 4);
    if (sentAt) return query(null);
    sentAt = update.$set.contributionsActivationEmailSentAt;
    return query(user);
  });
  const deliver = async (email) => { deliveries.push(email); };
  assert.deepEqual(await Promise.all([
    notifyFirstContributorActivation(user, deliver),
    notifyFirstContributorActivation(user, deliver),
  ]), [true, false]);
  assert.equal(await notifyFirstContributorActivation(user, deliver), false);
  assert.equal(deliveries.length, 1);
  assert.equal(deliveries[0].to, user.email);
});

test("mail failure clears only its reservation so delivery can be retried", async (t) => {
  let sentAt = null;
  t.mock.method(NomadUser, "findOneAndUpdate", (_filter, update) => {
    if (sentAt) return query(null);
    sentAt = update.$set.contributionsActivationEmailSentAt;
    return query(user);
  });
  t.mock.method(NomadUser, "updateOne", async (filter, update) => {
    assert.equal(filter._id, user._id);
    assert.equal(filter.contributionsActivationEmailSentAt, sentAt);
    assert.deepEqual(update, { $set: { contributionsActivationEmailSentAt: null } });
    sentAt = null;
  });
  await assert.rejects(notifyFirstContributorActivation(user, async () => { throw new Error("Mail unavailable"); }), /Mail unavailable/);
  assert.equal(sentAt, null);
  let delivered = false;
  assert.equal(await notifyFirstContributorActivation(user, async () => { delivered = true; }), true);
  assert.equal(delivered, true);
});

test("accounts without active roles do not receive an activation email", async (t) => {
  t.mock.method(NomadUser, "findOneAndUpdate", () => query(null));
  assert.equal(await notifyFirstContributorActivation(user, async () => assert.fail("Unexpected mail")), false);
});
