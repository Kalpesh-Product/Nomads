// src/components/NewsFetch.jsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axios.js";
import { IoChevronDown } from "react-icons/io5";

const DESTS = [
  { label: "Goa", country: "in", keyword: "Goa", lang: "en" },
  { label: "Bali", country: "id", keyword: "Bali", lang: "en" }, // or 'id' to widen coverage
  { label: "Bangkok", country: "th", keyword: "Bangkok", lang: "en" }, // or 'th'
];

const NewsCard = ({ a }) => {
  const desc = a.description || a.content || "";
  const category = a.category || a.topic || a.section || "Destinations";

  return (
    <article className="group relative rounded-xl border bg-white transition hover:shadow-md">
      <div className="flex flex-col sm:flex-row gap-4 p-4 ">
        {/* Image */}
        <a
          href={a.url}
          target="_blank"
          rel="noreferrer"
          className="sm:w-56 shrink-0 block ">
          <div className="h-40 sm:h-36 rounded-lg overflow-hidden ">
            {a.image ? (
              <img
                src={a.image}
                alt={a.title}
                className="block h-full w-full object-cover" // see note below
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-gray-100" />
            )}
          </div>
        </a>

        {/* Text */}
        <div className="min-w-0 flex-1">
          {/* <div className="flex items-center gap-2 text-xs">
            <span className="text-xs font-medium text-orange-600">
              {category}
            </span>
            <span className="text-gray-400">•</span>
            <time className="text-gray-500" dateTime={a.publishedAt}>
              {a.publishedAt
                ? new Date(a.publishedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : ""}
            </time>
          </div> */}

          <a href={a.url} target="_blank" rel="noreferrer">
            <h3 className="mt-1 text-lg font-semibold leading-snug text-gray-900 line-clamp-2">
              {a.title}
            </h3>
          </a>

          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{desc}</p>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div>
              <span className="truncate">
                {a.author || a.source?.name || "News Desk"}
              </span>
              &nbsp;|&nbsp;
              <time className="text-gray-500" dateTime={a.publishedAt}>
                {a.publishedAt
                  ? new Date(a.publishedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : ""}
              </time>
            </div>
            <a
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 font-medium text-blue-600 hover:underline">
              Read full story →
            </a>
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
      params.country,
      params.keyword,
      params.lang,
    ],
    queryFn: async () => {
      const res = await axios.get("news", { params }); // hits your backend
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  const articles = Array.isArray(data?.articles) ? data.articles : [];
  const scope = data?.scope;

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-title font-semibold text-host">Destination News</h2>
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

          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
            disabled={isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {isPending && <span className="text-sm text-gray-500">Loading…</span>}
        {isError && (
          <span className="text-sm text-red-600">Could not load news.</span>
        )}
        {articles.map((a) => (
          <NewsCard key={a.url} a={a} />
        ))}
      </div>

      {!isPending && !isError && articles.length === 0 && (
        <p className="text-sm text-gray-500 mt-4">No articles found.</p>
      )}
    </div>
  );
};

export default NewsFetch;
