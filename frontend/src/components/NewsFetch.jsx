// src/components/NewsFetch.jsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axios.js";
import { IoChevronDown } from "react-icons/io5";
import humanDate from "../utils/humanDate.js";

const DESTS = [
  { label: "Goa", country: "in", keyword: "Goa", lang: "en" },
  { label: "Bali", country: "id", keyword: "Bali", lang: "en" }, // or 'id' to widen coverage
  { label: "Bangkok", country: "th", keyword: "Bangkok", lang: "en" }, // or 'th'
];

const extractImageFromContent = (content) => {
  const match = content?.match(/<img.*?src=["'](.*?)["']/);
  return match ? match[1] : null;
};

const NewsCard = ({ a }) => {
  const fallbackImg = extractImageFromContent(a.content || a.description);
  const thumbnail = a.mainImage || fallbackImg;

  return (
    <article className="group relative rounded-xl border bg-white transition hover:shadow-md">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Image */}
        <div className="sm:w-56 shrink-0 block">
          <div className="h-40 sm:h-36 rounded-lg overflow-hidden">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={a.mainTitle}
                className="block h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-gray-100" />
            )}
          </div>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <h3 className="mt-1 text-lg font-semibold leading-snug text-gray-900 line-clamp-2">
            {a.mainTitle}
          </h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {a.mainContent}
          </p>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span className="truncate">{a.author || "News Desk"}</span>
            <time dateTime={a.date}>
              {a.date ? humanDate(a.date) : ""}
            </time>
          </div>
        </div>
      </div>
    </article>
  );
};


const NewsFetch = () => {
  const [dest, setDest] = useState(DESTS[0]);

  const params = useMemo(
    () => ({
      country: dest.country, // ISO-2 (in/id/th)
      keyword: dest.keyword, // city/region (search q)
      lang: dest.lang, // optional; omit to broaden
      category: "general", // for top-headlines fallback
      max: 10, // free plan cap
    }),
    [dest]
  );

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "gnews",
      dest.label,
      params.country
    ],
    queryFn: async () => {
      const res = await axios.get("/news/get-news", { params }); // hits your backend
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  const articles = Array.isArray(data) ? data : [];

  const scope = data?.scope;

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-col xs:flex-col md:flex-row lg:flex-row">
        <h2 className="text-title font-semibold text-host">News</h2>
        {/* Controls */}
        <div className="flex items-center justify-end gap-3 mb-0 ">
          <label className="text-sm font-medium text-gray-700">
            Destination
          </label>

          <div className="relative inline-block">
            <select
              className="block w-full rounded-lg border-2 border-gray-400 bg-white px-3 py-2 pr-8
               text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={dest.label}
              onChange={(e) =>
                setDest(DESTS.find((d) => d.label === e.target.value))
              }>
              {DESTS.map((d) => (
                <option key={d.label} value={d.label}>
                  {d.label}
                </option>
              ))}
            </select>
            <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
          </div>

          {/* <button
            type="button"
            onClick={() => refetch()}
            className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
            disabled={isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </button> */}
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {isPending && <span className="text-sm text-gray-500">Loading…</span>}
        {isError && (
          <span className="text-sm text-red-600">Could not load news.</span>
        )}
        {articles.map((a) => (
          <NewsCard key={a.guid} a={a} />
        ))}
      </div>

      {!isPending && !isError && articles.length === 0 && (
        <p className="text-sm text-gray-500 mt-4">No articles found.</p>
      )}
    </div>
  );
};

export default NewsFetch;
