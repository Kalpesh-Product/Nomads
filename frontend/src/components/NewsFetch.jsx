// src/components/NewsFetch.jsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axios.js";

const DESTS = [
  { label: "Goa", country: "in", keyword: "Goa" },
  { label: "Bali", country: "id", keyword: "Bali" },
  { label: "Bangkok", country: "th", keyword: "Bangkok" },
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
        <span className="truncate">{a.source}</span>
        <time dateTime={a.published_at}>
          {a.published_at ? new Date(a.published_at).toLocaleString() : ""}
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

  const { data, isPending, isError } = useQuery({
    queryKey: ["news", dest.label],
    queryFn: async () => {
      const baseParams = {
        limit: 12,
        sort: "published_desc",
        categories: "general",
      };

      // 1) Try with keyword + country
      let res = await axios.get("news", {
        params: { ...baseParams, country: dest.country, keyword: dest.keyword },
      });

      if (res.data?.data?.length) {
        return res.data;
      }

      // 2) Fallback: drop keyword, keep country (show country news)
      res = await axios.get("news", {
        params: { ...baseParams, country: dest.country },
      });

      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const articles = data?.data ?? [];

  return (
    <div className="my-6">
      {/* Destination dropdown */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-sm font-medium text-gray-700">Destination</label>
        <select
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
        </select>

        {isPending && <span className="text-sm text-gray-500">Loading…</span>}
        {isError && (
          <span className="text-sm text-red-600">Could not load news.</span>
        )}
      </div>

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <NewsCard key={a.url} a={a} />
        ))}
      </div>

      {!isPending && !isError && articles.length === 0 && (
        <p className="text-sm text-gray-500 mt-4">
          No articles found for {dest.label}.
        </p>
      )}
    </div>
  );
};

export default NewsFetch;
