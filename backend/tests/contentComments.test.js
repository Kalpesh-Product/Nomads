import test from "node:test";
import assert from "node:assert/strict";
import { createContentCommentController } from "../controllers/contentCommentController.js";
import { ContentComment, ContentReply } from "../models/ContentComment.js";

const articleId = "507f1f77bcf86cd799439011";
const userId = "507f1f77bcf86cd799439012";
const commentId = "507f1f77bcf86cd799439013";
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const next = (error) => { throw error; };
const req = (extra = {}) => ({ params: { kind: "blog", articleId }, query: {}, body: { text: "  A helpful article.  ", starCount: 5 }, userData: { _id: userId }, ...extra });
const query = (rows) => ({ select() { return this; }, sort() { return this; }, skip() { return this; }, limit() { return this; }, lean: async () => rows });
const setup = (overrides = {}) => createContentCommentController({
  articles: { blog: { exists: async () => true }, news: { exists: async () => true } },
  User: { findById: () => query({ fullName: "Real User" }) },
  ...overrides,
});

test("comments and replies have distinct persistent collections and validate text length", () => {
  assert.equal(ContentComment.collection.name, "contentComments");
  assert.equal(ContentReply.collection.name, "contentReplies");
  const valid = { kind: "blog", articleId, author: userId, authorName: "User", text: "Hello" };
  assert.equal(new ContentComment(valid).validateSync(), undefined);
  assert.ok(new ContentComment({ ...valid, text: " " }).validateSync());
  assert.ok(new ContentComment({ ...valid, text: "x".repeat(2001) }).validateSync());
  assert.ok(new ContentReply(valid).validateSync()?.errors.commentId);
});

test("rejects invalid article types and identifiers before querying", async () => {
  const controller = setup({ articles: {} });
  for (const params of [{ kind: "place", articleId }, { kind: "blog", articleId: "bad-id" }]) {
    const res = response();
    await controller.list(req({ params }), res, next);
    assert.equal(res.statusCode, 400);
  }
});

test("unpublished articles cannot receive or expose comments", async () => {
  const controller = setup({ articles: { blog: { exists: async (filter) => {
    assert.deepEqual(filter, { _id: articleId, isDraft: { $ne: true }, isActive: { $ne: false }, $or: [{ status: "approved" }, { status: { $exists: false } }] });
    return false;
  } } } });
  for (const handler of [controller.list, controller.create]) {
    const res = response();
    await handler(req(), res, next);
    assert.equal(res.statusCode, 404);
  }
});

test("blank, non-string and oversized comments are rejected", async () => {
  const controller = setup();
  for (const text of [" ", {}, "x".repeat(2001)]) {
    const res = response();
    await controller.create(req({ body: { text } }), res, next);
    assert.equal(res.statusCode, 400);
  }
});

test("posting requires an existing authenticated user", async () => {
  for (const request of [req({ userData: undefined }), req()]) {
    const res = response();
    await setup({ User: { findById: () => query(null) } }).create(request, res, next);
    assert.equal(res.statusCode, 401);
  }
});

test("persists trimmed comments with server-resolved author identity for blogs and news", async () => {
  for (const kind of ["blog", "news"]) {
    let stored;
    const controller = setup({ Comment: { create: async (entry) => { stored = entry; return { ...entry, _id: commentId }; } } });
    const res = response();
    await controller.create(req({ params: { kind, articleId }, body: { text: " Hello ", starCount: 4, authorName: "Impostor", author: "other" } }), res, next);
    assert.equal(res.statusCode, 201);
    assert.deepEqual(stored, { kind, articleId, starCount: 4, author: userId, authorName: "Real User", text: "Hello" });
    assert.equal(res.body.data.author, undefined);
  }
});

test("a reply cannot be attached to a comment from another article or content type", async () => {
  const controller = setup({ Comment: { exists: async (filter) => {
    assert.deepEqual(filter, { kind: "news", articleId, _id: commentId });
    return false;
  } } });
  const res = response();
  await controller.create(req({ params: { kind: "news", articleId, commentId } }), res, next);
  assert.equal(res.statusCode, 404);
});

test("valid replies persist in the reply collection with their parent and article", async () => {
  let stored;
  const controller = setup({ Comment: { exists: async () => true }, Reply: { create: async (entry) => { stored = entry; return entry; } } });
  const res = response();
  await controller.create(req({ params: { kind: "blog", articleId, commentId } }), res, next);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(stored, { kind: "blog", articleId, commentId, author: userId, authorName: "Real User", text: "A helpful article." });
});

test("lists paginated article comments with only their scoped replies", async () => {
  const scope = { kind: "blog", articleId };
  const controller = setup({
    Comment: {
      find(filter) { assert.deepEqual(filter, scope); const chain = query([{ _id: commentId, text: "Hello" }]); chain.skip = (count) => { assert.equal(count, 20); return chain; }; chain.limit = (count) => { assert.equal(count, 20); return chain; }; return chain; },
      countDocuments: async (filter) => { assert.deepEqual(filter, scope); return 21; },
      aggregate: async (pipeline) => {
        assert.equal(pipeline[0].$match.kind, "blog");
        assert.equal(String(pipeline[0].$match.articleId), articleId);
        assert.deepEqual(pipeline[0].$match.starCount, { $type: "number", $gte: 1, $lte: 5 });
        assert.deepEqual(pipeline[1], { $group: { _id: null, averageRating: { $avg: "$starCount" } } });
        return [{ averageRating: 4.25 }];
      },
    },
    Reply: { find: (filter) => { assert.deepEqual(filter, { ...scope, commentId: { $in: [commentId] } }); return query([{ _id: "reply", commentId, text: "Reply" }]); } },
  });
  const res = response();
  await controller.list(req({ query: { page: "2" } }), res, next);
  assert.equal(res.body.totalPages, 2);
  assert.equal(res.body.averageRating, 4.25);
  assert.equal(res.body.data[0].replies[0].text, "Reply");
});

test("unrated articles return no average instead of a zero rating", async () => {
  for (const total of [0, 1]) {
    const controller = setup({ Comment: {
      find: () => query([]), countDocuments: async () => total, aggregate: async () => [],
    } });
    const res = response();
    await controller.list(req(), res, next);
    assert.equal(res.body.averageRating, null);
  }
});

test("database failures reach the error handler", async () => {
  const failure = new Error("Database unavailable");
  const controller = setup({ articles: { blog: { exists: async () => { throw failure; } } } });
  let received;
  await controller.list(req(), response(), (error) => { received = error; });
  assert.equal(received, failure);
});


test("new comments require a whole star rating from 1 to 5", async () => {
  const controller = setup();
  for (const starCount of [undefined, null, 0, 6, 2.5, "5", true]) {
    const res = response();
    await controller.create(req({ body: { text: "Hello", starCount } }), res, next);
    assert.equal(res.statusCode, 400);
  }
});

test("legacy comments remain valid without a rating, and invalid ratings fail schema validation", () => {
  const entry = { kind: "blog", articleId, author: userId, authorName: "User", text: "Existing comment" };
  assert.equal(new ContentComment(entry).validateSync(), undefined);
  for (const starCount of [0, 6, 2.5]) assert.ok(new ContentComment({ ...entry, starCount }).validateSync());
});
