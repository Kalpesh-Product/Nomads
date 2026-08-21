import { api } from "./axios";

export const SELECTED_DESTINATION_SESSION_KEY = "wonoSelectedDestination";
const DESTINATION_CLICK_SESSION_KEY = "wonoDestinationClickSessionId";
const DESTINATION_CLICK_DEDUPE_MS = 1000;
let lastDestinationClick = { key: "", time: 0 };

const normalizeValue = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizeDisplayValue = (value) =>
    typeof value === "string" ? value.trim() : "";

const getDestinationClickSessionId = () => {
    if (typeof window === "undefined") return "";

    const existingSessionId = window.localStorage.getItem(
        DESTINATION_CLICK_SESSION_KEY,
    );
    if (existingSessionId) return existingSessionId;

    const sessionId =
        typeof window.crypto?.randomUUID === "function"
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(DESTINATION_CLICK_SESSION_KEY, sessionId);
    return sessionId;
};

export const persistSelectedDestination = ({ continent, country, city, title }) => {
    if (typeof window === "undefined") return;

    const normalizedCountry = normalizeValue(country);
    const normalizedCity = normalizeValue(city);
    const normalizedTitle = normalizeDisplayValue(title);

    if (!normalizedCountry || !normalizedCity) return;

    const normalizedContinent = normalizeValue(continent);
    const clickKey = [
        normalizedContinent,
        normalizedCountry,
        normalizedCity,
        normalizedTitle.toLowerCase(),
    ].join("|");
    const now = Date.now();
    const isDuplicateClick =
        lastDestinationClick.key === clickKey &&
        now - lastDestinationClick.time < DESTINATION_CLICK_DEDUPE_MS;
    lastDestinationClick = { key: clickKey, time: now };

    window.sessionStorage.setItem(
        SELECTED_DESTINATION_SESSION_KEY,
        JSON.stringify({
            continent: normalizedContinent,
            country: normalizedCountry,
            city: normalizedCity,
            title: normalizedTitle,
            updatedAt: Date.now(),
        }),
    );

    if (isDuplicateClick) return;

    // Best-effort popularity tracking. This is intentionally public so top
    // destinations include logged-out visitors as well as signed-in users.
    api
        .post("analytics/destination-click", {
            continent,
            country,
            state: city,
            title: normalizedTitle,
            sourcePage: window.location.pathname,
            pagePath: `${window.location.pathname}${window.location.search}${window.location.hash}`,
            referrer: document.referrer,
            sessionId: getDestinationClickSessionId(),
        }, { withCredentials: true })
        .catch(() => {});
};

export const readSelectedDestination = () => {
    if (typeof window === "undefined") return null;

    const selectedDestination = window.sessionStorage.getItem(
        SELECTED_DESTINATION_SESSION_KEY,
    );

    if (!selectedDestination) return null;

    try {
        const parsed = JSON.parse(selectedDestination);
        if (!parsed || typeof parsed !== "object") return null;

        const country = normalizeValue(parsed.country);
        const city = normalizeValue(parsed.city);

        if (!country || !city) return null;

        return {
            continent: normalizeValue(parsed.continent),
            country,
            city,
            title: normalizeDisplayValue(parsed.title),
            updatedAt:
                typeof parsed.updatedAt === "number" ? parsed.updatedAt : undefined,
        };
    } catch (error) {
        console.error("Failed to read selected destination from session storage", error);
        return null;
    }
};

export const getCountryNameFromSelectedDestination = (countries = []) => {
    const selectedDestination = readSelectedDestination();
    if (!selectedDestination?.country) return "";

    const matchedCountry = countries.find(
        (country) => normalizeValue(country?.name) === selectedDestination.country,
    );

    return matchedCountry?.name || "";
};
