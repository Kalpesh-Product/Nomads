import test from "node:test";
import assert from "node:assert/strict";
import NomadUser from "../models/NomadUser.js";
import Blog from "../models/Blog.js";
import News from "../models/News.js";
import Place from "../models/Place.js";
import Event from "../models/Event.js";
import { getContentFavorites, updateContentFavorite } from "../controllers/contentFavoriteControllers.js";

const userId = "507f1f77bcf86cd799439011";
const contentId = "507f1f77bcf86cd799439012";
const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const next = (error) => { throw error; };

test("content favorites require an authenticated account", async () => {
  for (const handler of [getContentFavorites, updateContentFavorite]) {
    const res = response();
    await handler({ body: {} }, res, next);
    assert.equal(res.statusCode, 401);
  }
});

test("invalid types, IDs and non-boolean flags are rejected", async () => {
  for (const body of [
    { kind: "constructor", contentId, isFavorited: true },
    { kind: "blog", contentId: "invalid", isFavorited: true },
    { kind: "blog", contentId, isFavorited: "true" },
  ]) {
    const res = response();
    await updateContentFavorite({ userData: { _id: userId }, body }, res, next);
    assert.equal(res.statusCode, 400);
  }
});

test("each content type uses account-owned, atomic add/remove operations", async (t) => {
  for (const [kind, field, model] of [
    ["blog", "favoriteBlogs", Blog], ["news", "favoriteNews", News],
    ["place", "favoritePlaces", Place], ["event", "favoriteEvents", Event],
  ]) {
    const exists = t.mock.method(model, "exists", async (filter) => {
      assert.equal(filter._id, contentId);
      assert.deepEqual(filter.isDraft, { $ne: true });
      assert.deepEqual(filter.isActive, { $ne: false });
      assert.deepEqual(filter.$or, [{ status: "approved" }, { status: { $exists: false } }]);
      return { _id: contentId };
    });
    const update = t.mock.method(NomadUser, "findByIdAndUpdate", (id, operation) => {
      assert.equal(id, userId);
      assert.deepEqual(operation, { [update.mock.callCount() === 0 ? "$addToSet" : "$pull"]: { [field]: contentId } });
      return { select: async () => ({ _id: userId }) };
    });
    for (const isFavorited of [true, false]) {
      const res = response();
      await updateContentFavorite({ userData: { _id: userId }, body: {
        kind, contentId, isFavorited, userId: "another-account",
      } }, res, next);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { kind, contentId, isFavorited });
    }
    assert.equal(exists.mock.callCount(), 1);
    exists.mock.restore();
    update.mock.restore();
  }
});

test("unavailable content cannot be added", async (t) => {
  t.mock.method(Blog, "exists", async () => null);
  const update = t.mock.method(NomadUser, "findByIdAndUpdate", () => { throw new Error("Unexpected update"); });
  const res = response();
  await updateContentFavorite({ userData: { _id: userId }, body: { kind: "blog", contentId, isFavorited: true } }, res, next);
  assert.equal(res.statusCode, 404);
  assert.equal(update.mock.callCount(), 0);
});

test("retrieval returns all four types, filters unavailable content and uses authenticated user", async (t) => {
  t.mock.method(NomadUser, "findById", (id) => {
    assert.equal(id, userId);
    return { select() { return this; }, populate(config) {
      assert.equal(config.length, 4);
      for (const entry of config) assert.deepEqual(entry.match.isActive, { $ne: false });
      return this;
    }, async lean() { return {
      favoriteBlogs: [{ _id: contentId }, null], favoriteNews: [{ _id: contentId }],
      favoritePlaces: [{ _id: contentId }], favoriteEvents: [{ _id: contentId }],
    }; } };
  });
  const res = response();
  await getContentFavorites({ userData: { _id: userId } }, res, next);
  assert.deepEqual(res.body.map(({ kind }) => kind), ["blog", "news", "place", "event"]);
});
