// // controllers/newsController.js
// import axios from "axios";
// import NewsCache from "../models/NewsCache.js";
import News from "../models/News.js";
import { Readable } from "stream";
import csvParser from "csv-parser";

// const BASE = "https://gnews.io/api/v4";
// const APIKEY = process.env.GNEWS_API_KEY;

// const TRAVEL_TERMS = [
//   `"digital nomad"`,
//   "nomads",
//   `"remote work"`,
//   `"private stay"`,
//   `"meeting room"`,
//   "coworking",
//   "workation",
//   "travel",
//   "tourism",
//   "visa",
//   "cafe",
//   "backpacking",
//   "hostel",
//   "coliving",
// ].join(" OR ");

// async function callGNews(path, params) {
//   const { data } = await axios.get(`${BASE}/${path}`, {
//     params: { apikey: APIKEY, ...params },
//     timeout: 10_000,
//   });
//   return data;
// }

// export const getNews = async (req, res, next) => {
//   try {
//     const {
//       country = "",
//       keyword = "",
//       lang = "en",
//       max = 10,
//       page = 1,
//     } = req.query;
//     const nMax = Math.min(Math.max(Number(max) || 10, 1), 10);

//     // use keyword if present, otherwise country as cache key
//     const locationKey = keyword || country || "global";

//     // 1. check DB cache
//     const cached = await NewsCache.findOne({ location: locationKey });
//     if (cached) {
//       return res.json({
//         fromCache: true,
//         scope: cached.scope,
//         articles: cached.articles,
//       });
//     }

//     // 2. build query for GNews
//     const query = keyword
//       ? `(${TRAVEL_TERMS}) AND (${keyword})`
//       : `(${TRAVEL_TERMS})`;

//     let data = await callGNews("search", {
//       q: query,
//       country: country || undefined,
//       lang,
//       max: nMax,
//       page,
//       sortby: "publishedAt",
//       in: "title,description",
//     });

//     let scope = keyword ? "travel+keyword" : "travel";

//     // fallback to global travel if empty
//     if (!data?.articles?.length) {
//       data = await callGNews("search", {
//         q: TRAVEL_TERMS,
//         lang,
//         max: nMax,
//         page,
//         sortby: "publishedAt",
//         in: "title,description",
//       });
//       scope = "global travel";
//     }

//     // 3. save to DB
//     await NewsCache.create({
//       location: locationKey,
//       scope,
//       articles: data.articles || [],
//     });

//     return res.json({ fromCache: false, scope, articles: data.articles || [] });
//   } catch (err) {
//     console.error("News error", err.response?.data || err.message);
//     next(err);
//   }
// };

export const getNews = async (req, res, next) => {
  try {
    const { keyword } = req.query;

    let query = {};
    if (keyword) {
      query.destination = { $regex: keyword, $options: "i" };
    }

    const blogs = await News.find(query).sort({ date: -1 });

    return res.status(200).json(blogs);
  } catch (error) {
    next(error);
  }
};

export const bulkInsertnews = async (req, res, next) => {
  try {
    const results = [];

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a CSV file." });
    }
    const stream = Readable.from(req.file.buffer.toString("utf-8"));
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        try {
          // Build sections array
          const sections = [];
          for (let i = 1; i <= 20; i++) {
            const image = row[`Section ${i} Image`];
            const title = row[`Section ${i} Title`];
            const content = row[`Section ${i} Content`];

            if (image || title || content) {
              sections.push({
                image: image || "",
                title: title || "",
                content: content || "",
              });
            }
          }

          results.push({
            mainTitle: row["Main Title"],
            mainImage: row["Main Image URL"],
            mainContent: row["Main Content"],
            author: row["Author"] || "",
            date: row["Date"] ? new Date(row["Date"]) : null,
            destination: row["Destination"] || "",
            source: row["Source"] || "",
            blogType: row["Type"] || "",
            sections,
          });
        } catch (err) {
          console.error("Error processing row:", err);
        }
      })
      .on("end", async () => {
        try {
          await News.insertMany(results);
          res.status(201).json({
            message: "News uploaded successfully",
            count: results.length,
          });
        } catch (err) {
          console.error("DB insert error:", err);
          res.status(500).json({ error: "Error saving blogs to DB" });
        }
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
