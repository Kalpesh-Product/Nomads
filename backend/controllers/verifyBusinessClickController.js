import mongoose from "mongoose";
import Company from "../models/Company.js";
import VerifyBusinessClick from "../models/VerifyBusinessClick.js";

// Listing companyType (as stored on Company) -> option label used by the host
// signup's "Type of Vertical" field.
const COMPANY_TYPE_TO_VERTICAL = {
  coworking: "Co-working",
  coliving: "Co-living",
  hostel: "Hostel",
  workation: "Workation",
  meetingroom: "Meetings",
  cafe: "Cafe",
};

// A repeat click on the same listing by the same browser inside this window
// reuses the existing row instead of recording a new one.
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

const clip = (value, max = 500) => String(value ?? "").trim().slice(0, max);

// POST /api/company/verify-business-click — public.
// Body: { businessId?, companyId?, visitorId?, listingUrl?, referrer? }
// Answers { clickId } for the caller to carry to the host signup.
export const trackVerifyBusinessClick = async (req, res, next) => {
  try {
    const businessId = clip(req.body?.businessId, 100);
    const companyId = clip(req.body?.companyId, 100);
    if (!businessId && !companyId) {
      return res.status(400).json({ message: "businessId or companyId is required" });
    }

    const listing = await Company.findOne(businessId ? { businessId } : { companyId })
      .select("businessId companyId companyName companyType city state country")
      .lean();
    if (!listing?.companyId || !listing?.companyName) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const visitorId = clip(req.body?.visitorId, 100);
    if (visitorId) {
      const recent = await VerifyBusinessClick.findOne({
        visitorId,
        companyId: listing.companyId,
        businessId: listing.businessId || "",
        createdAt: { $gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
      })
        .select("_id")
        .lean();
      if (recent) return res.status(200).json({ clickId: String(recent._id) });
    }

    const click = await VerifyBusinessClick.create({
      companyId: listing.companyId,
      businessId: listing.businessId || "",
      companyName: listing.companyName,
      companyType: listing.companyType || "",
      city: listing.city || "",
      state: listing.state || "",
      country: listing.country || "",
      visitorId,
      listingUrl: clip(req.body?.listingUrl),
      referrer: clip(req.body?.referrer),
      userAgent: clip(req.headers["user-agent"]),
    });

    return res.status(201).json({ clickId: String(click._id) });
  } catch (error) {
    return next(error);
  }
};

// GET /api/forms/verify-click/:id — public. Just enough to pre-fill the host
// signup; the click id is an unguessable ObjectId and nothing personal is
// returned.
export const getVerifyBusinessClick = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Link not found" });
    }
    const click = await VerifyBusinessClick.findById(id).lean();
    if (!click) return res.status(404).json({ message: "Link not found" });

    // Every product type the company lists, so a multi-vertical business gets
    // all of them pre-selected.
    const types = await Company.distinct("companyType", { companyId: click.companyId });
    const verticalType = [
      ...new Set(
        [...types, click.companyType]
          .map((type) => COMPANY_TYPE_TO_VERTICAL[String(type || "").toLowerCase()])
          .filter(Boolean),
      ),
    ];

    return res.status(200).json({
      clickId: String(click._id),
      companyId: click.companyId,
      companyName: click.companyName,
      country: click.country,
      state: click.state,
      city: click.city,
      verticalType,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/admin/verify-business-clicks (admin key) — interest per company:
// how many times its "Verify Business" button was clicked, by how many
// browsers, when last, and whether any click became a host signup.
export const getVerifyBusinessClicksAdmin = async (req, res, next) => {
  try {
    const rows = await VerifyBusinessClick.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$companyId",
          companyName: { $first: "$companyName" },
          companyType: { $first: "$companyType" },
          businessId: { $first: "$businessId" },
          city: { $first: "$city" },
          state: { $first: "$state" },
          country: { $first: "$country" },
          clicks: { $sum: 1 },
          visitors: { $addToSet: "$visitorId" },
          lastClickedAt: { $first: "$createdAt" },
          signedUps: { $sum: { $cond: [{ $ifNull: ["$hostUser", false] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          companyId: "$_id",
          companyName: 1,
          companyType: 1,
          businessId: 1,
          city: 1,
          state: 1,
          country: 1,
          clicks: 1,
          uniqueVisitors: {
            $size: {
              $filter: { input: "$visitors", as: "v", cond: { $ne: ["$$v", ""] } },
            },
          },
          lastClickedAt: 1,
          signedUps: 1,
        },
      },
      { $sort: { lastClickedAt: -1 } },
      { $limit: 300 },
    ]);
    return res.status(200).json({ count: rows.length, data: rows });
  } catch (error) {
    return next(error);
  }
};

// The click a signup arrived from, if it is real and hasn't already produced a
// signup (one click links one lead, so a shared link can't be reused to claim
// the same company twice).
export const findUnusedVerifyClick = async (clickId) => {
  if (!mongoose.isValidObjectId(clickId)) return null;
  const click = await VerifyBusinessClick.findById(clickId).lean();
  return click && !click.hostUser ? click : null;
};

// Called by the host signup once the lead is saved.
export const attachHostUserToClick = async (clickId, hostUserId) => {
  if (!mongoose.isValidObjectId(clickId)) return null;
  const click = await VerifyBusinessClick.findById(clickId);
  if (!click) return null;
  // First signup wins — a second signup reusing the link doesn't take it over.
  if (!click.hostUser) {
    click.hostUser = hostUserId;
    click.signedUpAt = new Date();
    await click.save();
  }
  return click;
};
