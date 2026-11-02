import test from "node:test";
import assert from "node:assert/strict";
import { rankContributionsByFavorites } from "../src/utils/contributionFavorites.js";

const entry = (kind, id) => ({ config: { key: kind }, item: { _id: id } });

test("ranks all four types numerically by users' favorites and maps places correctly", () => {
  const entries = [entry("blog", "same-id"), entry("news", "same-id"), entry("places", "p"), entry("event", "e")];
  const ranked = rankContributionsByFavorites(entries, [
    { kind: "blog", contentId: "same-id", favoritesCount: 2 },
    { kind: "news", contentId: "same-id", favoritesCount: 11 },
    { kind: "place", contentId: "p", favoritesCount: 3 },
    { kind: "event", contentId: "e", favoritesCount: 8 },
  ]);
  assert.deepEqual(ranked.map(({ favoritesCount }) => favoritesCount), [11, 8, 3, 2]);
  assert.deepEqual(ranked.map(({ config }) => config.key), ["news", "event", "places", "blog"]);
  assert.equal(entries[0].favoritesCount, undefined);
});

test("zero favorites are shown as zero and tied items retain recent-first order", () => {
  const entries = [entry("blog", "newer"), entry("blog", "older"), entry("news", "zero")];
  assert.deepEqual(rankContributionsByFavorites(entries, []).map(({ favoritesCount }) => favoritesCount), [0, 0, 0]);
  const counts = ["newer", "older"].map((contentId) => ({ kind: "blog", contentId, favoritesCount: 4 }));
  assert.deepEqual(rankContributionsByFavorites(entries, counts).map(({ item }) => item._id), ["newer", "older", "zero"]);
});

test("removing a favorite changes the rank on the next count update", () => {
  const entries = [entry("blog", "a"), entry("event", "b")];
  const counts = [{ kind: "blog", contentId: "a", favoritesCount: 2 }, { kind: "event", contentId: "b", favoritesCount: 1 }];
  assert.equal(rankContributionsByFavorites(entries, counts)[0].item._id, "a");
  counts[0].favoritesCount = 0;
  assert.equal(rankContributionsByFavorites(entries, counts)[0].item._id, "b");
});
