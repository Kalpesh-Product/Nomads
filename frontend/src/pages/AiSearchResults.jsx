import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "driver.js/dist/driver.css";
import {
  HiOutlineChevronDown,
  HiOutlineSearch,
  HiOutlineX,
} from "react-icons/hi";
import { AiFillHeart, AiTwotoneHeart } from "react-icons/ai";
import { FaCheck, FaSyncAlt } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { aiDestinationCards } from "../constants/aiDestinationCards";
import { createDriverGuide } from "../utils/driverGuide";
import { persistSelectedDestination } from "../utils/selectedDestinationSession";

import axios from "../utils/axios";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { showErrorAlert } from "../utils/alerts";

import {
  defaultGoal,
  // getGoalOptionMetricLabel,
  goalFilterMap,
} from "../constants/aiGoalFilters";
import Seo from "../components/Seo";

const continentOptions = [
  "Explore The World",
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];

const visaRequirementOptions = [
  "Show All",
  "Visa Free",
  "Physical Visa",
  "e-Visa",
  "Visa on Arrival",
  "eTA",
  "No Admission",
];

const visaRequirementApiValueMap = {
  "Visa Free": "visa free",
  "Physical Visa": "visa required",
  "e-Visa": "e-visa",
  "Visa on Arrival": "visa on arrival",
  eTA: "eta",
  "No Admission": "no admission",
};

const getVisaRequirementApiValue = (value) =>
  visaRequirementApiValueMap[value] || value;

const DEFAULT_PASSPORT_COUNTRY = "India";
const AI_SEARCH_RESULTS_GUIDE_SEEN_KEY = "wono-ai-search-results-guide-seen";
const ARE_GUIDES_TEMPORARILY_DISABLED = false;

const destinationCards = aiDestinationCards;
const getDestinationFavoriteKey = (destination) =>
  destination?._id || `${destination.city}-${destination.country}`;

// Algo 2.0: one formula per attribute, shared across every Wono Filter tab
// it appears under (no more WFA-suffixed variants).
const goalOptionToApiAttributeMap = {
  "Best for Nomads": "bestForNomads",
  "Most Affordable": "mostAffordable",
  "Safest Cities": "safestCities",
  "Easy Visa / Long Stay": "easyVisaLongStay",
  "Strong Nomad Community": "strongNomadCommunity",
  "Healthcare Friendly": "healthcareFriendly",
  "Startup / Business Opportunities": "startupBusinessOpportunities",
  "Clean Air / Environment": "cleanAirEnvironment",
  "Best Work Infrastructure": "bestWorkInfrastructure",
  "Best for Remote Work Setup": "bestForRemoteWorkSetup",
  "Best Connected Cities (Flights)": "bestConnectedCitiesFlights",
  "Fast Internet Cities": "fastInternetCities",
  "Maximum Savings": "maximumSavings",
  "Low Taxation": "lowTaxation",
  "Purchasing Power": "purchasingPower",
  "Financial Stability(Low Risk)": "financialStabilityLowRisk",
  "Startup Setup Cost": "startupSetupCost",
  "Balanced Financial Lifestyle": "balancedFinancialLifestyle",
  "Startup Ecosystems": "startupEcosystems",
  "Remote Job Opportunities": "remoteJobOpportunities",
  "Tech Talent Density": "techTalentDensity",
  "Startup Funding & Support": "startupFundingSupport",
  "Venture Capital Presence": "ventureCapitalPresence",
  "Founder Nomads": "founderNomads",
  "Balanced Career Growth": "balancedCareerGrowth",
  "Conferences & Events": "conferencesEvents",
  "Social & Party Lifestyle": "socialPartyLifestyle",
  "Chill & Wellness Lifestyle": "chillWellnessLifestyle",
  "Adventure & Exploration": "adventureExploration",
  "Solo Nomads": "soloNomads",
  "Couple - Friendly Lifestyle": "coupleFriendlyLifestyle",
  "Family - Friendly Lifestyle": "familyFriendlyLifestyle",
  "Female - Friendly Lifestyle": "femaleFriendlyLifestyle",
};

const formatLeftBadgeValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return `${value}`;
    }

    return `${Number(value.toFixed(2))}`;
  }

  return `${value}`;
};

const SCORE_RANGE_MAX = 10;
const SCORE_RANGE_MIN_DEFAULT = 0;

const getScoreRangeMin = () => {
  const configuredMin = Number(import.meta.env.VITE_AI_SCORE_RANGE_MIN);

  if (Number.isFinite(configuredMin)) {
    return Math.min(SCORE_RANGE_MAX, Math.max(0, configuredMin));
  }

  return SCORE_RANGE_MIN_DEFAULT;
};

const getScoreFillPercentage = (score) => {
  const min = getScoreRangeMin();
  const normalizedScore = Number(score);

  if (!Number.isFinite(normalizedScore)) {
    return 0;
  }

  const clampedScore = Math.max(
    min,
    Math.min(SCORE_RANGE_MAX, normalizedScore),
  );
  const denominator = SCORE_RANGE_MAX - min;

  if (denominator <= 0) {
    return 100;
  }

  return ((clampedScore - min) / denominator) * 100;
};

// Algo 2.0: quickStats (4 hover factors + their own labels) are computed
// server-side per request attribute (see ATTRIBUTE_QUICK_STATS_CONFIG in the
// backend calc engine) — the frontend just renders what the API returns.
const getQuickStatsForDestination = (destination) =>
  (destination?.quickStats || []).slice(0, 4).map((stat) => ({
    label: stat.label,
    score: Number.isFinite(Number(stat.value)) ? Number(stat.value) : null,
  }));

const getScoreBarColorValue = (score) => {
  if (!Number.isFinite(score)) {
    return "rgba(255, 255, 255, 0.3)";
  }

  if (score < 5) {
    return "#ef4444";
  }

  if (score < 7.5) {
    return "#facc15";
  }

  return "#22c55e";
};

const destinationAliasMap = {
  "Ho Chi Minh City": "Ho Chi Minh City",
  Surigao: "Surigao del Norte",
  "Las Palmas": "Las Palmas",
  Florianopolis: "Santa Catarina",
  "Playa del Carmen": "Playa del Carmen",
  "Western Cape": "Western Cape",
  Queensland: "Gold Coast",
  Amsterdam: "Amsterdam",
  Tenerife: "Tenerife",
  Casablanca: "Casablanca",
  Cairo: "Cairo",
  Queenstown: "Otago Region",
  Giza: "Giza",
};

const normalizeDestinationKey = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const getSearchResultDestinationKey = (destination = {}) =>
  [
    destination._id,
    destination.city,
    destination.routeCity,
    destination.country,
    destination.routeCountry,
  ]
    .filter(Boolean)
    .map((part) => normalizeDestinationKey(String(part)))
    .join("-");

const AI_SCROLL_CONTAINER_ID = "nomad-ai-scroll-container";
const AI_SCROLL_POSITIONS_STORAGE_KEY = "nomadAiScrollPositions";

const getAiScrollContainer = () =>
  typeof document === "undefined"
    ? null
    : document.getElementById(AI_SCROLL_CONTAINER_ID);

const getAiScrollPositionKey = (location) =>
  location.key && location.key !== "default"
    ? location.key
    : `${location.pathname}${location.search}${location.hash}`;

const writeAiLayoutScrollPosition = (location, scrollTop) => {
  if (typeof window === "undefined") return;

  try {
    const positions = JSON.parse(
      window.sessionStorage.getItem(AI_SCROLL_POSITIONS_STORAGE_KEY) || "{}",
    );
    positions[getAiScrollPositionKey(location)] = scrollTop;
    window.sessionStorage.setItem(
      AI_SCROLL_POSITIONS_STORAGE_KEY,
      JSON.stringify(positions),
    );
  } catch {
    // Ignore storage failures so regular navigation still works.
  }
};

const normalizedCountryAliasMap = {
  usa: "unitedstates",
  unitedstatesofamerica: "unitedstates",
  uae: "unitedarabemirates",
  turkey: "turkiye",
  czechrepublic: "czechia",
  thebahamas: "bahamas",
  thegambia: "gambia",
  swaziland: "eswatini",
  ivorycoast: "cotedivoire",
  hongkong: "hongkongsarchina",
  macao: "macaosarchina",
  macau: "macaosarchina",
  saintkittsandnevis: "stkittsandnevis",
  saintlucia: "stlucia",
  saintvincentandthegrenadines: "stvincentandthegrenadines",
};

const normalizeCountryKey = (value = "") => {
  const withAnd = String(value || "").replace(/&/g, "and");
  const normalized = normalizeDestinationKey(withAnd);
  return normalizedCountryAliasMap[normalized] || normalized;
};

const isVisaRequirementFilterActive = (value = "") =>
  value && value !== visaRequirementOptions[0];

const toApiAttribute = (goalOption = "") => {
  const normalizedGoalOption =
    typeof goalOption === "string" ? goalOption : `${goalOption || ""}`;

  if (goalOptionToApiAttributeMap[normalizedGoalOption]) {
    return goalOptionToApiAttributeMap[normalizedGoalOption];
  }

  const normalized = normalizedGoalOption
    .replace(/&/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (!normalized.length) return "";

  return normalized
    .map((part, index) =>
      index === 0
        ? part.toLowerCase()
        : `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`,
    )
    .join("");
};

// Algo 2.0: one formula per attribute regardless of which Wono Filter tab
// it's selected under, so no more goal-specific (WFA) variants.
const getApiAttributeForSelection = (_selectedGoal, selectedGoalOption) =>
  toApiAttribute(selectedGoalOption);

const INITIAL_VISIBLE_DESTINATIONS = 12;
const DESTINATION_LAZY_BATCH_SIZE = 8;
const TYPING_INTERVAL_MS = 7;
const SELECTED_HEADING_TRANSITION_DELAY_MS = 1200;
const DESTINATION_REVEAL_INTERVAL_MS = 70;
const SEARCH_RESULTS_GOAL_STORAGE_KEY = "aiSearchResults.selectedGoal";
const SEARCH_RESULTS_SELECTION_SIGNATURE_STORAGE_KEY =
  "aiSearchResults.selectionSignature";
const SEARCH_RESULTS_PAGE_STATE_STORAGE_KEY_PREFIX = "aiSearchResults.page";

const PRIORITY_POINTS_VISIBLE_LIMIT = 4;
const ADDITIONAL_PRIORITY_POINTS_TEXT =
  "along with other aspects calculated by our proprietary algorithm.";

const getSearchResultsPageStateKey = (
  selectedGoal,
  selectedContinent,
  selectedGoalOption,
) => {
  if (!selectedGoal || !selectedContinent || !selectedGoalOption) {
    return null;
  }

  return [
    SEARCH_RESULTS_PAGE_STATE_STORAGE_KEY_PREFIX,
    selectedGoal,
    selectedContinent,
    selectedGoalOption,
  ]
    .map((part) => normalizeDestinationKey(part))
    .join(":");
};

const readSearchResultsPageState = (storageKey, location) => {
  if (typeof window === "undefined" || !storageKey) return null;

  try {
    const savedState = window.sessionStorage.getItem(storageKey);
    const parsedState = savedState ? JSON.parse(savedState) : null;
    const currentLocationKey = getAiScrollPositionKey(location);

    if (
      !parsedState?.sourceLocationKey ||
      parsedState.sourceLocationKey !== currentLocationKey
    ) {
      window.sessionStorage.removeItem(storageKey);
      return null;
    }

    return parsedState;
  } catch {
    window.sessionStorage.removeItem(storageKey);
    return null;
  }
};

const addAdditionalPriorityPointsText = (narrative = "") => {
  let priorityPointsCount = 0;
  const visibleNarrativeLines = narrative.split("\n").filter((line) => {
    if (!line.trim().startsWith("•")) {
      return true;
    }

    priorityPointsCount += 1;
    return priorityPointsCount <= PRIORITY_POINTS_VISIBLE_LIMIT;
  });
  const endingLineIndex = visibleNarrativeLines.findIndex((line) =>
    line.trim().startsWith("→"),
  );

  if (endingLineIndex === -1) {
    return narrative;
  }

  visibleNarrativeLines.splice(
    endingLineIndex,
    0,
    ADDITIONAL_PRIORITY_POINTS_TEXT,
  );

  return visibleNarrativeLines.join("\n");
};

const goalNameBySlug = {
  worldranking: "World Ranking",
  workfromanywhere: "Work From Anywhere",
  increaseyoursavings: "Increase Your Savings",
  advanceyourcareer: "Advance Your Career",
  findyourcommunity: "Find Your Community",
};

const goalNarrativeTopHeadingMap = {
  "World Ranking":
    "Please find below, the best curated results from the options you suggested to me based on world ranking index.",
  "Work From Anywhere":
    "Please find below, the best curated results from the options you suggested to me to help you discover and work from the best nomad destinations.",
  "Increase Your Savings":
    "Please find below, the best curated results from the options you suggested to me to help you increase your savings.",
  "Advance Your Career":
    "Please find below, the best curated results from the options you suggested to me to help you advance your career.",
  "Find Your Community":
    "Please find below, the best curated results from the options you suggested to me to help you discover your preferred community in nomad destinations.",
  "Classic Search":
    "Please find below, the best curated results from the options you suggested to me to help you discover your preferred nomad destinations.",
};

const normalizeNarrativeKey = (value = "") =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const getNarrativeContinentLabel = (continent) =>
  continent === "World" ? "the World" : continent;

const normalizeSelectedContinent = (continent) =>
  continent === "Explore The World" ? "World" : continent;

const goalNarrativeByGoalAndAttribute = {
  [normalizeNarrativeKey("World Ranking")]: {
    [normalizeNarrativeKey("Best for Nomads")]:
      "Top cities for a balanced digital nomad lifestyle.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🏢 Work Infrastructure\n• 🌐 Internet\n• 💰 Cost of Living\n• 🛡️ Safety\n• 🤝 Nomad Community\n• 🌬️ Air Quality Index\n• 🛂 Easy Visa / Long Stay\n• 🏥 Healthcare Friendly\n\n→ Find the best overall place to live and work.",
    [normalizeNarrativeKey("Most Affordable")]:
      "Spend less without losing financial flexibility.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 💰 Cost of Living\n• 💊 Healthcare Cost Index\n• 🛒 Purchasing Power\n• 📉 Inflation Stability\n\n→ Find destinations where your money goes further.",
    [normalizeNarrativeKey("Safest Cities")]:
      "Discover destinations that put personal safety first.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🛡️ Safety\n• 🌬️ Air Quality Index\n• 🌿 Climate & Environment\n• 💊 Healthcare Cost Index\n\n→ Find cities where safety is the priority.",
    [normalizeNarrativeKey("Easy Visa / Long Stay")]:
      "Explore destinations with simpler entry and stay options.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🛂 Visa Openness\n• ✈️ Flight Connectivity\n• 🧾 Lower Taxes\n• 🚀 Startup Ecosystem\n\n→ Find places with more accessible visa options.",
    [normalizeNarrativeKey("Strong Nomad Community")]:
      "Discover cities with an established digital nomad network.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🤝 Nomad Community\n• 🎉 Meetups & Events\n• 🏢 Work Infrastructure\n• 🌐 Internet\n\n→ Find your community wherever you go.",
    [normalizeNarrativeKey("Healthcare Friendly")]:
      "Find destinations that balance healthcare quality with affordability.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🏥 Healthcare Quality\n• 💊 Healthcare Cost Index\n• 🛒 Purchasing Power\n• 📉 Inflation Stability\n\n→ Compare places that support healthier living.",
    [normalizeNarrativeKey("Startup / Business Opportunities")]:
      "Explore destinations with stronger business and startup ecosystems.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🚀 Startup Ecosystem\n• 🏢 Startup Incubators & Accelerators\n• 💼 Venture Capital Presence\n• 👩‍💻 Tech Talent Density\n\n→ Find a promising place to build and grow.",
    [normalizeNarrativeKey("Clean Air / Environment")]:
      "Discover cities with cleaner air and healthier surroundings.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🌬️ Air Quality Index\n• 🌿 Climate & Environment\n• 🏞️ Nature Nomad Travelling\n• 🛡️ Safety\n\n→ Find a place with a cleaner living environment.",
    [normalizeNarrativeKey("Best Work Infrastructure")]:
      "Discover places with the infrastructure to stay productive.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🏢 Work Infrastructure\n• 🌐 Internet\n• 🤝 Nomad Community\n• 🚀 Startup Ecosystem\n\n→ Find a workspace-friendly destination.",
  },
  [normalizeNarrativeKey("Work From Anywhere")]: {
    [normalizeNarrativeKey("Best for Remote Work Setup")]:
      "Find destinations with a dependable remote-work foundation.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🌐 Internet\n• 🏢 Work Infrastructure\n• 🤝 Nomad Community\n• 🧾 Lower Taxes\n\n→ Work confidently from wherever you choose.",
    [normalizeNarrativeKey("Most Affordable")]:
      "Spend less without losing financial flexibility.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 💰 Cost of Living\n• 💊 Healthcare Cost Index\n• 🛒 Purchasing Power\n• 📉 Inflation Stability\n\n→ Find destinations where your money goes further.",
    [normalizeNarrativeKey("Best Connected Cities (Flights)")]:
      "Discover cities with better flight connectivity.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• ✈️ Flight Connectivity\n• 🌐 Internet\n• 🏢 Work Infrastructure\n• 💼 Venture Capital Presence\n\n→ Stay connected to more destinations.",
    [normalizeNarrativeKey("Strong Nomad Community")]:
      "Discover cities with an established digital nomad network.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🤝 Nomad Community\n• 🎉 Meetups & Events\n• 🏢 Work Infrastructure\n• 🌐 Internet\n\n→ Find your community wherever you go.",
    [normalizeNarrativeKey("Fast Internet Cities")]:
      "Find destinations that prioritise stronger internet access.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🌐 Internet\n• 🏢 Work Infrastructure\n• 🎉 Meetups & Events\n• 🧾 Lower Taxes\n\n→ Stay connected and work more smoothly.",
    [normalizeNarrativeKey("Best Work Infrastructure")]:
      "Discover places with the infrastructure to stay productive.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🏢 Work Infrastructure\n• 🌐 Internet\n• 🤝 Nomad Community\n• 🚀 Startup Ecosystem\n\n→ Find a workspace-friendly destination.",
  },
  [normalizeNarrativeKey("Increase Your Savings")]: {
    [normalizeNarrativeKey("Maximum Savings")]:
      "Explore cities where your income can go further.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 💰 Cost of Living\n• 🧾 Lower Taxes\n• 🛒 Purchasing Power\n• 💊 Healthcare Cost Index\n\n→ Make more of what you earn.",
    [normalizeNarrativeKey("Low Taxation")]:
      "Explore destinations with more favourable personal-tax environments.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🧾 Lower Taxes\n• 💰 Cost of Living\n• 🛒 Purchasing Power\n• 📉 Inflation Stability\n\n→ Compare places with lower personal income tax rates.",
    [normalizeNarrativeKey("Purchasing Power")]:
      "Find destinations where earnings have greater spending power.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🛒 Purchasing Power\n• 🧾 Lower Taxes\n• 💊 Healthcare Cost Index\n• 📉 Inflation Stability\n\n→ See where your income can buy more.",
    [normalizeNarrativeKey("Financial Stability (Low Risk)")]:
      "Discover places with more stable consumer prices.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 📉 Inflation Stability\n• 🧾 Lower Taxes\n• 💊 Healthcare Cost Index\n• 🛡️ Safety\n\n→ Plan your spending with greater confidence.",
    [normalizeNarrativeKey("Startup Setup Cost")]:
      "Find destinations that may help founders keep everyday business and living costs manageable.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 💰 Cost of Living\n• 🧾 Lower Taxes\n• 🏢 Work Infrastructure\n• 🚀 Startup Incubators & Accelerators\n• 🛒 Purchasing Power\n\n→ Compare the practical conditions for starting lean; actual registration fees and legal costs are not measured.",
    [normalizeNarrativeKey("Balanced Financial Lifestyle")]:
      "Find destinations that support a balanced personal budget.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 💰 Cost of Living\n• 🛒 Purchasing Power\n• 📉 Inflation Stability\n• 🧾 Lower Taxes\n• 💊 Healthcare Cost Index\n\n→ Find a better balance between costs and income.",
  },
  [normalizeNarrativeKey("Advance Your Career")]: {
    [normalizeNarrativeKey("Startup Ecosystems")]:
      "Explore destinations with stronger startup scenes.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🚀 Startup Ecosystem\n• 🏢 Startup Incubators & Accelerators\n• 💼 Venture Capital Presence\n• 💸 Venture Capital Investments\n\n→ Find a city with entrepreneurial momentum.",
    [normalizeNarrativeKey("Remote Job Opportunities")]:
      "Discover destinations with more remote-job opportunities.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 💻 Remote Job Opportunities\n• 🌐 Internet\n• 🏢 Work Infrastructure\n• 🛒 Purchasing Power\n\n→ Explore where remote-work opportunities are stronger.",
    [normalizeNarrativeKey("Tech Talent Density")]:
      "Discover places where technology talent is concentrated.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 👩‍💻 Tech Talent Density\n• 🌐 Internet\n• 🏢 Work Infrastructure\n• 🎉 Meetups & Events\n\n→ Find a thriving network of technical professionals.",
    [normalizeNarrativeKey("Startup Funding & Support")]:
      "Explore destinations with accelerator networks and funding activity.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🏢 Startup Incubators & Accelerators\n• 💼 Venture Capital Presence\n• 💸 Venture Capital Investments\n• 🧾 Lower Taxes\n\n→ Find ecosystems that help businesses grow.",
    [normalizeNarrativeKey("Venture Capital Presence")]:
      "Discover destinations with a stronger venture capital environment.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 💼 Venture Capital Presence\n• 💸 Venture Capital Investments\n• 🏢 Startup Incubators & Accelerators\n• 🌐 Internet\n\n→ Explore where venture activity is stronger.",
    [normalizeNarrativeKey("Founder Nomads")]:
      "Explore destinations where independent founders can find startup support and professional connections.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🚀 Startup Ecosystem\n• 🏢 Startup Incubators & Accelerators\n• 🤝 Nomad Community\n• 📅 Meetups & Events\n• 💼 Venture Capital Presence\n\n→ Find environments that support building a business while living as a nomad.",
    [normalizeNarrativeKey("Balanced Career Growth")]:
      "Find places with a balanced mix of remote work, professional networks, and career opportunities.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 💻 Remote Job Opportunities\n• 🏢 Work Infrastructure\n• 🚀 Startup Ecosystem\n• 👩‍💻 Tech Talent Density\n• 🎤 Conferences & Events\n\n→ Explore destinations that combine career options with a practical working environment.",
    [normalizeNarrativeKey("Conferences & Events")]:
      "Find places with more professional events and conferences.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🎤 Conferences & Events\n• 🚀 Startup Ecosystem\n• 🏢 Startup Incubators & Accelerators\n• 💼 Venture Capital Presence\n\n→ Discover more opportunities to learn and connect.",
  },
  [normalizeNarrativeKey("Find Your Community")]: {
    [normalizeNarrativeKey("Social & Party Lifestyle")]:
      "Explore cities with a more active social calendar.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🎉 Meetups & Events\n• 🎤 Conferences & Events\n• 🤝 Nomad Community\n• 🏢 Work Infrastructure\n\n→ Meet people and make new connections.",
    [normalizeNarrativeKey("Chill & Wellness Lifestyle")]:
      "Discover calmer destinations with a wellness-focused atmosphere.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🧘 Yoga\n• 🌿 Climate & Environment\n• 🌬️ Air Quality Index\n• 🏥 Healthcare Friendly\n\n→ Find a place that supports your wellbeing.",
    [normalizeNarrativeKey("Adventure & Exploration")]:
      "Discover destinations with more opportunities to explore.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🏞️ Nature Nomad Travelling\n• 🌿 Climate & Environment\n• ✈️ Flight Connectivity\n• 🛡️ Safety\n\n→ Make more room for adventure.",
    [normalizeNarrativeKey("Strong Nomad Community")]:
      "Discover cities with an established digital nomad network.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🤝 Nomad Community\n• 🎉 Meetups & Events\n• 🏢 Work Infrastructure\n• 🌐 Internet\n\n→ Find your community wherever you go.",
    [normalizeNarrativeKey("Solo Nomads")]:
      "Explore destinations suited to independent travel.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🛡️ Safety\n• 🎉 Meetups & Events\n• 🤝 Nomad Community\n• 🛂 Easy Visa / Long Stay\n\n→ Travel independently with more confidence.",
    [normalizeNarrativeKey("Couple-Friendly Lifestyle")]:
      "Explore destinations with supportive communities, shared travel opportunities, and everyday practicality for two.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🛡️ Safety\n• 🤝 Nomad Community\n• 🏞️ Nature Nomad Travelling\n• 💰 Cost of Living\n• 🏢 Work Infrastructure\n\n→ Find places for travelling together using available destination-level indicators.",
    [normalizeNarrativeKey("Female-Friendly Lifestyle")]:
      "Compare general safety, healthcare, and social-support conditions for women travelling or working remotely.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🛡️ Safety\n• 🏥 Healthcare Quality\n• 🤝 Nomad Community\n• 🎉 Meetups & Events\n\n→ Use these as broad lifestyle indicators, not a guarantee of safety for women.",
    [normalizeNarrativeKey("Family-Friendly Lifestyle")]:
      "Explore destinations with a practical balance of safety, healthcare, affordability, and environment.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🛡️ Safety\n• 🏥 Healthcare Quality\n• 💰 Cost of Living\n• 💊 Healthcare Cost Index\n• 🌿 Climate & Environment\n\n→ Compare the broader living conditions; schools, childcare, and family visas need separate research.",
    [normalizeNarrativeKey("Founder Nomads")]:
      "Explore destinations where independent founders can find startup support and professional connections.\n\nPowered by WoNo's Intelligence Model, prioritising:\n\n• 🚀 Startup Ecosystem\n• 🏢 Startup Incubators & Accelerators\n• 🤝 Nomad Community\n• 📅 Meetups & Events\n• 💼 Venture Capital Presence\n\n→ Find environments that support building a business while living as a nomad.",
  },
};;

const searchBarBadgeClassName =
  "inline-flex min-h-[40px] min-w-[5rem] items-center rounded-full border border-black/30 px-4 py-2 text-xs font-medium text-black/85";

const searchBarBroaderGoalLabelMap = {
  "World Ranking": "Worldwide Nomad Destinations Ranking",
  "Work From Anywhere": "Best Nomad Destinations for Remote Work",
  "Increase Your Savings": "Budget-Friendly Nomad Destinations",
  "Find Your Community": "Be with your Community",
  "Advance Your Career": "Advance your Career",
};

const searchBarEndGoalLabelMap = {
  "World Ranking": {
    "Best for Nomads": "Best Overall Nomad Destinations",
    "Most Affordable": "Most Affordable Nomad Destinations",
    "Safest Cities": "Safest Nomad Destinations",
    "Easy Visa / Long Stay": "Visa-Friendly Nomad Destinations",
    "Strong Nomad Community": "Most Active Nomad Destinations",
    "Healthcare Friendly": "Healthcare-Friendly Nomad Destinations",
    "Startup / Business Opportunities":
      "Startup/Business Ready Nomad Destinations",
    "Clean Air / Environment": "Environment-Friendly Nomad Destinations",
    "Best Work Infrastructure": "Best Work Infrastructure Nomad Destinations",
  },
  "Work From Anywhere": {
    "Best for Remote Work Setup":
      "Best Overall Nomad Destinations for Remote Work",
    "Cheapest Places": "Cheapest Nomad Destinations",
    "Best Connected Cities (Flights)": "Globally Accessible Nomad Destinations",
    "Strong Nomad Community": "Most Active Nomad Destinations",
    "Fast Internet Cities": "Nomad Destinations with the Fastest Internet",
    "Best Work Infrastructure": "Best Work Infrastructure Nomad Destinations",
  },
  "Increase Your Savings": {
    "Maximum Savings": "Best Nomad Destinations to Maximize your Savings",
    "Low Taxation": "Tax-Friendly Nomad Destinations",
    "Purchasing Power": "Nomad Destinations with Strong Purchasing Power",
    "Financial Stability(Low Risk)": "Financially Stable Nomad Destinations",
    "Startup Setup Cost": "Cheapest Nomad Destinations for Startups",
    "Balanced Financial Lifestyle":
      "Best Overall Nomad Destinations for Savings",
  },
  "Find Your Community": {
    "Social & Party Lifestyle": "Party & Social Lifestyle Nomad Destinations",
    "Chill & Wellness Lifestyle":
      "Chill & Wellness Lifestyle Nomad Destinations",
    "Adventure & Exploration": "Adventurous Nomad Destinations",
    "Nomad Community & Networking": "Nomad Destinations for Networking",
    "Couple - Friendly Lifestyle": "Couple-Friendly Nomad Destinations",
    "Family - Friendly Lifestyle": "Nomad Destinations for Family Travel",
    "Female - Friendly Lifestyle": "Safe Nomad Destinations for Females",
    "Founder Nomads": "Nomad Destinations for Founders",
    "Solo Nomads": "Nomad Destinations for Solo Travellers",
  },
  "Advance Your Career": {
    "Startup Ecosystems": "Best Startup Ecosystems",
    "Remote Job Opportunities": "Destinations with Remote Job Opportunities",
    "Founder Nomads": "Grow Connections through Founders",
    "Tech Talent Density": "Tech Dense Nomad Destinations",
    "Startup Incubators & Accelerators": "Startup Incubators & Accelerators",
    "Balanced Career Growth": "Balanced Career Growth",
    "Venture Capital Presence": "Venture Capital Presence",
    "Conferences & Events": "Best Nomad Destinations for Conferences & Events",
  },
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightSelectedTokens = (text, tokens) => {
  if (!text) {
    return "";
  }

  const validTokens = tokens.filter(Boolean);
  if (!validTokens.length) {
    return text;
  }

  const tokenPattern = validTokens
    .sort((left, right) => right.length - left.length)
    .map((token) => escapeRegExp(token))
    .join("|");

  if (!tokenPattern) {
    return text;
  }

  const parts = text.split(new RegExp(`(${tokenPattern})`, "g"));

  return parts.map((part, index) => {
    const isSelectedToken = validTokens.some((token) => token === part);

    if (!isSelectedToken) {
      return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
    }

    return (
      <span key={`${part}-${index}`} className="text-primary-blue">
        {part}
      </span>
    );
  });
};

const DropdownBadge = ({
  label,
  options,
  selectedValue,
  isOpen,
  onToggle,
  onSelect,
  align = "left",
  size = "default",
  tourId,
}) => {
  const menuAlignment = align === "right" ? "right-0" : "left-0";
  const isSmall = size === "small";

  return (
    <div
      data-tour={tourId}
      className={`relative min-w-0 ${isSmall ? "w-full sm:flex-1" : "w-full flex-1"}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-2 rounded-full border font-medium transition-colors ${
          isSmall
            ? "min-h-[38px] px-3 py-1.5 text-xs sm:px-4"
            : "min-h-[44px] px-4 py-2 text-xs sm:px-5"
        } ${
          isOpen
            ? "border-sky-500 bg-sky-500 text-white"
            : "border-black/20 bg-white text-black/85 hover:border-sky-500"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedValue}</span>
        <HiOutlineChevronDown
          size={18}
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full z-40 mt-3 min-w-[11rem] w-full max-w-[calc(100vw-4rem)] rounded-2xl border border-sky-100 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)] ${menuAlignment}`}
        >
          <ul
            className="max-h-72 overflow-y-auto"
            role="listbox"
            aria-label={label}
          >
            {options.map((option) => {
              const isSelected = option === selectedValue;

              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => onSelect(option)}
                    className={`group flex w-full items-center rounded-xl px-4 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-sky-50 font-medium text-sky-600"
                        : "text-black/80 hover:bg-slate-50"
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="mr-2 inline-flex w-4 shrink-0 items-center justify-center">
                      <FaCheck
                        size={13}
                        className={`shrink-0 text-primary-blue transition-opacity ${
                          isSelected
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="pl-1">{option}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

const AiSearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { goal, loc, attr } = useParams();
  const { auth } = useAuth();
  const isLoggedIn = Boolean(auth?.user);
  const axiosPrivate = useAxiosPrivate();
  const { state } = location;
  const requestedGoalFromUrl = goal ? goalNameBySlug[goal.toLowerCase()] : null;
  const requestedGoal = state?.selectedGoal || requestedGoalFromUrl;
  const selectedGoal =
    requestedGoal && goalFilterMap[requestedGoal] ? requestedGoal : defaultGoal;
  const searchResultsBasePath = goal
    ? `/search/${encodeURIComponent(goal)}/results`
    : "/search/results";
  const goalOptions = goalFilterMap[selectedGoal] || goalFilterMap[defaultGoal];
  const getPersistedGoal = () => {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(SEARCH_RESULTS_GOAL_STORAGE_KEY);
    },
    getPersistedSelectionSignature = () => {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(
        SEARCH_RESULTS_SELECTION_SIGNATURE_STORAGE_KEY,
      );
    };

  const initialContinent = useMemo(() => {
    if (loc) return decodeURIComponent(loc);
    return state?.selectedFilters?.continent || null;
  }, [loc, state?.selectedFilters?.continent]);

  const initialGoalOption = useMemo(() => {
    if (attr) return decodeURIComponent(attr);
    return state?.selectedFilters?.goalOption || null;
  }, [attr, state?.selectedFilters?.goalOption]);

  const initialSearchResultsPageState = useMemo(() => {
    const initialStateKey = getSearchResultsPageStateKey(
      selectedGoal,
      normalizeSelectedContinent(initialContinent),
      initialGoalOption,
    );

    return readSearchResultsPageState(initialStateKey, location);
  }, [initialContinent, initialGoalOption, location, selectedGoal]);

  const [typedTopHeading, setTypedTopHeading] = useState(
    initialSearchResultsPageState?.typedTopHeading || "",
  );
  const [typedBottomHeading, setTypedBottomHeading] = useState(
    initialSearchResultsPageState?.typedBottomHeading || "",
  );
  const [typedResultsHeading, setTypedResultsHeading] = useState(
    initialSearchResultsPageState?.typedResultsHeading || "",
  );
  const [selectedContinent, setSelectedContinent] = useState(initialContinent);
  const [selectedGoalOption, setSelectedGoalOption] =
    useState(initialGoalOption);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedVisaRequirement, setSelectedVisaRequirement] = useState(
    initialSearchResultsPageState?.selectedVisaRequirement ||
      visaRequirementOptions[0],
  );
  const [isResultsReady, setIsResultsReady] = useState(
    Boolean(initialSearchResultsPageState?.isResultsReady),
  );
  const [visibleDestinationCount, setVisibleDestinationCount] = useState(
    initialSearchResultsPageState?.visibleDestinationCount || 0,
  );
  const [likedDestinations, setLikedDestinations] = useState([]);
  const [isDestinationsLoading, setIsDestinationsLoading] = useState(false);
  const dropdownContainerRef = useRef(null);
  const closeDropdownTimeoutRef = useRef(null);
  const lazyLoadSentinelRef = useRef(null);

  const topTypingIntervalRef = useRef(null);
  const bottomTypingIntervalRef = useRef(null);
  const selectedHeadingDelayTimeoutRef = useRef(null);
  const previousSelectedPairRef = useRef(null);
  const previousGoalRef = useRef(getPersistedGoal() || selectedGoal);
  const hasRestoredSearchScrollRef = useRef(false);
  const hasHydratedSearchResultsPageRef = useRef(
    Boolean(initialSearchResultsPageState),
  );
  const hasHydratedVisaRulesRef = useRef(
    Boolean(initialSearchResultsPageState),
  );
  const hasAutoStartedResultsGuideRef = useRef(false);
  const hasHydratedDestinationRevealRef = useRef(
    Boolean(initialSearchResultsPageState),
  );

  const previousVisibleDestinationsLengthRef = useRef(
    initialSearchResultsPageState?.visibleDestinationCount || 0,
  );

  const hasSelectedContinent = Boolean(selectedContinent);
  const selectedContinentDisplay =
    normalizeSelectedContinent(selectedContinent);
  const hasSelectedGoalOption = Boolean(selectedGoalOption);
  const hasSelectedFilters = hasSelectedContinent && hasSelectedGoalOption;
  const selectedContinentDropdownValue = hasSelectedContinent
    ? selectedContinentDisplay === "World"
      ? "You Intend To > Explore the World"
      : `You Intend To > Explore ${selectedContinentDisplay}`
    : "Where Do You Want To Go?";
  const selectedGoalOptionDropdownValue = hasSelectedGoalOption
    ? `Your End Goal > ${
        searchBarEndGoalLabelMap[selectedGoal]?.[selectedGoalOption] ||
        selectedGoalOption
      }`
    : "Choose Your Goal!";
  const selectedGoalSlug =
    Object.entries(goalNameBySlug).find(
      ([, goalName]) => goalName === selectedGoal,
    )?.[0] || "workfromanywhere";
  const seoSearchBasePath = goal
    ? `/search/${goal.toLowerCase()}/results`
    : `/search/${selectedGoalSlug}/results`;
  const seoPath = selectedGoalOption
    ? `${seoSearchBasePath}/World/${encodeURIComponent(selectedGoalOption)}`
    : seoSearchBasePath;
  const seoFallbackPath = selectedGoalOption
    ? `${seoSearchBasePath}/World/${encodeURIComponent(selectedGoalOption)}`
    : "/search/workfromanywhere/results";
  const passportCountry =
    auth?.user?.country ||
    auth?.user?.countryOfResidence ||
    DEFAULT_PASSPORT_COUNTRY;
  const userId = auth?.user?._id || auth?.user?.id;

  const searchResultsPageStateStorageKey = useMemo(
    () =>
      getSearchResultsPageStateKey(
        selectedGoal,
        selectedContinentDisplay,
        selectedGoalOption,
      ),
    [selectedContinentDisplay, selectedGoal, selectedGoalOption],
  );

  const [apiDestinations, setApiDestinations] = useState(
    Array.isArray(initialSearchResultsPageState?.apiDestinations)
      ? initialSearchResultsPageState.apiDestinations
      : [],
  );
  const [visaRuleDestinationKeys, setVisaRuleDestinationKeys] = useState(() => {
    const savedKeys = initialSearchResultsPageState?.visaRuleDestinationKeys;
    return Array.isArray(savedKeys) ? new Set(savedKeys) : null;
  });

  const [visaRuleDurationByCountry, setVisaRuleDurationByCountry] = useState(
    () => {
      const savedEntries =
        initialSearchResultsPageState?.visaRuleDurationByCountry;
      return Array.isArray(savedEntries) ? new Map(savedEntries) : null;
    },
  );

  const destinationLookup = useMemo(() => {
    const map = new Map();

    destinationCards.forEach((destination) => {
      const keys = [
        destination.city,
        destination.displayCity,
        destination.routeCity,
        destinationAliasMap[destination.city],
      ].filter(Boolean);

      keys.forEach((key) => {
        map.set(normalizeDestinationKey(key), destination);
      });
    });

    return map;
  }, []);

  const rankedDestinations = useMemo(() => {
    const selectedAttributeKey = getApiAttributeForSelection(
      selectedGoal,
      selectedGoalOption,
    );

    const filteredDestinations = apiDestinations.filter((destination) => {
      if (destination?.isActive !== true) {
        return false;
      }

      if (!visaRuleDestinationKeys) {
        return true;
      }

      return visaRuleDestinationKeys.has(
        normalizeCountryKey(destination.country),
      );
    });

    const sortedDestinations =
      isVisaRequirementFilterActive(selectedVisaRequirement) &&
      visaRuleDurationByCountry
        ? filteredDestinations
            .map((destination, index) => ({ destination, index }))
            .sort((a, b) => {
              const aDuration =
                visaRuleDurationByCountry.get(
                  normalizeCountryKey(a.destination.country),
                ) ?? 0;
              const bDuration =
                visaRuleDurationByCountry.get(
                  normalizeCountryKey(b.destination.country),
                ) ?? 0;

              if (bDuration !== aDuration) {
                return bDuration - aDuration;
              }

              return a.index - b.index;
            })
            .map(({ destination }) => destination)
        : filteredDestinations;

    return sortedDestinations.map((destination, index) => ({
      ...destination,
      rankLabel: `Rank ${index + 1}`,
      leftBadgeLabel: formatLeftBadgeValue(
        destination?.allLabels?.[selectedAttributeKey] ?? destination?.label,
      ),
    }));
  }, [
    apiDestinations,
    selectedGoal,
    selectedGoalOption,
    selectedVisaRequirement,
    visaRuleDestinationKeys,
    visaRuleDurationByCountry,
  ]);

  useEffect(() => {
    if (!isVisaRequirementFilterActive(selectedVisaRequirement)) {
      hasHydratedVisaRulesRef.current = false;
      setVisaRuleDestinationKeys(null);
      setVisaRuleDurationByCountry(null);
      return;
    }

    if (hasHydratedVisaRulesRef.current) {
      hasHydratedVisaRulesRef.current = false;
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchVisaRules = async () => {
      try {
        const response = await axios.get("/visa-rules-v2", {
          params: {
            passportCountry,
            requirement: getVisaRequirementApiValue(selectedVisaRequirement),
          },
          signal: controller.signal,
        });

        const allowedDestinationKeys = new Set(
          (response?.data?.data || []).map((rule) =>
            normalizeCountryKey(rule.destination),
          ),
        );
        const durationByCountry = new Map(
          (response?.data?.data || []).map((rule) => [
            normalizeCountryKey(rule.destination),
            Number(rule.durationDays) || 0,
          ]),
        );

        if (isMounted) {
          setVisaRuleDestinationKeys(allowedDestinationKeys);
          setVisaRuleDurationByCountry(durationByCountry);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setVisaRuleDestinationKeys(new Set());
          setVisaRuleDurationByCountry(new Map());
        }
      }
    };

    fetchVisaRules();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [passportCountry, selectedVisaRequirement]);

  useEffect(() => {
    if (!userId) {
      setLikedDestinations([]);
      return;
    }

    let isMounted = true;

    const fetchFavoriteDestinations = async () => {
      try {
        const response = await axiosPrivate.get(
          `/user/favorite-destination/${userId}`,
        );

        if (!isMounted) {
          return;
        }

        const favoriteIds =
          response?.data
            ?.map((destination) => destination?._id)
            .filter(Boolean) || [];

        setLikedDestinations(favoriteIds);
      } catch (error) {
        if (isMounted) {
          console.warn(
            "Failed to load favorite destinations.",
            error?.response?.data?.message || error,
          );
        }
      }
    };

    fetchFavoriteDestinations();

    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, userId]);

  useEffect(() => {
    if (!hasSelectedFilters) {
      setApiDestinations([]);
      setIsDestinationsLoading(false);
      return;
    }

    if (hasHydratedSearchResultsPageRef.current) {
      hasHydratedSearchResultsPageRef.current = false;
      setIsDestinationsLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchRankedDestinations = async () => {
      if (isMounted) {
        setIsDestinationsLoading(true);
      }
      try {
        const response = await axios.post(
          "/state-wise-weight-v2",
          {
            selectionType: selectedGoal,
            continent: selectedContinentDisplay,
            attribute: getApiAttributeForSelection(
              selectedGoal,
              selectedGoalOption,
            ),
            visaRequirement: getVisaRequirementApiValue(
              selectedVisaRequirement,
            ),
            passportCountry,
          },
          { signal: controller.signal },
        );

        const responseData = response?.data?.data || [];
        const selectedAttribute = response?.data?.selectedAttribute;

        const mappedDestinations = responseData.map((item) => {
          const rawState = item?.state || "";
          const aliasedState = destinationAliasMap[rawState] || rawState;
          const existingDestination =
            destinationLookup.get(normalizeDestinationKey(aliasedState)) ||
            destinationLookup.get(normalizeDestinationKey(rawState));

          const metricValue =
            typeof item?.[selectedAttribute] === "number"
              ? item[selectedAttribute]
              : Object.entries(item).find(
                  ([, value]) => typeof value === "number",
                )?.[1] || 0;

          return {
            ...(existingDestination || {}),
            _id: item?._id,
            city: existingDestination?.city || rawState,
            title: existingDestination?.title || item?.title || rawState,
            displayCity: existingDestination?.displayCity || rawState,
            routeCity: existingDestination?.routeCity || rawState,
            displayCountry:
              existingDestination?.displayCountry ||
              existingDestination?.country ||
              item?.country ||
              "Unknown",
            routeCountry:
              existingDestination?.routeCountry ||
              existingDestination?.country ||
              item?.country ||
              "Unknown",
            country: existingDestination?.country || item?.country || "Unknown",
            continent:
              existingDestination?.continent || selectedContinentDisplay,
            suggestions: Number(metricValue.toFixed(3)),
            internetSpeed: item?.internetSpeed,
            aqiValue: item?.aqiValue,
            nomadTax: item?.nomadTax,
            costOfLivingPerMonth: item?.costOfLivingPerMonth,
            allScores: item?.allScores || {},
            allLabels: item?.allLabels || {},
            label: item?.label || "",
            quickStats: item?.quickStats || [],
            weight: item?.weight || {},
            isActive: item?.isActive ?? existingDestination?.isActive ?? false,
            image: (() => {
              const urls = Array.isArray(item?.imageUrl)
                ? item.imageUrl
                : item?.imageUrl
                  ? [item.imageUrl]
                  : [];
              if (urls.length > 0) {
                // If it's still an array here for some reason, pick random.
                // Note: Backend now returns a random string in imageUrl, but this is a safety net.
                return urls[Math.floor(Math.random() * urls.length)];
              }
              return existingDestination?.image || "/images/goa-image.jpg";
            })(),
          };
        });

        if (isMounted) {
          setApiDestinations(mappedDestinations);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setApiDestinations([]);
        }
      } finally {
        if (isMounted) {
          setIsDestinationsLoading(false);
        }
      }
    };

    fetchRankedDestinations();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [
    destinationLookup,
    hasSelectedFilters,
    selectedContinent,
    selectedContinentDisplay,
    selectedGoal,
    selectedGoalOption,
    selectedVisaRequirement,
    passportCountry,
  ]);

  const searchBarBadges = useMemo(() => {
    const broaderGoal =
      searchBarBroaderGoalLabelMap[selectedGoal] || selectedGoal;
    return [`Your Broader Goal > ${broaderGoal}`];
  }, [selectedGoal]);

  const visibleDestinations = useMemo(
    () => rankedDestinations,
    [rankedDestinations],
  );

  const handleDestinationClick = (destination, event) => {
    const routeCountry = destination.routeCountry || destination.country;
    const country = routeCountry.toLowerCase();
    const selectedLocationLabel = destination.displayCity || destination.city;
    const selectedLocationParam = (
      destination.routeCity || destination.city
    ).toLowerCase();
    const continent = destination.continent.toLowerCase();
    const destinationTitle = destination.title || selectedLocationLabel;
    const nextSearchBarBadges = [...searchBarBadges, destinationTitle];
    const clickedCardKey = getSearchResultDestinationKey(destination);
    const scrollContainer = getAiScrollContainer();
    const clickedCardRect = event?.currentTarget?.getBoundingClientRect?.();
    const scrollContainerRect = scrollContainer?.getBoundingClientRect?.();
    const currentScrollTop = scrollContainer?.scrollTop || 0;
    const clickedCardContainerTop =
      clickedCardRect && scrollContainerRect
        ? clickedCardRect.top - scrollContainerRect.top
        : null;

    persistSelectedDestination({
      continent,
      country,
      city: selectedLocationParam,
      title: destinationTitle,
    });

    if (typeof window !== "undefined" && searchResultsPageStateStorageKey) {
      writeAiLayoutScrollPosition(location, currentScrollTop);

      window.sessionStorage.setItem(
        searchResultsPageStateStorageKey,
        JSON.stringify({
          apiDestinations,
          clickedCardKey,
          clickedCardContainerTop:
            typeof clickedCardContainerTop === "number"
              ? clickedCardContainerTop
              : null,
          isResultsReady,
          selectedVisaRequirement,
          scrollTop: currentScrollTop,
          sourceLocationKey: getAiScrollPositionKey(location),
          typedBottomHeading,
          typedResultsHeading,
          typedTopHeading,
          visaRuleDestinationKeys: visaRuleDestinationKeys
            ? Array.from(visaRuleDestinationKeys)
            : null,
          visaRuleDurationByCountry: visaRuleDurationByCountry
            ? Array.from(visaRuleDurationByCountry.entries())
            : null,
          visibleDestinationCount,
        }),
      );
    }

    const verticalsParams = new URLSearchParams({
      country,
      state: selectedLocationParam,
      goal: selectedGoal,
      continent: selectedContinent,
      goalOption: selectedGoalOption,
    });

    navigate(`/verticals?${verticalsParams.toString()}`, {
      state: {
        selectedStateLabel: destinationTitle,
        breadcrumbFilters: {
          continent,
          country,
          location: selectedLocationParam,
        },
        selectedFilters: {
          continent: selectedContinent,
          goalOption: selectedGoalOption,
        },
        searchBarBadges: nextSearchBarBadges,
      },
    });
  };
  const toggleDestinationLike = useCallback(
    (destination) => {
      const destinationKey = getDestinationFavoriteKey(destination);
      const destinationId = destination?._id;

      if (!userId) {
        navigate("/login", {
          state: {
            redirectTo: `${location.pathname}${location.search}`,
            loginContext: {
              title: "Save destination favorites",
              description:
                "Login to save your favorite destinations and continue from this results page.",
            },
          },
        });
        return;
      }

      if (!destinationId) {
        showErrorAlert("This destination cannot be favorited yet.");
        return;
      }

      const isCurrentlyLiked = likedDestinations.includes(destinationKey);
      const nextLikedDestinations = isCurrentlyLiked
        ? likedDestinations.filter((key) => key !== destinationKey)
        : [...likedDestinations, destinationKey];

      setLikedDestinations(nextLikedDestinations);

      axiosPrivate
        .patch("/user/favorite-destination", {
          destinationId,
          isFavorited: !isCurrentlyLiked,
        })
        .catch((error) => {
          setLikedDestinations(likedDestinations);
          showErrorAlert(
            error?.response?.data?.message ||
              "Failed to update favorite destination.",
          );
        });
    },
    [
      axiosPrivate,
      likedDestinations,
      location.pathname,
      location.search,
      navigate,
      userId,
    ],
  );

  const handleDropdownToggle = (dropdownKey) => {
    setOpenDropdown((currentDropdown) =>
      currentDropdown === dropdownKey ? null : dropdownKey,
    );
  };

  const handleContinentSelect = (continent) => {
    setSelectedContinent(continent);
    const encodedLoc = encodeURIComponent(continent);
    if (selectedGoalOption) {
      navigate(
        `${searchResultsBasePath}/${encodedLoc}/${encodeURIComponent(selectedGoalOption)}`,
        { state },
      );
    } else {
      navigate(`${searchResultsBasePath}/${encodedLoc}`, { state });
    }

    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
    }
    closeDropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  const handleGoalOptionSelect = (option) => {
    setSelectedGoalOption(option);
    const encodedLoc = selectedContinent
      ? encodeURIComponent(selectedContinentDisplay)
      : "World";
    const encodedAttr = encodeURIComponent(option);
    navigate(`${searchResultsBasePath}/${encodedLoc}/${encodedAttr}`, {
      state,
    });

    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
    }
    closeDropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  const handleVisaRequirementSelect = (option) => {
    setSelectedVisaRequirement(option);
    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
    }
    closeDropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  // const isPrimaryGoalOptionSelected =
  //   hasSelectedGoalOption && selectedGoalOption === goalOptions[0];

  const initialTopHeadingText =
    "Please select one option from each below so that I can display the best curated results.";
  const selectedTopHeadingText =
    goalNarrativeTopHeadingMap[requestedGoal] ||
    goalNarrativeTopHeadingMap[selectedGoal] ||
    goalNarrativeTopHeadingMap["World Ranking"];
  const selectedBottomHeadingText =
    "Feel free to edit your above selection anytime, and I will curate a new set of the best results for you.";

  const selectedResultsHeadingText = useMemo(() => {
    if (!selectedContinent || !selectedGoalOption) {
      return "";
    }

    const narrativeContinentLabel = getNarrativeContinentLabel(
      selectedContinentDisplay,
    );

    const goalNarratives =
      goalNarrativeByGoalAndAttribute[normalizeNarrativeKey(selectedGoal)] ||
      {};
    const narrativeTemplate =
      goalNarratives[normalizeNarrativeKey(selectedGoalOption)];

    if (narrativeTemplate) {
      return addAdditionalPriorityPointsText(
        narrativeTemplate.replaceAll("X", narrativeContinentLabel),
      );
    }

    return `Curated below are the best cities in ${narrativeContinentLabel} as per the ${selectedGoalOption} for you. The results below are ranked using WoNo’s Intelligence Model, analyzing 50+ global factors — including safety, nomad population, healthcare, visa flexibility, cost of living, taxation, work infrastructure, lifestyle quality, and community — tailored to your personal profile.`;
  }, [
    selectedContinent,
    selectedContinentDisplay,
    selectedGoal,
    selectedGoalOption,
  ]);

  const thinkingHeadingText = "Curating the best results for you";

  const isThinkingHeadingVisible =
    typedTopHeading.length > 0 &&
    thinkingHeadingText.startsWith(typedTopHeading);

  const clearTypingAnimations = useCallback(() => {
    if (topTypingIntervalRef.current) {
      clearInterval(topTypingIntervalRef.current);
      topTypingIntervalRef.current = null;
    }

    if (bottomTypingIntervalRef.current) {
      clearInterval(bottomTypingIntervalRef.current);
      bottomTypingIntervalRef.current = null;
    }

    if (selectedHeadingDelayTimeoutRef.current) {
      clearTimeout(selectedHeadingDelayTimeoutRef.current);
      selectedHeadingDelayTimeoutRef.current = null;
    }
  }, []);

  const animateTypedText = useCallback((text, setText, onComplete) => {
    setText("");

    if (!text) {
      onComplete?.();
      return null;
    }

    let currentIndex = 0;

    const intervalId = setInterval(() => {
      currentIndex += 1;
      setText(text.slice(0, currentIndex));

      if (currentIndex >= text.length) {
        clearInterval(intervalId);
        onComplete?.();
      }
    }, TYPING_INTERVAL_MS);

    return intervalId;
  }, []);

  const playInitialHeadingAnimation = useCallback(() => {
    clearTypingAnimations();
    setIsResultsReady(false);
    setTypedBottomHeading("");

    setTypedResultsHeading("");

    topTypingIntervalRef.current = animateTypedText(
      initialTopHeadingText,
      setTypedTopHeading,
    );
  }, [animateTypedText, clearTypingAnimations, initialTopHeadingText]);

  const playSelectedHeadingAnimation = useCallback(() => {
    clearTypingAnimations();
    setIsResultsReady(false);
    setTypedBottomHeading("");
    setTypedResultsHeading("");

    topTypingIntervalRef.current = animateTypedText(
      thinkingHeadingText,
      setTypedTopHeading,
      () => {
        selectedHeadingDelayTimeoutRef.current = setTimeout(() => {
          topTypingIntervalRef.current = animateTypedText(
            selectedTopHeadingText,
            setTypedTopHeading,
            () => {
              bottomTypingIntervalRef.current = animateTypedText(
                selectedBottomHeadingText,
                setTypedBottomHeading,
                () => {
                  bottomTypingIntervalRef.current = animateTypedText(
                    selectedResultsHeadingText,
                    setTypedResultsHeading,
                    () => {
                      setIsResultsReady(true);
                    },
                  );
                },
              );
            },
          );
        }, SELECTED_HEADING_TRANSITION_DELAY_MS);
      },
    );
  }, [
    animateTypedText,
    clearTypingAnimations,
    thinkingHeadingText,
    selectedBottomHeadingText,
    selectedResultsHeadingText,
    selectedTopHeadingText,
  ]);

  useEffect(() => {
    if (initialSearchResultsPageState) {
      return () => {
        clearTypingAnimations();
      };
    }

    playInitialHeadingAnimation();

    return () => {
      clearTypingAnimations();
    };
  }, [
    clearTypingAnimations,
    initialSearchResultsPageState,
    playInitialHeadingAnimation,
  ]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(
    () => () => {
      if (closeDropdownTimeoutRef.current) {
        clearTimeout(closeDropdownTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (loc) {
      setSelectedContinent(decodeURIComponent(loc));
    } else if (loc === undefined) {
      setSelectedContinent(null);
    }
  }, [loc]);

  useEffect(() => {
    if (attr) {
      setSelectedGoalOption(decodeURIComponent(attr));
    } else if (attr === undefined) {
      setSelectedGoalOption(null);
    }
  }, [attr]);

  useEffect(() => {
    const incomingFilters = location.state?.selectedFilters;
    if (!incomingFilters || loc || attr) return; // If URL params exist, they take priority

    setSelectedContinent(incomingFilters.continent || null);
    setSelectedGoalOption(incomingFilters.goalOption || null);
  }, [location.state, loc, attr]);

  // Redundant localStorage sync removed as per user request to use URLs instead
  /*
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedContinent) {
      localStorage.setItem(
        SEARCH_RESULTS_LOCATION_STORAGE_KEY,
        selectedContinent,
      );
    } else {
      localStorage.removeItem(SEARCH_RESULTS_LOCATION_STORAGE_KEY);
    }
  }, [selectedContinent]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedGoalOption) {
      localStorage.setItem(
        SEARCH_RESULTS_ATTRIBUTE_STORAGE_KEY,
        selectedGoalOption,
      );
    } else {
      localStorage.removeItem(SEARCH_RESULTS_ATTRIBUTE_STORAGE_KEY);
    }
  }, [selectedGoalOption]);
  */

  // Goal-change effect
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (previousGoalRef.current !== selectedGoal) {
      setSelectedContinent(null);
      setSelectedGoalOption(null);
      // If we are at a deep results URL, go back to root results on goal change
      if (loc || attr) {
        navigate(searchResultsBasePath, { state: location.state });
      }
    }

    if (selectedGoal) {
      localStorage.setItem(SEARCH_RESULTS_GOAL_STORAGE_KEY, selectedGoal);
    }

    previousGoalRef.current = selectedGoal;
  }, [
    selectedGoal,
    navigate,
    loc,
    attr,
    location.state,
    searchResultsBasePath,
  ]);

  useEffect(() => {
    if (!hasSelectedFilters) {
      setIsResultsReady(false);
      setTypedBottomHeading("");
      setTypedResultsHeading("");
    }
  }, [hasSelectedFilters]);

  useEffect(() => {
    if (!hasSelectedFilters || !isResultsReady) {
      setVisibleDestinationCount(0);
      previousVisibleDestinationsLengthRef.current = 0;
      return;
    }

    if (!visibleDestinations.length) {
      setVisibleDestinationCount(0);
      previousVisibleDestinationsLengthRef.current = 0;
      return;
    }

    if (hasHydratedDestinationRevealRef.current) {
      hasHydratedDestinationRevealRef.current = false;
      return;
    }

    const previousVisibleLength = Math.min(
      previousVisibleDestinationsLengthRef.current,
      visibleDestinations.length,
    );
    setVisibleDestinationCount(previousVisibleLength);

    const initialRevealTarget = Math.min(
      Math.max(previousVisibleLength, INITIAL_VISIBLE_DESTINATIONS),
      visibleDestinations.length,
    );

    if (previousVisibleLength >= initialRevealTarget) {
      previousVisibleDestinationsLengthRef.current = previousVisibleLength;
      return;
    }

    let currentVisibleCount = previousVisibleLength;

    const revealInterval = setInterval(() => {
      currentVisibleCount += 1;
      setVisibleDestinationCount(currentVisibleCount);

      if (currentVisibleCount >= initialRevealTarget) {
        previousVisibleDestinationsLengthRef.current = initialRevealTarget;
        clearInterval(revealInterval);
      }
    }, DESTINATION_REVEAL_INTERVAL_MS);

    return () => {
      clearInterval(revealInterval);
      previousVisibleDestinationsLengthRef.current = currentVisibleCount;
    };
  }, [hasSelectedFilters, isResultsReady, visibleDestinations]);

  useEffect(() => {
    if (
      !hasSelectedFilters ||
      !isResultsReady ||
      visibleDestinationCount <
        Math.min(INITIAL_VISIBLE_DESTINATIONS, visibleDestinations.length) ||
      visibleDestinationCount >= visibleDestinations.length
    ) {
      return undefined;
    }

    const sentinel = lazyLoadSentinelRef.current;
    if (!sentinel) {
      return undefined;
    }

    const loadNextDestinationBatch = () => {
      setVisibleDestinationCount((currentCount) => {
        const nextCount = Math.min(
          currentCount + DESTINATION_LAZY_BATCH_SIZE,
          visibleDestinations.length,
        );
        previousVisibleDestinationsLengthRef.current = nextCount;
        return nextCount;
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      loadNextDestinationBatch();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextDestinationBatch();
        }
      },
      {
        root: getAiScrollContainer(),
        rootMargin: "600px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [
    hasSelectedFilters,
    isResultsReady,
    visibleDestinationCount,
    visibleDestinations.length,
  ]);

  useEffect(() => {
    hasRestoredSearchScrollRef.current = false;
  }, [searchResultsPageStateStorageKey]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !searchResultsPageStateStorageKey ||
      !hasSelectedFilters ||
      !isResultsReady ||
      !visibleDestinations.length ||
      hasRestoredSearchScrollRef.current
    ) {
      return;
    }

    const savedState = window.sessionStorage.getItem(
      searchResultsPageStateStorageKey,
    );

    if (!savedState) {
      return;
    }

    try {
      const parsedState = JSON.parse(savedState);
      const targetScrollTop = Number(
        parsedState?.scrollTop ?? parsedState?.scrollY,
      );
      const clickedCardKey = parsedState?.clickedCardKey;
      const clickedCardContainerTop = Number(
        parsedState?.clickedCardContainerTop ??
          parsedState?.clickedCardViewportTop,
      );

      const hasScrollFallback =
        Number.isFinite(targetScrollTop) && targetScrollTop >= 0;
      const hasClickedCardPosition =
        clickedCardKey && Number.isFinite(clickedCardContainerTop);

      if (!hasClickedCardPosition && !hasScrollFallback) {
        return;
      }

      const restoreSearchResultsPosition = () => {
        const scrollContainer = getAiScrollContainer();
        if (!scrollContainer) return;

        const clickedCard = hasClickedCardPosition
          ? scrollContainer.querySelector(
              `[data-search-result-card-key="${clickedCardKey}"]`,
            )
          : null;

        if (clickedCard) {
          const scrollContainerRect = scrollContainer.getBoundingClientRect();
          const clickedCardRect = clickedCard.getBoundingClientRect();
          const cardTop =
            scrollContainer.scrollTop +
            clickedCardRect.top -
            scrollContainerRect.top -
            clickedCardContainerTop;

          scrollContainer.scrollTo({
            top: Math.max(0, cardTop),
            behavior: "auto",
          });
          return;
        }

        if (!hasScrollFallback) {
          return;
        }

        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: "auto",
        });
      };

      window.requestAnimationFrame(restoreSearchResultsPosition);
      const restoreTimers = [
        window.setTimeout(restoreSearchResultsPosition, 50),
        window.setTimeout(restoreSearchResultsPosition, 175),
        window.setTimeout(restoreSearchResultsPosition, 525),
      ];

      hasRestoredSearchScrollRef.current = true;
      window.sessionStorage.removeItem(searchResultsPageStateStorageKey);
      return () => {
        restoreTimers.forEach((timer) => window.clearTimeout(timer));
      };
    } catch {
      window.sessionStorage.removeItem(searchResultsPageStateStorageKey);
    }
  }, [
    hasSelectedFilters,
    isResultsReady,
    searchResultsPageStateStorageKey,
    visibleDestinations.length,
  ]);

  useEffect(() => {
    const persistedSignature = getPersistedSelectionSignature();
    const persistedGoal = getPersistedGoal();
    const selectedPair = hasSelectedFilters
      ? `${selectedContinent}|${selectedGoalOption}`
      : null;
    const selectedSignature = selectedPair
      ? `${selectedGoal}|${selectedPair}`
      : null;

    if (!selectedSignature) {
      previousSelectedPairRef.current = selectedPair;
      return;
    }

    const isFirstRenderForSelection = previousSelectedPairRef.current === null;
    const hasPersistedMatch =
      persistedSignature === selectedSignature &&
      persistedGoal === selectedGoal;

    if (isFirstRenderForSelection && hasPersistedMatch) {
      clearTypingAnimations();
      setTypedTopHeading(selectedTopHeadingText);
      setTypedBottomHeading(selectedBottomHeadingText);
      setTypedResultsHeading(selectedResultsHeadingText);
      setIsResultsReady(true);
    } else if (previousSelectedPairRef.current !== selectedPair) {
      playSelectedHeadingAnimation();
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(
        SEARCH_RESULTS_SELECTION_SIGNATURE_STORAGE_KEY,
        selectedSignature,
      );
    }

    previousSelectedPairRef.current = selectedPair;
  }, [
    clearTypingAnimations,
    hasSelectedFilters,
    playSelectedHeadingAnimation,
    selectedBottomHeadingText,
    selectedContinent,
    selectedGoal,
    selectedGoalOption,
    selectedResultsHeadingText,
    selectedTopHeadingText,
  ]);

  const shouldShowResultsContent = hasSelectedFilters && isResultsReady;
  const renderedDestinations = useMemo(
    () =>
      shouldShowResultsContent
        ? visibleDestinations.slice(0, visibleDestinationCount)
        : [],
    [shouldShowResultsContent, visibleDestinationCount, visibleDestinations],
  );
  const isAiGoalResultsPage = goal
    ? Boolean(goalNameBySlug[goal.toLowerCase()])
    : Boolean(selectedGoal);
  const shouldShowNarrative =
    hasSelectedFilters && (typedBottomHeading || typedResultsHeading);

  const startAiSearchResultsGuide = useCallback(() => {
    if (
      typeof window === "undefined" ||
      ARE_GUIDES_TEMPORARILY_DISABLED ||
      !isAiGoalResultsPage
    ) {
      return;
    }

    const getVisibleElement = (selector) =>
      Array.from(document.querySelectorAll(selector)).find(
        (element) =>
          element.getClientRects().length > 0 &&
          window.getComputedStyle(element).visibility !== "hidden",
      );

    const guideSteps = [
      {
        selector: '[data-tour="world-ranking-continent-filter"]',
        popover: {
          title: "Choose a region",
          description:
            "Use this dropdown to switch between worldwide results and a specific continent.",
          side: "bottom",
          align: "start",
        },
      },
      {
        selector: '[data-tour="world-ranking-goal-filter"]',
        popover: {
          title: "Refine the ranking",
          description:
            "Pick the exact ranking attribute that matters most for the current world ranking view.",
          side: "bottom",
          align: "start",
        },
      },
    ]
      .map(({ selector, popover }) => ({
        element: getVisibleElement(selector),
        popover,
      }))
      .filter((step) => step.element);

    if (!guideSteps.length) {
      return;
    }

    const guide = createDriverGuide({
      showProgress: true,
      allowClose: true,
      animate: true,
      overlayOpacity: 0.55,
      popoverClass: "wono-driver-popover",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      steps: guideSteps,
      guideSeenKey: AI_SEARCH_RESULTS_GUIDE_SEEN_KEY,
    });

    guide?.drive();
  }, [isAiGoalResultsPage]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      ARE_GUIDES_TEMPORARILY_DISABLED ||
      !isAiGoalResultsPage ||
      hasAutoStartedResultsGuideRef.current ||
      window.localStorage.getItem(AI_SEARCH_RESULTS_GUIDE_SEEN_KEY) === "1"
    ) {
      return undefined;
    }

    hasAutoStartedResultsGuideRef.current = true;

    const guideDelay = window.setTimeout(() => {
      startAiSearchResultsGuide();
    }, 700);

    return () => {
      window.clearTimeout(guideDelay);
    };
  }, [
    isAiGoalResultsPage,
    renderedDestinations.length,
    shouldShowNarrative,
    startAiSearchResultsGuide,
  ]);

  const [resultsHeadingFirstLine, resultsHeadingRemainingLines] =
    useMemo(() => {
      const [firstLine = "", ...remainingLines] =
        typedResultsHeading.split("\n");

      return [firstLine, remainingLines.join("\n")];
    }, [typedResultsHeading]);

  const highlightedResultsHeadingFirstLine = useMemo(
    () =>
      highlightSelectedTokens(resultsHeadingFirstLine, [
        selectedContinentDisplay,
        selectedGoalOption,
      ]),
    [resultsHeadingFirstLine, selectedContinentDisplay, selectedGoalOption],
  );

  const highlightedResultsHeadingRemainingLines = useMemo(
    () =>
      highlightSelectedTokens(resultsHeadingRemainingLines, [
        selectedContinentDisplay,
        selectedGoalOption,
      ]),
    [
      resultsHeadingRemainingLines,
      selectedContinentDisplay,
      selectedGoalOption,
    ],
  );

  const [resultsHeadingBodyLines, resultsHeadingLastLine] = useMemo(() => {
    if (!resultsHeadingRemainingLines) {
      return ["", ""];
    }

    const lines = resultsHeadingRemainingLines
      .split("\n")
      .map((line) => line.trimEnd());
    const lastLineIndex = [...lines]
      .reverse()
      .findIndex((line) => line.trim().startsWith("→"));

    if (lastLineIndex === -1) {
      return [resultsHeadingRemainingLines, ""];
    }

    const resolvedLastLineIndex = lines.length - 1 - lastLineIndex;
    const bodyLines = lines
      .slice(0, resolvedLastLineIndex)
      .join("\n")
      .trimEnd();
    const lastLine = lines[resolvedLastLineIndex].trim();

    return [bodyLines, lastLine];
  }, [resultsHeadingRemainingLines]);

  const formattedNarrative = useMemo(() => {
    const lines = (resultsHeadingBodyLines || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const poweredByLine = lines.find((line) =>
      line.toLowerCase().startsWith("powered by"),
    );

    const priorityPoints = lines
      .filter((line) => line.startsWith("•"))
      .map((line) => line.replace(/^•\s*/, "").trim());
    const visiblePriorityPoints =
      priorityPoints.length > PRIORITY_POINTS_VISIBLE_LIMIT
        ? priorityPoints.slice(0, PRIORITY_POINTS_VISIBLE_LIMIT)
        : priorityPoints;
    const additionalPriorityPointsText =
      lines.find((line) => ADDITIONAL_PRIORITY_POINTS_TEXT.startsWith(line)) ||
      "";

    const introLine =
      highlightedResultsHeadingFirstLine ||
      lines.find(
        (line) =>
          !line.startsWith("•") && !line.toLowerCase().startsWith("powered by"),
      ) ||
      "";

    const endingLine =
      resultsHeadingLastLine ||
      lines.find((line) => line.startsWith("→")) ||
      "";

    return {
      introLine,
      poweredByLine,
      priorityPoints: visiblePriorityPoints,
      additionalPriorityPointsText,
      endingLine,
    };
  }, [
    highlightedResultsHeadingFirstLine,
    resultsHeadingBodyLines,
    resultsHeadingLastLine,
  ]);

  return (
    <div className="min-h-full bg-white">
      <Seo path={seoPath} fallbackPath={seoFallbackPath} />
      <main className="pb-8">
        <div className="mx-0 w-full max-w-[80rem] px-3 sm:px-6 lg:mx-auto lg:max-w-[85rem] lg:px-0 lg:min-w-[75%]">
          <div className="rounded-[10px] bg-white px-0 pb-6">
            <div
              data-tour="world-ranking-heading"
              className="mt-2 mb-5 flex flex-col gap-3 lg:ml-[2.5rem] lg:mr-10 lg:flex-row lg:items-start lg:justify-between"
            >
              <p className="flex items-center gap-2 text-sm font-medium leading-snug text-black/85 lg:text-[0.9rem] font-play">
                {isThinkingHeadingVisible && (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-b-transparent"
                    aria-hidden="true"
                  />
                )}
                {typedTopHeading}
              </p>
              {/* Guide button hidden for now. Uncomment when guides should be manually accessible again.
              {isAiGoalResultsPage && (
                <button
                  type="button"
                  onClick={startAiSearchResultsGuide}
                  className="inline-flex w-fit items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-black/75 shadow-sm transition-colors hover:border-sky-500 hover:text-sky-600"
                >
                  <HiOutlineQuestionMarkCircle
                    className="text-base"
                    aria-hidden="true"
                  />
                  Guide
                </button>
              )}
              */}
            </div>

            <div
              data-tour="world-ranking-search-summary"
              className="mt-2 hidden max-w-full items-center rounded-[30px] border bg-white px-4 py-2 shadow-[0_5px_14px_rgba(0,0,0,0.12)] sm:flex lg:ml-[2.5rem] lg:mr-10"
            >
              <div className="flex flex-wrap items-center gap-2">
                {searchBarBadges.map((badgeLabel, index) => (
                  <div
                    key={`${badgeLabel}-${index}`}
                    className={searchBarBadgeClassName}
                  >
                    <span className="whitespace-normal break-words">
                      {badgeLabel}
                    </span>
                  </div>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-black/70 transition-colors hover:bg-black/5 hover:text-black"
                  aria-label="Clear search and go back"
                >
                  <HiOutlineX size={24} />
                </button>
                <HiOutlineSearch size={34} className="text-black/90" />
              </div>
            </div>

            <div className="relative mt-6 lg:ml-[2.5rem] lg:mr-10">
              <div
                ref={dropdownContainerRef}
                className="relative z-30 flex w-full flex-col gap-4 sm:flex-row sm:items-stretch"
              >
                <DropdownBadge
                  label="Continent"
                  options={continentOptions}
                  selectedValue={selectedContinentDropdownValue}
                  isOpen={openDropdown === "continent"}
                  onToggle={() => handleDropdownToggle("continent")}
                  onSelect={handleContinentSelect}
                  tourId="world-ranking-continent-filter"
                />

                <DropdownBadge
                  label={selectedGoal}
                  options={goalOptions}
                  selectedValue={selectedGoalOptionDropdownValue}
                  isOpen={openDropdown === "goalOption"}
                  onToggle={() => handleDropdownToggle("goalOption")}
                  onSelect={handleGoalOptionSelect}
                  tourId="world-ranking-goal-filter"
                />
              </div>

              <div className="relative mt-8">
                <div className="relative z-10">
                  {shouldShowNarrative && (
                    <>
                      {/* <p className="text-sm font-medium leading-relaxed text-primary-blue lg:text-[0.9rem] font-play">
                        {typedBottomHeading}
                      </p> */}
                      <div
                        data-tour="world-ranking-narrative"
                        className="mt-6 text-sm leading-relaxed text-black/85 lg:text-[0.9rem] font-play"
                      >
                        <span className="block font-bold">
                          {formattedNarrative.introLine}
                        </span>
                        {formattedNarrative.poweredByLine && (
                          <div className="mt-2">
                            <span>{formattedNarrative.poweredByLine}</span>
                            {(formattedNarrative.priorityPoints.length > 0 ||
                              formattedNarrative.additionalPriorityPointsText) && (
                              <span className="ml-1">
                                {formattedNarrative.priorityPoints.map(
                                  (point, index) => (
                                    <React.Fragment key={`${point}-${index}`}>
                                      <span>{point}</span>
                                      {index <
                                        formattedNarrative.priorityPoints
                                          .length -
                                          1 && <span>{", "}</span>}
                                    </React.Fragment>
                                  ),
                                )}

                                {formattedNarrative.additionalPriorityPointsText && (
                                  <span>
                                    {formattedNarrative.priorityPoints.length >
                                    0
                                      ? ", "
                                      : " "}
                                    {
                                      formattedNarrative.additionalPriorityPointsText
                                    }
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                          {(formattedNarrative.endingLine ||
                            !resultsHeadingBodyLines) && (
                            <span className="block font-medium">
                              {formattedNarrative.endingLine ||
                                highlightedResultsHeadingRemainingLines}
                            </span>
                          )}
                          {shouldShowResultsContent && isLoggedIn && (
                            <div className="flex w-full items-center justify-center gap-3 sm:justify-end lg:w-auto">
                              <span className="text-sm font-medium text-black/80 font-play">
                                Visa Options
                              </span>
                              <div className="w-[11rem] shrink-0 sm:w-[13rem]">
                                <DropdownBadge
                                  label="Visa Requirement"
                                  options={visaRequirementOptions}
                                  selectedValue={selectedVisaRequirement}
                                  isOpen={openDropdown === "visaRequirement"}
                                  onToggle={() =>
                                    handleDropdownToggle("visaRequirement")
                                  }
                                  onSelect={handleVisaRequirementSelect}
                                  size="small"
                                  tourId="world-ranking-visa-filter"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {shouldShowResultsContent ? (
                    <div
                      data-tour="world-ranking-results-grid"
                      className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-3 md:gap-4 xl:grid-cols-4"
                    >
                      {renderedDestinations.map((destination, index) => {
                        const shouldShowVisaDuration =
                          isVisaRequirementFilterActive(
                            selectedVisaRequirement,
                          ) && Boolean(visaRuleDurationByCountry);
                        const visaDurationDays = shouldShowVisaDuration
                          ? visaRuleDurationByCountry.get(
                              normalizeCountryKey(destination.country),
                            )
                          : null;
                        const visaDurationLabel =
                          visaDurationDays !== null &&
                          visaDurationDays !== undefined
                            ? `Visa Duration: ${
                                visaDurationDays === 0 ? "N/A" : `${visaDurationDays} days`
                              }`
                            : null;

                        const isDestinationLiked = likedDestinations.includes(
                          getDestinationFavoriteKey(destination),
                        );
                        const destinationCardKey =
                          getSearchResultDestinationKey(destination);

                        return (
                          <article
                            key={`${destination.city}-${destination.country}`}
                            data-tour={
                              index === 0
                                ? "world-ranking-result-card"
                                : undefined
                            }
                            data-search-result-card-key={destinationCardKey}
                            className="cursor-pointer translate-y-0 opacity-100 transition-all duration-300"
                            role="button"
                            tabIndex={0}
                            onClick={(event) =>
                              handleDestinationClick(destination, event)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleDestinationClick(destination, event);
                              }
                            }}
                          >
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl group">
                              <img
                                src={destination.image}
                                alt={`${destination.city}, ${destination.country}`}
                                draggable={false}
                                className="prevent-image-download aspect-square w-full rounded-xl object-cover md:rounded-2xl transition-transform duration-500 group-hover:scale-110"
                                loading={index < 4 ? "eager" : "lazy"}
                                fetchPriority={index < 4 ? "high" : "auto"}
                                decoding="async"
                                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                              />

                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/75 via-black/35 to-transparent md:inset-0 md:h-auto md:from-black/55 md:via-black/10 md:to-black/10" />

                              <div className="pointer-events-none absolute left-3 top-3 text-white text-xl  md:left-4 md:top-4 md:text-2xl">
                                #
                                {destination?.rankLabel
                                  ? destination.rankLabel.replace(
                                      /^Rank\s*/i,
                                      "",
                                    )
                                  : "—"}
                              </div>

                              <button
                                type="button"
                                className={`absolute right-3 top-3 z-30 cursor-pointer touch-manipulation md:right-4 md:top-4 ${
                                  isDestinationLiked
                                    ? ""
                                    : "[&_path]:transition-colors [&_path]:duration-200 [&:hover_path]:fill-[#ff8a8a]"
                                }`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  event.preventDefault();
                                  toggleDestinationLike(destination);
                                }}
                              >
                                {isDestinationLiked ? (
                                  <AiFillHeart className="text-xl text-[#ff5757] md:text-2xl" />
                                ) : (
                                  <AiTwotoneHeart className="text-xl text-[#b6b6b6] md:text-2xl" />
                                )}
                              </button>

                              <div className="pointer-events-none absolute inset-x-2 bottom-3 text-center text-white md:inset-x-4 md:bottom-4">
                                <h3 className="text-lg uppercase font-medium tracking-wide md:text-3xl md:font-normal">
                                  {destination.title}
                                  {/* {destination.displayCity || destination.city} */}
                                </h3>
                                <p className="text-sm font-light md:text-sm">
                                  {destination.displayCountry ||
                                    destination.country}
                                </p>
                              </div>

                              <div className="pointer-events-none absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center p-2 md:p-4">
                                <div className="translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                  <div className="mb-0 border-b border-white/30 pb-1">
                                    <p className="mb-1 text-center text-[0.55rem] font-medium uppercase tracking-wide text-white/85 sm:text-[0.65rem] md:text-base">
                                      {`${destination.title || destination.displayCity || destination.city} - ${
                                        destination.displayCountry ||
                                        destination.country
                                      }`.toUpperCase()}
                                    </p>

                                    <h4 className="text-center text-[0.7rem] font-semibold uppercase tracking-wide text-white sm:text-[0.8rem] md:text-[0.89rem]">
                                      {selectedGoalOption || "Attribute"}
                                    </h4>
                                  </div>
                                  <div className="mb-1 mt-1 flex items-center justify-between gap-1 py-0 text-[0.65rem] font-semibold text-white sm:text-xs md:mb-2 md:mt-2 md:gap-2 md:text-sm">
                                    <h4 className="text-left">
                                      {`${selectedContinentDisplay || "World"} Rank ${
                                        destination?.rankLabel
                                          ? destination.rankLabel.replace(
                                              /^Rank\s*/i,
                                              "",
                                            )
                                          : "—"
                                      }`}
                                    </h4>

                                    {shouldShowVisaDuration &&
                                      visaDurationLabel && (
                                        <span className="text-right text-[0.72rem] font-medium text-white/90">
                                          {visaDurationLabel}
                                        </span>
                                      )}
                                  </div>

                                  <div className="grid grid-cols-1 gap-1 md:gap-2 text-[0.6rem] sm:text-xs md:text-sm text-white/90">
                                    {getQuickStatsForDestination(
                                      destination,
                                    ).map((stat, statIndex) => (
                                      <div
                                        key={`${destination.city}-${stat.label}-${statIndex}`}
                                        className="rounded-lg px-2 py-[3px] md:py-1 transition-all duration-300"
                                        style={{
                                          backgroundImage: `linear-gradient(
                                          90deg,
                                          ${getScoreBarColorValue(stat.score)} 0%,
                                          ${getScoreBarColorValue(stat.score)} ${Math.max(
                                            0,
                                            Math.min(
                                              100,
                                              getScoreFillPercentage(
                                                stat.score,
                                              ),
                                            ),
                                          )}%,
                                          rgba(255, 255, 255, 0.16) ${Math.max(
                                            0,
                                            Math.min(
                                              100,
                                              getScoreFillPercentage(
                                                stat.score,
                                              ),
                                            ),
                                          )}%,
                                          rgba(255, 255, 255, 0.16) 100%
                                        )`,
                                        }}
                                      >
                                        <span className="font-light text-[0.6rem] sm:text-xs md:text-sm">
                                          {stat.label}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* <div className="px-2">
                            <div className="mt-1.5 flex items-start justify-start gap-1 md:mt-2 md:gap-1 ">
                              <div className="min-w-0">
                                <h3 className="truncate text-[0.8rem] font-semibold leading-tight text-black/90 md:text-[1.2rem]">
                                  {`${destination.title || destination.displayCity || destination.city} - `}
                                </h3>
                              </div>

                              <p className="truncate text-[0.8rem] font-semibold leading-tight text-black/90  md:text-[1.2rem]">
                                {destination.displayCountry ||
                                  destination.country}
                              </p>
                            </div>
                            <div>
                              <p className="text-[0.82rem] text-black/60 md:text-[0.9rem]">
                                Click to view options
                              </p>
                            </div>
                          </div> */}
                          </article>
                        );
                      })}
                      {visibleDestinationCount < visibleDestinations.length && (
                        <div
                          ref={lazyLoadSentinelRef}
                          className="col-span-full h-px w-full"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      {/* <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                      Results will appear here after you select both filters
                      above.
                    </div> */}
                    </>
                  )}

                  {shouldShowResultsContent && !rankedDestinations.length && (
                    <>
                      {isDestinationsLoading ? (
                        <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                          <FaSyncAlt className="text-xl text-primary-blue animate-spin" />
                          <p>Loading destinations...</p>
                        </div>
                      ) : (
                        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                          {isVisaRequirementFilterActive(
                            selectedVisaRequirement,
                          ) ? (
                            <span className="font-play font-bold text-black/85">
                              There is no{" "}
                              <span className="text-primary-blue">
                                {selectedVisaRequirement}
                              </span>{" "}
                              support destination in{" "}
                              <span className="text-primary-blue">
                                {selectedContinentDisplay}
                              </span>{" "}
                              right now.
                            </span>
                          ) : (
                            <span className="font-play font-bold text-black/85">
                              No destinations are available for{" "}
                              <span className="text-primary-blue">
                                {selectedContinentDisplay}
                              </span>{" "}
                              right now.
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiSearchResults;
