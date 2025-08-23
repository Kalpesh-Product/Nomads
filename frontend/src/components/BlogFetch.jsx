import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axios"; // your custom axios instance
import { IoChevronDown } from "react-icons/io5";

const DESTS = [
  { label: "Goa", keyword: "Goa" },
  { label: "Bali", keyword: "Bali" },
  { label: "Bangkok", keyword: "Bangkok" },
];

const stripHTML = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const extractImageFromContent = (content) => {
  const match = content?.match(/<img.*?src=["'](.*?)["']/);
  return match ? match[1] : null;
};

const BlogCard = ({ b }) => {
  const fallbackImg = extractImageFromContent(b.content || b.description);
  const thumbnail = b.thumbnail || fallbackImg;

  return (
    <article className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={b.title}
          className="w-full h-44 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-44 bg-gray-100" />
      )}

      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2">{b.title}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {stripHTML(b.description)}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="truncate">{b.author || "Unknown"}</span>
          <time dateTime={b.pubDate}>
            {b.pubDate ? new Date(b.pubDate).toLocaleDateString() : ""}
          </time>
        </div>

        <a
          href={b.link}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 text-blue-600 font-medium hover:underline">
          Read full blog →
        </a>
      </div>
    </article>
  );
};

const BlogFetch = () => {
  const [dest, setDest] = useState(DESTS[0]);

  const params = useMemo(() => ({ keyword: dest.keyword }), [dest]);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["blogs", dest.keyword],
    queryFn: async () => {
      const res = await axios.get("/blogs", { params }); // your backend: /api/blogs
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  //   const blogs = Array.isArray(data?.articles) ? data.articles : [];
  const blogs = Array.isArray(data?.articles) ? data.articles.slice(0, 9) : [];

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-col xs:flex-col md:flex-row lg:flex-row">
        <h2 className="text-title font-semibold text-host">Local Blog</h2>
        {/* Controls */}
        <div className="flex items-center justify-end gap-3 mb-5">
          <label className="text-sm font-medium text-gray-700">
            Destination
          </label>
          <div className="relative inline-block">
            <select
              className="block w-full rounded-lg border-2 border-gray-400 bg-white px-3 py-2 pr-8 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

          {/* {isPending && <span className="text-sm text-gray-500">Loading…</span>}
          {isError && (
            <span className="text-sm text-red-600">Could not load blogs.</span>
          )} */}
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isPending && <span className="text-sm text-gray-500">Loading…</span>}
        {isError && (
          <span className="text-sm text-red-600">Could not load blogs.</span>
        )}
        {blogs.map((b) => (
          <BlogCard key={b.guid} b={b} />
        ))}
      </div>

      {!isPending && !isError && blogs.length === 0 && (
        <p className="text-sm text-gray-500 mt-4">No blog posts found.</p>
      )}
    </div>
  );
};

export default BlogFetch;
