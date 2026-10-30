import test from "node:test";
import assert from "node:assert/strict";
import Blog from "../models/Blog.js";
import { deleteMyBlog, getMyBlogs, getBlogs, getBlogContributions, updateMyBlog, updateBlogContributionStatus } from "../controllers/blogController.js";

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

test("deleted blogs are excluded from public, contributor and moderation lists", async (t) => {
  t.mock.method(Blog, "find", (filter) => {
    assert.equal(filter.deletedAt, null);
    return { populate() { return this; }, sort: async () => [] };
  });
  for (const handler of [getMyBlogs, getBlogs, getBlogContributions]) {
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
  for (const handler of [updateMyBlog, updateBlogContributionStatus]) {
    const res = response();
    await handler(request({ status: "approved" }), res, next);
    assert.equal(res.statusCode, 404);
  }
});
