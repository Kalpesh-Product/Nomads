// src/components/NewsFetch.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axios.js";
import { IoChevronDown } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";
import humanDate from "../utils/humanDate.js";
import { useSelector } from "react-redux";

const DESTS = [
  { label: "All", country: null, keyword: null, lang: null }, // ✅ New option
  { label: "Goa", country: "in", keyword: "goa", lang: "en" },
  { label: "Bali", country: "id", keyword: "bali", lang: "en" },
  { label: "Bangkok", country: "th", keyword: "bangkok", lang: "en" },
  { label: "Phuket", country: "th", keyword: "phuket", lang: "en" },
  { label: "Ho Chi Minh", country: "vn", keyword: "ho chi minh", lang: "en" },
  { label: "Rio", country: "br", keyword: "rio", lang: "en" },
  { label: "Dubai", country: "uae", keyword: "dubai", lang: "en" },
];

const extractImageFromContent = (content) => {
  const match = content?.match(/<img.*?src=["'](.*?)["']/);
  return match ? match[1] : null;
};

const NewsCard = ({ a }) => {
  const navigate = useNavigate();

  const fallbackImg = extractImageFromContent(a.content || a.description);
  const thumbnail = a.mainImage || fallbackImg;

  return (
    <article
      onClick={() => navigate("news-details", { state: { content: a } })}
      className="group relative rounded-xl border bg-white transition hover:shadow-md cursor-pointer overflow-hidden max-w-full"
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Image */}
        {/* <div className="sm:w-56 shrink-0 block"> */}
        <div className="w-full sm:w-56 shrink-0 block">
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
            <time dateTime={a.date}>{a.date ? humanDate(a.date) : ""}</time>
          </div>
        </div>
      </div>
    </article>
  );
};

const NewsFetch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dest, setDest] = useState(DESTS[0]);
  const formData = useSelector((state) => state.location.formValues);
  const initialized = useRef(false);

  // ✅ Sync dropdown with URL params on page load
  // ✅ Sync dropdown with formData only on mount
  // useEffect(() => {
  //   if (initialized.current) return; // ✅ don’t override after first run
  //   initialized.current = true;

  //   const selectedDest = formData?.location;
  //   if (selectedDest) {
  //     const found = DESTS.find((d) => d.keyword === selectedDest);
  //     if (found) {
  //       setDest(found);
  //       setSearchParams({ dest: found.label });
  //       return;
  //     }
  //   }

  //   // fallback = All
  //   setDest(DESTS[0]);
  //   setSearchParams({ dest: DESTS[0].label });
  // }, [formData, setSearchParams]);

  useEffect(() => {
    if (initialized.current) return; // ✅ don’t override after first run
    initialized.current = true;

    const selectedDest = formData?.location;
    if (selectedDest) {
      const found = DESTS.find((d) => d.keyword === selectedDest);
      if (found) {
        setDest(found);
        setSearchParams({ dest: found.label });
        return;
      } else {
        // 🚫 No matching destination
        setDest(null);
        setSearchParams({});
        return;
      }
    }

    // 🚫 No location in formData at all
    setDest(null);
    setSearchParams({});
  }, [formData, setSearchParams]);

  const handleChange = (val) => {
    const selected = DESTS.find((d) => d.label === val);
    if (selected) {
      setDest(selected);
      setSearchParams({ dest: selected.label });
    }
  };

  const params = useMemo(() => {
    if (!dest || dest.label === "All") return null; // add !dest check
    return {
      country: dest.country,
      keyword: dest.keyword,
      lang: dest.lang,
      category: "general",
      max: 10,
    };
  }, [dest]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["gnews", dest?.label], // use optional chaining
    queryFn: async () => {
      if (!dest) return []; // early return if dest is null
      if (dest.label === "All") {
        const res = await axios.get("/news/get-news");
        return res.data;
      }
      const res = await axios.get("/news/get-news", { params });
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  const articles = Array.isArray(data) ? data : [];

  if (!dest) {
    return (
      <div className="my-6">
        <div className="flex justify-between items-center mb-4 flex-col sm:flex-col xs:flex-col md:flex-row lg:flex-row">
          <h2 className="text-title font-semibold text-host">News</h2>
          {/* Controls (keep dropdown usable) */}
          <div className="flex items-center justify-end gap-3 mb-0 ">
            <label className="text-sm font-medium text-gray-700">
              Destination
            </label>

            <div className="relative inline-block">
              <select
                className="block w-full rounded-lg border-2 border-gray-400 bg-white px-3 py-2 pr-8
               text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={"Select"}
                onChange={(e) => handleChange(e.target.value)}
              >
                <option value={"Select"} disabled>
                  Select
                </option>
                {DESTS.map((d) => (
                  <option key={d.label} value={d.label}>
                    {d.label}
                  </option>
                ))}
              </select>
              <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
            </div>
          </div>
        </div>

        <div className="text-subtitle text-gray-600 my-36">
          No news available for this location. You can use the filter to check
          news of other locations.
        </div>
      </div>
    );
  }

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
              onChange={(e) => handleChange(e.target.value)}
            >
              {DESTS.map((d) => (
                <option key={d.label} value={d.label}>
                  {d.label}
                </option>
              ))}
            </select>
            <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {isPending && (
          <div className="h-screen">
            <span className="text-sm text-gray-500">Loading…</span>
          </div>
        )}
        {isError && (
          <div className="h-screen">
            <span className="text-sm text-red-600">Could not load news.</span>
          </div>
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
