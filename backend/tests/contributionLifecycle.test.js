import test from "node:test";
import assert from "node:assert/strict";
import News from "../models/News.js";
import Event from "../models/Event.js";
import Place from "../models/Place.js";
import * as news from "../controllers/newsController.js";
import * as event from "../controllers/eventController.js";
import * as place from "../controllers/placeController.js";

const userId = "507f1f77bcf86cd799439011";
const itemId = "507f1f77bcf86cd799439012";
const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const request = (body) => ({
  userData: { _id: userId }, params: { id: itemId, eventId: itemId, placeId: itemId },
  body: { mainTitle: "Sample", eventName: "Sample", placeName: "Sample", shortDescription: "Description", destination: "Goa", ...body },
});
const next = (error) => { throw error; };

for (const [label, Model, controller, plural] of [["News", News, news, "News"], ["Event", Event, event, "Events"], ["Place", Place, place, "Places"]]) {
  const handlers = {
    remove: controller[`deleteMy${label}`], mine: controller[`getMy${plural}`],
    publicList: controller[`get${plural}`], moderationList: controller[`get${label}Contributions`],
    edit: controller[`updateMy${label}`], moderate: controller[`update${label}ContributionStatus`],
    adminEdit: controller[`update${label}`],
  };
  test(`${label}: deletion requires authentication, explicit agreement and a nonblank reason of at most 500 characters`, async (t) => {
    const update = t.mock.method(Model, "findOneAndUpdate", () => { throw new Error("Unexpected write"); });
    const unauthenticated = response();
    await handlers.remove({ body: {} }, unauthenticated, next);
    assert.equal(unauthenticated.statusCode, 401);
    for (const body of [
      {}, { agreedToDelete: "true", deletionReason: "Outdated" },
      { agreedToDelete: true }, { agreedToDelete: true, deletionReason: "   " },
      { agreedToDelete: true, deletionReason: {} },
      { agreedToDelete: true, deletionReason: "x".repeat(501) },
    ]) {
      const res = response();
      await handlers.remove(request(body), res, next);
      assert.equal(res.statusCode, 400);
    }
    assert.equal(update.mock.callCount(), 0);
  });

  test(`${label}: deletion is scoped to the authenticated owner and records the trimmed reason and timestamp`, async (t) => {
    t.mock.method(Model, "findOneAndUpdate", async (filter, update, options) => {
      assert.deepEqual(filter, { _id: itemId, contributor: userId, deletedAt: null });
      assert.equal(update.$set.deletionReason, "Information is outdated");
      assert.equal(update.$set.isActive, false);
      assert.ok(update.$set.deletedAt instanceof Date);
      assert.deepEqual(options, { new: true, runValidators: true });
      return { _id: itemId };
    });
    const res = response();
    await handlers.remove(request({ agreedToDelete: true, deletionReason: "  Information is outdated  " }), res, next);
    assert.equal(res.statusCode, 200);
  });

  test(`${label}: missing, foreign-owned and already deleted contributions return not found`, async (t) => {
    t.mock.method(Model, "findOneAndUpdate", async () => null);
    const res = response();
    await handlers.remove(request({ agreedToDelete: true, deletionReason: "Outdated" }), res, next);
    assert.equal(res.statusCode, 404);
  });

  test(`${label}: database failures reach the error handler`, async (t) => {
    const failure = new Error("Database unavailable");
    t.mock.method(Model, "findOneAndUpdate", async () => { throw failure; });
    let caught;
    await handlers.remove(request({ agreedToDelete: true, deletionReason: "Outdated" }), response(), (error) => { caught = error; });
    assert.equal(caught, failure);
  });

  test(`${label}: deleted contributions are excluded from public and contributor lists`, async (t) => {
    t.mock.method(Model, "find", (filter) => {
      assert.equal(filter.deletedAt, null);
      return { populate() { return this; }, sort: async () => [] };
    });
    for (const handler of [handlers.mine, handlers.publicList]) {
      const res = response();
      await handler({ userData: { _id: userId }, query: {} }, res, next);
      assert.equal(res.statusCode, 200);
    }
  });

  test(`${label}: editing and moderation cannot republish a deleted contribution`, async (t) => {
    t.mock.method(Model, "findOneAndUpdate", (filter) => {
      assert.equal(filter.deletedAt, null);
      return { populate: async () => null, then: (resolve) => resolve(null) };
    });
    for (const handler of [handlers.edit, handlers.moderate, handlers.adminEdit]) {
      const res = response();
      await handler(request({ status: "approved" }), res, next);
      assert.equal(res.statusCode, 404);
    }
  });


  test(`${label}: moderation lists include deleted contributions with their reason and previous review status`, async (t) => {
    const deletedAt = new Date("2026-10-30T08:00:00Z");
    const deleted = { _id: itemId, status: "rejected", deletedAt, deletionReason: "Outdated", rejectionReason: "Needs revision" };
    const active = { _id: "active", status: "pending" };
    t.mock.method(Model, "find", (filter) => {
      assert.equal(filter.deletedAt, undefined);
      return { populate() { return this; }, sort: async () => [{ ...deleted, toObject: () => deleted }, active] };
    });
    const res = response();
    await handlers.moderationList({ query: {} }, res, next);
    assert.equal(res.body.count, 2);
    assert.deepEqual(res.body.data[0], { ...deleted, status: "deleted", statusBeforeDeletion: "rejected" });
    assert.equal(res.body.data[1], active);
  });

  test(`${label}: moderation status filters distinguish deleted contributions from their previous status`, async (t) => {
    let expected;
    t.mock.method(Model, "find", (filter) => {
      assert.deepEqual(filter.deletedAt, expected);
      assert.equal(filter.status, expected === null ? "rejected" : undefined);
      return { populate() { return this; }, sort: async () => [] };
    });
    for (const status of ["rejected", "deleted"]) {
      expected = status === "deleted" ? { $ne: null } : null;
      await handlers.moderationList({ query: { status } }, response(), next);
    }
  });


  test(`${label}: reviews store an independent timestamp and append history that deletion preserves`, async (t) => {
    const originalReview = new Date("2026-10-12T10:00:00Z");
    const history = [{ status: "approved", date: originalReview }];
    const doc = { reviewedAt: originalReview, moderationHistory: history };
    t.mock.method(Model, "findOneAndUpdate", (filter, update) => {
      if (update.$push) {
        assert.ok(update.reviewedAt instanceof Date);
        assert.equal(update.$push.moderationHistory.date, update.reviewedAt);
        assert.equal(update.$push.moderationHistory.reason, "Needs revision");
        assert.equal(update.$push.moderationHistory.status, "rejected");
        doc.reviewedAt = update.reviewedAt;
        history.push(update.$push.moderationHistory);
        return { populate: async () => doc };
      }
      assert.equal(update.$set.reviewedAt, undefined);
      assert.equal(update.$set.moderationHistory, undefined);
      assert.ok(update.$set.deletedAt instanceof Date);
      return Promise.resolve(doc);
    });
    await handlers.moderate(request({ status: "rejected", rejectionReason: "Needs revision" }), response(), next);
    const reviewedAt = doc.reviewedAt;
    await handlers.remove(request({ agreedToDelete: true, deletionReason: "Outdated" }), response(), next);
    assert.equal(doc.reviewedAt, reviewedAt);
    assert.equal(history.length, 2);
    assert.equal(history[0].date, originalReview);
    assert.equal(history[1].date, reviewedAt);
  });

  test(`${label}: resubmission records an edit and pending event without erasing review history`, async (t) => {
    t.mock.method(Model, "findOneAndUpdate", async (filter, update) => {
      assert.ok(update.lastEditedAt instanceof Date);
      assert.equal(update.$push.moderationHistory.status, "pending");
      assert.equal(update.$push.moderationHistory.date, update.lastEditedAt);
      assert.equal(update.reviewedAt, null);
      assert.equal(update.moderationHistory, undefined);
      return { _id: itemId };
    });
    await handlers.edit(request({ mainTitle: "Updated blog" }), response(), next);
  });


  test(`${label}: approval and rejection persist the reviewer on the contribution and each history entry`, async (t) => {
    const writes = [];
    t.mock.method(Model, "findOneAndUpdate", (filter, update) => {
      writes.push(update);
      return { populate: async () => ({ _id: itemId }) };
    });
    for (const [status, reviewer, id] of [["approved", "Alice Reviewer", "admin-1"], ["rejected", "Bob Reviewer", "admin-2"]]) {
      const res = response();
      await handlers.moderate(request({ status, rejectionReason: "Needs revision", reviewedBy: reviewer, reviewedById: id }), res, next);
      assert.equal(res.statusCode, 200);
    }
    assert.equal(writes.length, 2);
    for (const [index, reviewer, id] of [[0, "Alice Reviewer", "admin-1"], [1, "Bob Reviewer", "admin-2"]]) {
      assert.equal(writes[index].reviewedBy, reviewer);
      assert.equal(writes[index].reviewedById, id);
      assert.equal(writes[index].$push.moderationHistory.actor, reviewer);
      assert.equal(writes[index].$push.moderationHistory.actorId, id);
    }
  });

  test(`${label}: invalid reviews require a reason and do not write`, async (t) => {
    const update = t.mock.method(Model, "findOneAndUpdate", () => { throw new Error("Unexpected write"); });
    for (const body of [{ status: "deleted" }, { status: "rejected" }, { status: "rejected", rejectionReason: " " }, { status: "rejected", rejectionReason: "x".repeat(501) }]) {
      const res = response();
      await handlers.moderate(request(body), res, next);
      assert.equal(res.statusCode, 400);
    }
    assert.equal(update.mock.callCount(), 0);
  });

  test(`${label}: contributor edits cannot forge reviewer, deletion or history metadata`, async (t) => {
    t.mock.method(Model, "findOneAndUpdate", async (filter, update) => {
      assert.equal(update.reviewedBy, "");
      assert.equal(update.reviewedById, "");
      assert.equal(update.reviewedAt, null);
      assert.equal(update.deletedAt, undefined);
      assert.equal(update.deletionReason, undefined);
      assert.equal(update.moderationHistory, undefined);
      assert.equal(update.rejectionReason, "");
      assert.equal(update.$push.moderationHistory.status, "pending");
      return { _id: itemId };
    });
    const res = response();
    await handlers.edit(request({ reviewedBy: "Forged reviewer", reviewedById: "staff", reviewedAt: new Date(), deletedAt: new Date(), deletionReason: "Fake", moderationHistory: [], rejectionReason: "Fake" }), res, next);
    assert.equal(res.statusCode, 200);
  });

  test(`${label}: schema retains review and deletion metadata`, () => {
    const date = new Date();
    const doc = new Model({ ...request({}).body, deletedAt: date, deletionReason: "Outdated", rejectionReason: "Needs revision", reviewedAt: date, reviewedBy: "Reviewer", reviewedById: "staff", lastEditedAt: date, moderationHistory: [{ status: "approved", date, actor: "Reviewer", actorId: "staff" }] });
    assert.equal(doc.validateSync(), undefined);
    assert.equal(doc.deletedAt.getTime(), date.getTime());
    assert.equal(doc.deletionReason, "Outdated");
    assert.equal(doc.rejectionReason, "Needs revision");
    assert.equal(doc.reviewedBy, "Reviewer");
    assert.equal(doc.moderationHistory[0].actorId, "staff");
  });

}
