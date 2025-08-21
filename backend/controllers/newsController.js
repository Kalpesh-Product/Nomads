// controllers/newsController.js
import axios from "axios";

const BASE = "https://gnews.io/api/v4";
const APIKEY = process.env.GNEWS_API_KEY;

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

/**
 * GET /api/news
 * Query params:
 * - country: ISO-2 (in,id,th,us,...)  (optional)
 * - keyword: string (e.g. Goa, Bali, Bangkok) (optional)
 * - lang: 2-letter (en,id,th,...) (optional; default auto)
 * - category: for top-headlines (general, business, sports, ...) (optional; default 'general')
 * - max: number of articles (free plan max=10) (optional; default 10)
 * - page: page number (1..n) for pagination (optional)
 * - sortby: publishedAt | relevance (search only) (optional; default publishedAt)
 */
export const getNews = async (req, res, next) => {
  try {
    let {
      country = "",
      keyword = "",
      lang = "",
      category = "general",
      max = 10,
      page = 1,
      sortby = "publishedAt",
    } = req.query;

    // keep within free-plan maximum
    const nMax = Math.min(Math.max(Number(max) || 10, 1), 10);

    // 1) If keyword given, try SEARCH with q + country
    if (keyword) {
      let r = await callGNews("search", {
        q: keyword, // required for search
        country: country || undefined,
        lang: lang || undefined,
        max: nMax,
        page,
        sortby, // publishedAt | relevance
        in: "title,description", // default fields to match (per docs)
      });
      if (!r.ok && r.status !== 404) {
        return res
          .status(r.status)
          .json({ message: "GNews error", upstream: r.payload });
      }
      if (r.ok && r.data?.articles?.length) {
        return res.json({ scope: "city+country (search)", ...r.data });
      }

      // 2) Fallback: country headlines (no q)
      r = await callGNews("top-headlines", {
        country: country || undefined,
        lang: lang || undefined,
        category,
        max: nMax,
        page,
      });
      if (r.ok && r.data?.articles?.length) {
        return res.json({ scope: "country (top-headlines)", ...r.data });
      }

      // 3) Last resort: global search by keyword
      r = await callGNews("search", {
        q: keyword,
        lang: lang || undefined,
        max: nMax,
        page,
        sortby,
        in: "title,description",
      });
      if (r.ok) return res.json({ scope: "global (search)", ...r.data });
      return res
        .status(r.status || 502)
        .json({ message: "GNews error", upstream: r.payload });
    }

    // No keyword: return country headlines (or general)
    let r = await callGNews("top-headlines", {
      country: country || undefined,
      lang: lang || undefined,
      category,
      max: nMax,
      page,
    });
    if (r.ok)
      return res.json({
        scope: country ? "country (top-headlines)" : "top-headlines",
        ...r.data,
      });
    return res
      .status(r.status || 502)
      .json({ message: "GNews error", upstream: r.payload });
  } catch (err) {
    next(err);
  }
};
