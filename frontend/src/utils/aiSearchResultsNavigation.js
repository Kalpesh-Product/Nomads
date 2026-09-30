import { goalFilterMap } from "../constants/aiGoalFilters.js";
import { dedupeAiSearchBadges } from "./aiSearchBarBadges.js";

const aiSearchGoalSlugByName = {
  "World Ranking": "worldranking",
  "Work From Anywhere": "workfromanywhere",
  "Increase Your Savings": "increaseyoursavings",
  "Advance Your Career": "advanceyourcareer",
  "Find Your Community": "findyourcommunity",
};

const continentNames = new Set([
  "World",
  "Explore The World",
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
]);

const normalizeKey = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getKnownGoalFromBadge = (badge) =>
  Object.keys(aiSearchGoalSlugByName).find(
    (goalName) => normalizeKey(goalName) === normalizeKey(badge),
  );

const getKnownContinentFromBadge = (badge) =>
  Array.from(continentNames).find(
    (continent) => normalizeKey(continent) === normalizeKey(badge),
  );

const getKnownGoalOptionFromBadge = (badge, goal) => {
  const goalOptions = goalFilterMap[goal] || [];

  return goalOptions.find(
    (goalOption) => normalizeKey(goalOption) === normalizeKey(badge),
  );
};

const readPersistedSearchBarBadges = () => {
  if (typeof window === "undefined") return [];

  try {
    const parsedBadges = JSON.parse(
      window.sessionStorage.getItem("aiSearchBarBadges") || "[]",
    );

    return Array.isArray(parsedBadges) ? parsedBadges : [];
  } catch {
    return [];
  }
};

export const buildSearchResultsReturnTarget = (
  search = "",
  locationState = {},
) => {
  const params = new URLSearchParams(search);
  const selectedFilters = locationState?.selectedFilters || {};
  const stateBadges = Array.isArray(locationState?.searchBarBadges)
    ? locationState.searchBarBadges
    : [];
  const badges = dedupeAiSearchBadges([
    ...stateBadges,
    ...readPersistedSearchBarBadges(),
  ]);
  const badgeGoal = badges.map(getKnownGoalFromBadge).find(Boolean);
  const goal =
    params.get("goal") ||
    locationState?.selectedGoal ||
    selectedFilters.goal ||
    badgeGoal ||
    "World Ranking";
  const badgeContinent = badges.map(getKnownContinentFromBadge).find(Boolean);
  const continent =
    selectedFilters.continent ||
    params.get("continent") ||
    badgeContinent ||
    "World";
  const badgeGoalOption = badges
    .map((badge) => getKnownGoalOptionFromBadge(badge, goal))
    .find(Boolean);
  const goalOption =
    selectedFilters.goalOption ||
    params.get("goalOption") ||
    badgeGoalOption ||
    "";
  const goalSlug =
    aiSearchGoalSlugByName[goal] ||
    goal
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const pathParts = [`/search/${encodeURIComponent(goalSlug)}/results`];

  if (continent || goalOption) {
    pathParts.push(encodeURIComponent(continent || "World"));
  }

  if (goalOption) {
    pathParts.push(encodeURIComponent(goalOption));
  }

  return {
    pathname: pathParts.join("/"),
    state: {
      selectedGoal: goal,
      selectedFilters: {
        continent,
        goalOption,
      },
    },
  };
};
