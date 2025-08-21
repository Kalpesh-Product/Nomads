// Requires: npm i axios
// .env must include: MEDIASTACK_KEY=your_mediastack_key

import axios from "axios";

export const getNews = async (req, res, next) => {
  try {
    const {
      country = "in",
      keyword = "Goa",
      categories,
      languages,
      limit = "12",
      sort = "published_desc",
      offset,
    } = req.query;

    if (!process.env.MEDIASTACK_KEY) {
      return res.status(500).json({ message: "MEDIASTACK_KEY missing" });
    }

    // lightweight sanity checks (keep it minimal)
    const nLimit = Number(limit);
    if (Number.isNaN(nLimit) || nLimit < 1 || nLimit > 50) {
      return res.status(400).json({ message: "Invalid 'limit' (1–50)" });
    }

    const params = {
      access_key: process.env.MEDIASTACK_KEY,
      countries: country,
      keywords: keyword,
      limit: nLimit,
      sort,
    };
    if (categories) params.categories = categories;
    if (languages) params.languages = languages;
    if (offset) params.offset = offset;

    const { data } = await axios.get("https://api.mediastack.com/v1/news", {
      params,
      timeout: 10000,
    });

    return res.json(data); // { pagination, data: [ ...articles ] }
  } catch (err) {
    next(err);
  }
};
