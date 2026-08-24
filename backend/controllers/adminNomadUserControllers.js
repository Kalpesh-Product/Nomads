import mongoose from "mongoose";
import axios from "axios";
import NomadUser from "../models/NomadUser.js";
import NomadDestinationView from "../models/NomadDestinationView.js";
import NomadListingView from "../models/NomadListingView.js";
import NomadUserSessionLog from "../models/NomadUserSessionLog.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Never surface auth secrets even though the source schema is read with
// `strict: false`.
const SENSITIVE_FIELDS = "-password -resetPasswordToken -resetPasswordExpire -refreshToken";

const POPULATE_OPTIONS = [
  { path: "saves", select: "companyName city state country" },
  { path: "likes", select: "companyName city state country" },
  { path: "favoriteDestination", select: "title state country continent" },
];

export const listNomadUsersForAdmin = async (req, res, next) => {
  try {
    const { search } = req.query;

    const filter = {};
    const trimmedSearch = String(search || "").trim();
    if (trimmedSearch) {
      const searchRegex = new RegExp(escapeRegex(trimmedSearch), "i");
      filter.$or = [
        { fullName: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { country: searchRegex },
        { state: searchRegex },
      ];
    }

    const users = await NomadUser.find(filter)
      .select(SENSITIVE_FIELDS)
      .populate(POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ items: users, total: users.length });
  } catch (error) {
    next(error);
  }
};

// `from`/`to` are optional ISO date strings scoping a per-user history query
// (list view or export) to a date range on `createdAt`.
const buildDateRangeFilter = (req) => {
  const { from, to } = req.query;
  const range = {};
  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) range.$gte = fromDate;
  }
  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) range.$lte = toDate;
  }
  return Object.keys(range).length ? { createdAt: range } : {};
};

export const getPopularDestinationsForAdmin = async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const filter = buildDateRangeFilter(req);

    const items = await NomadDestinationView.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            country: "$country",
            state: "$state",
            title: "$title",
            continent: "$continent",
          },
          clicks: { $sum: 1 },
          guestClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 0, 1] } },
          loggedInClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 1, 0] } },
          uniqueUsersSet: { $addToSet: "$userId" },
          uniqueSessionsSet: { $addToSet: "$sessionId" },
          lastClickedAt: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          _id: 0,
          country: "$_id.country",
          state: "$_id.state",
          title: "$_id.title",
          continent: "$_id.continent",
          clicks: 1,
          guestClicks: 1,
          loggedInClicks: 1,
          uniqueUsers: {
            $size: {
              $filter: {
                input: "$uniqueUsersSet",
                as: "userId",
                cond: { $ne: ["$$userId", null] },
              },
            },
          },
          uniqueSessions: {
            $size: {
              $filter: {
                input: "$uniqueSessionsSet",
                as: "sessionId",
                cond: { $and: [{ $ne: ["$$sessionId", null] }, { $ne: ["$$sessionId", ""] }] },
              },
            },
          },
          lastClickedAt: 1,
        },
      },
      { $sort: { clicks: -1, lastClickedAt: -1 } },
      { $limit: limit },
    ]);

    const totals = await NomadDestinationView.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          guestClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 0, 1] } },
          loggedInClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 1, 0] } },
          destinations: { $addToSet: { country: "$country", state: "$state" } },
          uniqueUsersSet: { $addToSet: "$userId" },
          uniqueSessionsSet: { $addToSet: "$sessionId" },
        },
      },
      {
        $project: {
          _id: 0,
          totalClicks: 1,
          guestClicks: 1,
          loggedInClicks: 1,
          totalDestinations: { $size: "$destinations" },
          uniqueUsers: {
            $size: {
              $filter: {
                input: "$uniqueUsersSet",
                as: "userId",
                cond: { $ne: ["$$userId", null] },
              },
            },
          },
          uniqueSessions: {
            $size: {
              $filter: {
                input: "$uniqueSessionsSet",
                as: "sessionId",
                cond: { $and: [{ $ne: ["$$sessionId", null] }, { $ne: ["$$sessionId", ""] }] },
              },
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      items,
      totals: totals[0] || {
        totalClicks: 0,
        guestClicks: 0,
        loggedInClicks: 0,
        totalDestinations: 0,
        uniqueUsers: 0,
        uniqueSessions: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDestinationListingAnalyticsForAdmin = async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const { country, state, title, continent, viewMode } = req.query;
    const filter = buildDateRangeFilter(req);

    const trimmedCountry = String(country || "").trim();
    const trimmedState = String(state || "").trim();
    const trimmedTitle = String(title || "").trim();
    const trimmedContinent = String(continent || "").trim();
    const locationCandidates = [...new Set([trimmedState, trimmedTitle].filter(Boolean))];

    if (!trimmedCountry || locationCandidates.length === 0) {
      return res.status(400).json({ message: "country and destination are required" });
    }

    filter.country = new RegExp(`^${escapeRegex(trimmedCountry)}$`, "i");
    filter.$or = locationCandidates.flatMap((location) => {
      const exactLocation = new RegExp(`^${escapeRegex(location)}$`, "i");
      return [{ city: exactLocation }, { state: exactLocation }];
    });

    const normalizedViewMode = String(viewMode || "").trim().toLowerCase();
    if (normalizedViewMode === "map") {
      filter.sourceView = "map";
    } else if (normalizedViewMode === "list") {
      filter.sourceView = "list";
    }

    const items = await NomadListingView.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            companyId: "$companyId",
            businessId: "$businessId",
            companyName: "$companyName",
            city: "$city",
            state: "$state",
            country: "$country",
            continent: "$continent",
          },
          clicks: { $sum: 1 },
          guestClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 0, 1] } },
          loggedInClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 1, 0] } },
          uniqueUsersSet: { $addToSet: "$userId" },
          lastClickedAt: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          _id: 0,
          companyId: "$_id.companyId",
          businessId: "$_id.businessId",
          companyName: "$_id.companyName",
          city: "$_id.city",
          state: "$_id.state",
          country: "$_id.country",
          continent: "$_id.continent",
          clicks: 1,
          guestClicks: 1,
          loggedInClicks: 1,
          uniqueUsers: {
            $size: {
              $filter: {
                input: "$uniqueUsersSet",
                as: "userId",
                cond: { $ne: ["$$userId", null] },
              },
            },
          },
          lastClickedAt: 1,
        },
      },
      { $sort: { clicks: -1, lastClickedAt: -1 } },
      { $limit: limit },
    ]);

    const totals = await NomadListingView.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          guestClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 0, 1] } },
          loggedInClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 1, 0] } },
          listings: { $addToSet: { companyId: "$companyId", businessId: "$businessId", companyName: "$companyName" } },
          uniqueUsersSet: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          _id: 0,
          totalClicks: 1,
          guestClicks: 1,
          loggedInClicks: 1,
          totalListings: { $size: "$listings" },
          uniqueUsers: {
            $size: {
              $filter: {
                input: "$uniqueUsersSet",
                as: "userId",
                cond: { $ne: ["$$userId", null] },
              },
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      items,
      destination: {
        country: trimmedCountry,
        state: trimmedState,
        continent: trimmedContinent,
      },
      totals: totals[0] || {
        totalClicks: 0,
        guestClicks: 0,
        loggedInClicks: 0,
        totalListings: 0,
        uniqueUsers: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDestinationUsersForAdmin = async (req, res, next) => {
  try {
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 200));
    const { country, state, title, continent } = req.query;
    const filter = buildDateRangeFilter(req);

    const trimmedCountry = String(country || "").trim();
    const trimmedState = String(state || "").trim();
    const trimmedTitle = String(title || "").trim();
    const trimmedContinent = String(continent || "").trim();
    const destinationCandidates = [...new Set([trimmedState, trimmedTitle].filter(Boolean))];

    if (!trimmedCountry || destinationCandidates.length === 0) {
      return res.status(400).json({ message: "country and destination are required" });
    }

    filter.country = new RegExp(`^${escapeRegex(trimmedCountry)}$`, "i");
    filter.$or = destinationCandidates.map((destination) => ({
      state: new RegExp(`^${escapeRegex(destination)}$`, "i"),
    }));

    const views = await NomadDestinationView.find(filter)
      .populate({ path: "userId", select: "fullName firstName lastName email mobile country state" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const toUserEntry = (view) => {
      const user = view.userId && typeof view.userId === "object" ? view.userId : null;

      return {
        id: String(view._id),
        ipAddress: view.ipAddress || "",
        clickedAt: view.createdAt,
        sessionId: view.sessionId || "",
        sourcePage: view.sourcePage || "",
        pagePath: view.pagePath || "",
        user: user
          ? {
              id: String(user._id),
              name:
                user.fullName ||
                [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                user.email ||
                "Logged in user",
              email: user.email || "",
              mobile: user.mobile || "",
              country: user.country || "",
              state: user.state || "",
            }
          : null,
      };
    };

    const guestUsers = [];
    const loggedInUsers = [];
    views.forEach((view) => {
      const entry = toUserEntry(view);
      if (entry.user) {
        loggedInUsers.push(entry);
      } else {
        guestUsers.push(entry);
      }
    });

    return res.status(200).json({
      guestUsers,
      loggedInUsers,
      totals: {
        guestUsers: guestUsers.length,
        loggedInUsers: loggedInUsers.length,
        totalUsers: guestUsers.length + loggedInUsers.length,
      },
      destination: {
        country: trimmedCountry,
        state: trimmedState,
        title: trimmedTitle,
        continent: trimmedContinent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --- Visitor origin (IP -> location) analytics ------------------------------
// Every destination click stores the caller's IP. To answer "which locations
// send us the most users" we group clicks by IP, resolve the public ones via
// ip-api.com's free batch endpoint (HTTP only on the free tier, up to 100
// IPs per call, 15 calls/min — fine for server-to-server), and cache results
// so each unique IP costs at most one lookup per day. Private/loopback IPs
// (dev traffic) and unresolvable ones are reported separately instead of
// being dropped.

const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const GEO_CACHE_MAX_ENTRIES = 5000;
const geoCache = new Map();

const isPrivateIp = (ip) =>
  !ip ||
  /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0$)/.test(ip) ||
  /^(::1$|::ffff:127\.|f[cd]|fe80)/i.test(ip);

const buildLocationLabel = (geo) =>
  [geo?.city, geo?.regionName, geo?.country].filter(Boolean).join(", ") || null;

const lookupGeoForIps = async (ips) => {
  const now = Date.now();
  const missing = ips.filter((ip) => {
    const hit = geoCache.get(ip);
    return !hit || now - hit.cachedAt > GEO_CACHE_TTL_MS;
  });

  if (geoCache.size > GEO_CACHE_MAX_ENTRIES) {
    geoCache.clear();
  }

  for (let i = 0; i < missing.length; i += 100) {
    const chunk = missing.slice(i, i + 100);
    try {
      const { data } = await axios.post(
        "http://ip-api.com/batch?fields=status,country,countryCode,regionName,city,query",
        chunk,
        { timeout: 12000 },
      );
      (Array.isArray(data) ? data : []).forEach((entry) => {
        if (entry?.query && entry?.status === "success") {
          geoCache.set(entry.query, { geo: entry, cachedAt: Date.now() });
        }
      });
    } catch {
      // Geo provider unavailable/rate-limited — those IPs stay unresolved.
    }
  }

  return (ip) => geoCache.get(ip)?.geo || null;
};

export const getVisitorLocationBreakdownForAdmin = async (req, res, next) => {
  try {
    const filter = buildDateRangeFilter(req);

    const [totalsRows, ipGroups] = await Promise.all([
      NomadDestinationView.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalClicks: { $sum: 1 },
            guestClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 0, 1] } },
            loggedInClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 1, 0] } },
            uniqueIpsSet: { $addToSet: "$ipAddress" },
          },
        },
        {
          $project: {
            _id: 0,
            totalClicks: 1,
            guestClicks: 1,
            loggedInClicks: 1,
            uniqueIps: { $size: "$uniqueIpsSet" },
          },
        },
      ]),
      NomadDestinationView.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$ipAddress",
            clicks: { $sum: 1 },
            guestClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 0, 1] } },
            loggedInClicks: { $sum: { $cond: [{ $ifNull: ["$userId", false] }, 1, 0] } },
            lastClickedAt: { $max: "$createdAt" },
          },
        },
        { $sort: { clicks: -1, lastClickedAt: -1 } },
        { $limit: 500 },
      ]),
    ]);

    const totals = totalsRows[0] || {
      totalClicks: 0,
      guestClicks: 0,
      loggedInClicks: 0,
      uniqueIps: 0,
    };

    const publicGroups = [];
    let localNetworkClicks = 0;
    ipGroups.forEach((group) => {
      if (isPrivateIp(group._id)) {
        localNetworkClicks += group.clicks;
      } else {
        publicGroups.push(group);
      }
    });

    const geoLookup = await lookupGeoForIps(publicGroups.map((group) => group._id));

    const countryMap = new Map();
    const cityMap = new Map();
    const stateMap = new Map();
    let resolvedClicks = 0;

    publicGroups.forEach((group) => {
      const geo = geoLookup(group._id);
      const label = buildLocationLabel(geo);
      if (!label) return;
      resolvedClicks += group.clicks;
      const country = geo.country || label;
      countryMap.set(country, (countryMap.get(country) || 0) + group.clicks);
      cityMap.set(label, (cityMap.get(label) || 0) + group.clicks);
      const state = [geo.regionName, geo.country].filter(Boolean).join(", ") || null;
      if (state) {
        stateMap.set(state, (stateMap.get(state) || 0) + group.clicks);
      }
    });

    const toRanked = (map, limit) =>
      [...map.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);

    return res.status(200).json({
      totals: {
        ...totals,
        resolvedClicks,
        localNetworkClicks,
        unknownClicks: Math.max(0, totals.totalClicks - resolvedClicks - localNetworkClicks),
      },
      countries: toRanked(countryMap, 12),
      cities: toRanked(cityMap, 12),
      states: toRanked(stateMap, 12),
      topIps: publicGroups.slice(0, 12).map((group) => ({
        ip: group._id || "",
        label: buildLocationLabel(geoLookup(group._id)) || "Unknown location",
        clicks: group.clicks,
        guestClicks: group.guestClicks,
        loggedInClicks: group.loggedInClicks,
        lastClickedAt: group.lastClickedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Every per-user sub-resource (destination views, listing views, session
// logs) is paginated, date-filterable, and sorted the same way — factor the
// shared shape once instead of repeating it per endpoint.
const paginatedUserHistory = (Model) => async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const filter = { userId, ...buildDateRangeFilter(req) };

    const [items, total] = await Promise.all([
      Model.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Model.countDocuments(filter),
    ]);

    return res.status(200).json({
      items,
      page,
      limit: pageSize,
      total,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    next(error);
  }
};

export const getDestinationViewsForAdmin = paginatedUserHistory(NomadDestinationView);
export const getListingViewsForAdmin = paginatedUserHistory(NomadListingView);
export const getSessionLogsForAdmin = paginatedUserHistory(NomadUserSessionLog);

const EXPORT_ROW_LIMIT = 20000;

// Raw JSON for all 3 history types in one call, within an optional date
// range — the master panel builds the multi-sheet Excel export from this.
export const getUserActivityForExport = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const filter = { userId, ...buildDateRangeFilter(req) };

    const [user, destinations, listings, sessions] = await Promise.all([
      NomadUser.findById(userId).select("fullName firstName lastName email").lean(),
      NomadDestinationView.find(filter).sort({ createdAt: -1 }).limit(EXPORT_ROW_LIMIT).lean(),
      NomadListingView.find(filter).sort({ createdAt: -1 }).limit(EXPORT_ROW_LIMIT).lean(),
      NomadUserSessionLog.find(filter).sort({ createdAt: -1 }).limit(EXPORT_ROW_LIMIT).lean(),
    ]);

    return res.status(200).json({ user, destinations, listings, sessions });
  } catch (error) {
    next(error);
  }
};
