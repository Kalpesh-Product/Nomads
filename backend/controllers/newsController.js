// controllers/newsController.js
import axios from "axios";

const BASE = "https://gnews.io/api/v4";
const APIKEY = process.env.GNEWS_API_KEY;

// Curated travel/nomad terms
const TRAVEL_TERMS = [
  `"digital nomad"`,
  "nomads",
  `"remote work"`,
  `"private stay"`,
  `"meeting room"`,
  "coworking",
  "workation",
  "travel",
  "tourism",
  "visa",
  "cafe",
  "backpacking",
  "hostel",
  "coliving",
  "expat",
].join(" OR ");

function assertKey() {
  if (!APIKEY) {
    const err = new Error("GNEWS_API_KEY missing");
    err.status = 500;
    throw err;
  }
}

async function callGNews(path, params) {
  assertKey();
  try {
    const { data } = await axios.get(`${BASE}/${path}`, {
      params: { apikey: APIKEY, ...params },
      timeout: 10_000,
    });
    return { ok: true, data };
  } catch (e) {
    const status = e.response?.status || 502;
    const payload = e.response?.data;
    console.error("GNews upstream error", { status, payload });
    return { ok: false, status, payload };
  }
}

export const getNews = async (req, res, next) => {
  try {
    let {
      country = "",
      keyword = "",
      lang = "en",
      max = 10,
      page = 1,
      sortby = "publishedAt",
    } = req.query;

    const nMax = Math.min(Math.max(Number(max) || 10, 1), 10);

    // Build query: travel terms + keyword (if any)
    const query = keyword
      ? `(${TRAVEL_TERMS}) AND (${keyword})`
      : `(${TRAVEL_TERMS})`;

    // 1) Search with travel+nomad query
    let r = await callGNews("search", {
      q: query,
      country: country || undefined,
      lang,
      max: nMax,
      page,
      sortby,
      in: "title,description",
    });

    if (r.ok && r.data?.articles?.length) {
      return res.json({
        scope: keyword ? "travel+keyword" : "travel",
        ...r.data,
      });
    }

    // 2) If no result → try global travel news
    r = await callGNews("search", {
      q: TRAVEL_TERMS,
      lang,
      max: nMax,
      page,
      sortby,
      in: "title,description",
    });

    if (r.ok) return res.json({ scope: "global travel", ...r.data });

    return res
      .status(r.status || 502)
      .json({ message: "GNews error", upstream: r.payload });
  } catch (err) {
    next(err);
  }
};
