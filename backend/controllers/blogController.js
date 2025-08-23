import axios from "axios";

const RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json";

// RSS feeds for different locations (can expand later)
// const RSS_FEEDS = {
//   Goa: "https://www.nomadicmatt.com/feed/",
//   Bali: "https://www.thebrokebackpacker.com/feed/",
//   Bangkok: "https://www.goatsontheroad.com/feed/",
//   default: "https://www.nomadicmatt.com/feed/",
// };

const RSS_FEEDS = {
  Goa: "https://www.nomadicmatt.com/feed/", // works ✅
  // Goa: "https://www.holidify.com/blog/feed/", // Goa travel articles from Holidify
  Bali: "https://thehoneycombers.com/bali/feed/",

  Bangkok: "https://www.traveldudes.com/feed/", // works ✅
  default: "https://www.nomadicmatt.com/feed/",
};

export const getBlogs = async (req, res, next) => {
  try {
    const { keyword = "default" } = req.query;

    const feedURL = RSS_FEEDS[keyword] || RSS_FEEDS["default"];

    const { data } = await axios.get(RSS2JSON_BASE, {
      params: {
        rss_url: feedURL,
      },
      timeout: 10000,
    });

    if (!data?.items?.length) {
      return res.status(404).json({ message: "No blog posts found." });
    }

    return res.json({
      scope: keyword,
      total: data.items.length,
      articles: data.items,
    });
  } catch (err) {
    console.error("RSS fetch error:", {
      message: err.message,
      status: err.response?.status,
      response: err.response?.data,
    });

    return res.status(500).json({ message: "Failed to fetch blog content." });
  }
};
