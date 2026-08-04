import mongoose from "mongoose";
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
