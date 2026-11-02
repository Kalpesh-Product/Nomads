import test from "node:test";
import assert from "node:assert/strict";
import Blog from "../models/Blog.js";
import { deleteMyBlog, getMyBlogs, getBlogs, getBlogContributions, updateMyBlog, updateBlogContributionStatus, updateBlog } from "../controllers/blogController.js";

const userId = "507f1f77bcf86cd799439011";
const blogId = "507f1f77bcf86cd799439012";
const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const request = (body) => ({ userData: { _id: userId }, params: { id: blogId }, body });
const next = (error) => { throw error; };

test("deletion requires authentication, explicit agreement and a nonblank reason of at most 500 characters", async (t) => {
  const update = t.mock.method(Blog, "findOneAndUpdate", () => { throw new Error("Unexpected write"); });
  const unauthenticated = response();
  await deleteMyBlog({ body: {} }, unauthenticated, next);
  assert.equal(unauthenticated.statusCode, 401);
  for (const body of [
    {}, { agreedToDelete: "true", deletionReason: "Outdated" },
    { agreedToDelete: true }, { agreedToDelete: true, deletionReason: "   " },
    { agreedToDelete: true, deletionReason: {} },
    { agreedToDelete: true, deletionReason: "x".repeat(501) },
  ]) {
    const res = response();
    await deleteMyBlog(request(body), res, next);
    assert.equal(res.statusCode, 400);
  }
  assert.equal(update.mock.callCount(), 0);
});

test("deletion is scoped to the authenticated owner and records the trimmed reason and timestamp", async (t) => {
  t.mock.method(Blog, "findOneAndUpdate", async (filter, update, options) => {
    assert.deepEqual(filter, { _id: blogId, contributor: userId, deletedAt: null });
    assert.equal(update.$set.deletionReason, "Information is outdated");
    assert.equal(update.$set.isActive, false);
    assert.ok(update.$set.deletedAt instanceof Date);
    assert.deepEqual(options, { new: true, runValidators: true });
    return { _id: blogId };
  });
  const res = response();
  await deleteMyBlog(request({ agreedToDelete: true, deletionReason: "  Information is outdated  " }), res, next);
  assert.equal(res.statusCode, 200);
});

test("missing, foreign-owned and already deleted blogs return not found", async (t) => {
  t.mock.method(Blog, "findOneAndUpdate", async () => null);
  const res = response();
  await deleteMyBlog(request({ agreedToDelete: true, deletionReason: "Outdated" }), res, next);
  assert.equal(res.statusCode, 404);
});

test("database failures reach the error handler", async (t) => {
  const failure = new Error("Database unavailable");
  t.mock.method(Blog, "findOneAndUpdate", async () => { throw failure; });
  let caught;
  await deleteMyBlog(request({ agreedToDelete: true, deletionReason: "Outdated" }), response(), (error) => { caught = error; });
  assert.equal(caught, failure);
});

test("deleted blogs are excluded from public and contributor lists", async (t) => {
  t.mock.method(Blog, "find", (filter) => {
    assert.equal(filter.deletedAt, null);
    return { populate() { return this; }, sort: async () => [] };
  });
  for (const handler of [getMyBlogs, getBlogs]) {
    const res = response();
    await handler({ userData: { _id: userId }, query: {} }, res, next);
    assert.equal(res.statusCode, 200);
  }
});

test("editing and moderation cannot republish a deleted blog", async (t) => {
  t.mock.method(Blog, "findOneAndUpdate", (filter) => {
    assert.equal(filter.deletedAt, null);
    return { populate: async () => null, then: (resolve) => resolve(null) };
  });
  for (const handler of [updateMyBlog, updateBlogContributionStatus, updateBlog]) {
    const res = response();
    await handler(request({ status: "approved" }), res, next);
    assert.equal(res.statusCode, 404);
  }
});


test("moderation lists include deleted blogs with their reason and previous review status", async (t) => {
  const deletedAt = new Date("2026-10-30T08:00:00Z");
  const deleted = { _id: blogId, status: "rejected", deletedAt, deletionReason: "Outdated", rejectionReason: "Needs revision" };
  const active = { _id: "active", status: "pending" };
  t.mock.method(Blog, "find", (filter) => {
    assert.equal(filter.deletedAt, undefined);
    return { populate() { return this; }, sort: async () => [{ ...deleted, toObject: () => deleted }, active] };
  });
  const res = response();
  await getBlogContributions({ query: {} }, res, next);
  assert.equal(res.body.count, 2);
  assert.deepEqual(res.body.data[0], { ...deleted, status: "deleted", statusBeforeDeletion: "rejected" });
  assert.equal(res.body.data[1], active);
});

test("moderation status filters distinguish deleted blogs from their previous status", async (t) => {
  let expected;
  t.mock.method(Blog, "find", (filter) => {
    assert.deepEqual(filter.deletedAt, expected);
    assert.equal(filter.status, expected === null ? "rejected" : undefined);
    return { populate() { return this; }, sort: async () => [] };
  });
  for (const status of ["rejected", "deleted"]) {
    expected = status === "deleted" ? { $ne: null } : null;
    await getBlogContributions({ query: { status } }, response(), next);
  }
});


test("reviews store an independent timestamp and append history that deletion preserves", async (t) => {
  const originalReview = new Date("2026-10-12T10:00:00Z");
  const history = [{ status: "approved", date: originalReview }];
  const doc = { reviewedAt: originalReview, moderationHistory: history };
  t.mock.method(Blog, "findOneAndUpdate", (filter, update) => {
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
  await updateBlogContributionStatus(request({ status: "rejected", rejectionReason: "Needs revision" }), response(), next);
  const reviewedAt = doc.reviewedAt;
  await deleteMyBlog(request({ agreedToDelete: true, deletionReason: "Outdated" }), response(), next);
  assert.equal(doc.reviewedAt, reviewedAt);
  assert.equal(history.length, 2);
  assert.equal(history[0].date, originalReview);
  assert.equal(history[1].date, reviewedAt);
});

test("resubmission records an edit and pending event without erasing review history", async (t) => {
  t.mock.method(Blog, "findOneAndUpdate", async (filter, update) => {
    assert.ok(update.lastEditedAt instanceof Date);
    assert.equal(update.$push.moderationHistory.status, "pending");
    assert.equal(update.$push.moderationHistory.date, update.lastEditedAt);
    assert.equal(update.reviewedAt, null);
    assert.equal(update.moderationHistory, undefined);
    return { _id: blogId };
  });
  await updateMyBlog(request({ mainTitle: "Updated blog" }), response(), next);
});


test("approval and rejection persist the reviewer on the blog and each history entry", async (t) => {
  const writes = [];
  t.mock.method(Blog, "findOneAndUpdate", (filter, update) => {
    writes.push(update);
    return { populate: async () => ({ _id: blogId }) };
  });
  for (const [status, reviewer, id] of [["approved", "Alice Reviewer", "admin-1"], ["rejected", "Bob Reviewer", "admin-2"]]) {
    const res = response();
    await updateBlogContributionStatus(request({ status, rejectionReason: "Needs revision", reviewedBy: reviewer, reviewedById: id }), res, next);
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
