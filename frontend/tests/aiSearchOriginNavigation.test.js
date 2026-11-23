import test from "node:test";
import assert from "node:assert/strict";
import {
  buildEntryPageReturnTarget,
  createClassicSearchOrigin,
  createGoalSearchOrigin,
} from "../src/utils/aiSearchOriginNavigation.js";

test("goal flow returns to the originating goal results page with its filters", () => {
  const target = buildEntryPageReturnTarget({
    searchOrigin: createGoalSearchOrigin({
      location: {
        pathname: "/search/worldranking/results/World/Most%20Affordable",
        search: "",
      },
      goal: "World Ranking",
      continent: "World",
      goalOption: "Most Affordable",
    }),
  });

  assert.equal(
    target.pathname,
    "/search/worldranking/results/World/Most%20Affordable",
  );
  assert.deepEqual(target.state, {
    selectedGoal: "World Ranking",
    selectedFilters: {
      continent: "World",
      goalOption: "Most Affordable",
    },
  });
});

test("classic flow returns to manual search with continent and country prefilled", () => {
  const target = buildEntryPageReturnTarget({
    searchOrigin: createClassicSearchOrigin({
      location: { search: "?companyType=coworking" },
      continent: "asia",
      country: "bhutan",
      selectedLocation: "tsirang district",
    }),
    breadcrumbFilters: { continent: "asia", country: "bhutan" },
  });

  assert.equal(target.pathname, "/manual-search/asia/bhutan");
  assert.equal(target.search, "?companyType=coworking");
  assert.deepEqual(target.state, { searchContext: "classic" });
});

test("legacy goal state still reconstructs a goal results page", () => {
  const target = buildEntryPageReturnTarget({
    returnTo: {
      search:
        "?country=indonesia&state=yogyakarta&goal=Work+From+Anywhere&continent=Asia&goalOption=Most+Affordable",
    },
  });

  assert.equal(
    target.pathname,
    "/search/workfromanywhere/results/Asia/Most%20Affordable",
  );
});
