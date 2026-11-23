import { buildSearchResultsReturnTarget } from "./aiSearchResultsNavigation.js";

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeKey = (value) => normalizeText(value).toLowerCase();

const isClassicOrigin = (origin, locationState = {}) => {
  if (origin?.kind) return origin.kind === "classic";
  if (locationState.searchContext === "classic") return true;

  const badges = Array.isArray(locationState.searchBarBadges)
    ? locationState.searchBarBadges
    : [];

  return badges.some((badge) => normalizeKey(badge) === "classic search");
};

// Captured when a destination card is opened so the product page can send the
// user back to the exact WoNo Intelligence page they started from.
export const createGoalSearchOrigin = ({
  location,
  goal,
  continent,
  goalOption,
}) => ({
  kind: "goal",
  pathname: normalizeText(location?.pathname),
  search: normalizeText(location?.search),
  goal: normalizeText(goal),
  continent: normalizeText(continent),
  goalOption: normalizeText(goalOption),
});

// Classic/manual search prefills continent and country through route params.
export const createClassicSearchOrigin = ({
  location,
  continent,
  country,
  selectedLocation,
}) => ({
  kind: "classic",
  pathname: "/manual-search",
  search: normalizeText(location?.search),
  continent: normalizeText(continent),
  country: normalizeText(country),
  location: normalizeText(selectedLocation),
});

const buildClassicPathname = (origin, locationState) => {
  const fallbackFilters = locationState.breadcrumbFilters || {};
  const continent =
    origin?.continent || normalizeText(fallbackFilters.continent);
  const country = origin?.country || normalizeText(fallbackFilters.country);

  const pathParts = ["/manual-search"];
  if (continent) pathParts.push(encodeURIComponent(continent));
  if (continent && country) pathParts.push(encodeURIComponent(country));

  return pathParts.join("/");
};

export const buildEntryPageReturnTarget = (locationState = {}) => {
  const origin = locationState.searchOrigin;

  if (isClassicOrigin(origin, locationState)) {
    return {
      pathname: buildClassicPathname(origin, locationState),
      search: origin?.search || "",
      state: { searchContext: "classic" },
    };
  }

  // Goal flows fall back to the existing badge/query based reconstruction so
  // bookmarks and older navigation state keep working.
  const fallbackTarget = buildSearchResultsReturnTarget(
    locationState.returnTo?.search || origin?.search || "",
    locationState,
  );

  const goal = origin?.goal || fallbackTarget.state.selectedGoal;
  const continent =
    origin?.continent || fallbackTarget.state.selectedFilters.continent;
  const goalOption =
    origin?.goalOption || fallbackTarget.state.selectedFilters.goalOption;

  const originPathname = normalizeText(origin?.pathname);
  const pathname =
    originPathname.startsWith("/search/") && originPathname.includes("/results")
      ? originPathname
      : fallbackTarget.pathname;

  return {
    pathname,
    search: origin?.search || "",
    state: {
      selectedGoal: goal,
      selectedFilters: {
        continent,
        goalOption,
      },
    },
  };
};
