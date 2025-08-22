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

const NewsCard = ({ a }) => (
  <article className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
    {a.image ? (
      <img
        src={a.image}
        alt={a.title}
        className="w-full h-44 object-cover"
        loading="lazy"
      />
    ) : (
      <div className="w-full h-44 bg-gray-100" />
    )}

    <div className="p-4">
      <h3 className="font-semibold text-lg line-clamp-2">{a.title}</h3>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{a.description}</p>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span className="truncate">{a.source?.name}</span>
        <time dateTime={a.publishedAt}>
          {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ""}
        </time>
      </div>

      <a
        href={a.url}
        target="_blank"
        rel="noreferrer"
        className="inline-block mt-3 text-blue-600 font-medium hover:underline">
        Read full story →
      </a>
    </div>
  </article>
);

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
      const res = await axios.get("news", { params }); // -> /api/news
      return res.data; // { totalArticles, articles, scope }
    },
    staleTime: 1000 * 60 * 5,
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
          {/* <select
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dest.label}
            onChange={(e) =>
              setDest(DESTS.find((d) => d.label === e.target.value))
            }>
            {DESTS.map((d) => (
              <option key={d.label} value={d.label}>
                {d.label}
              </option>
            ))}
          </select> */}

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

          {/* {isPending && <span className="text-sm text-gray-500">Loading…</span>}
          {isError && (
            <span className="text-sm text-red-600">Could not load news.</span>
          )} */}

          {/* {scope && !isPending && !isError && (
          <span
            className={`text-xs ml-2 rounded-full px-2 py-1 ${
              scope.includes("city")
                ? "bg-green-100 text-green-700"
                : scope.includes("country")
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
            title={scope}>
            {scope}
          </span>
        )} */}
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
