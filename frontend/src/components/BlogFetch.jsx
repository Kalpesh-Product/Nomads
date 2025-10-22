import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axios"; // your custom axios instance
import { IoChevronDown } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";
import humanDate from "../utils/humanDate";
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
  const thumbnail = b.mainImage || fallbackImg;
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate("blog-details", { state: { content: b } })}
      className="border rounded-xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={b.mainTitle}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-44 bg-gray-100" />
      )}

      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2">{b.mainTitle}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {b.mainContent}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="truncate">{b.author || "Author"}</span>
          <time dateTime={b.date}>{b.date ? humanDate(b.date) : ""}</time>
        </div>

        {/* <NavLink
          to={"blog-details"}
          className={"underline"}
      
        >
          Read full blog →
        </NavLink> */}

        {/* <a
          href={b.link}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 text-blue-600 font-medium hover:underline">
          Read full blog →
        </a> */}
      </div>
    </article>
  );
};

const BlogFetch = () => {
  // const [dest, setDest] = useState(DESTS[0]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDest =
    DESTS.find((d) => d.label === searchParams.get("dest")) || DESTS[0];
  const [dest, setDest] = useState(DESTS[0]);
  const formData = useSelector((state) => state.location.formValues);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
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

    // 🚫 No location in formData
    setDest(null);
    setSearchParams({});
  }, [formData, setSearchParams]);

  const handleChange = (val) => {
    const selected = DESTS.find((d) => d.label === val);
    setDest(selected);
    setSearchParams({ dest: selected.label });
  };

  const params = useMemo(() => {
    if (!dest || dest.label === "All") return null;
    return {
      country: dest.country,
      keyword: dest.keyword,
      lang: dest.lang,
      category: "general",
      max: 10,
    };
  }, [dest]);

  // const { data, isPending, isError, refetch, isFetching } = useQuery({
  //   queryKey: ["blogs", dest.keyword],
  //   queryFn: async () => {
  //     const res = await axios.get("/blogs/get-blogs", { params });
  //     return res.data;
  //   },
  // });

  const { data, isPending, isError } = useQuery({
    queryKey: ["blogs", dest?.label], // optional chaining
    queryFn: async () => {
      if (!dest) return []; // early return if dest is null
      if (dest.label === "All") {
        const res = await axios.get("/blogs/get-blogs");
        return res.data;
      }
      const res = await axios.get("/blogs/get-blogs", { params });
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  //   const blogs = Array.isArray(data?.articles) ? data.articles : [];
  const blogs = Array.isArray(data) ? data : [];

  if (!dest) {
    return (
      <div className="my-6">
        <div className="flex justify-between items-center mb-4 flex-col sm:flex-col xs:flex-col md:flex-row lg:flex-row">
          <h2 className="text-title font-semibold text-host">Blog</h2>

          {/* Controls */}
          <div className="flex items-center justify-end gap-3 mb-5">
            <label className="text-sm font-medium text-gray-700">
              Destination
            </label>
            <div className="relative inline-block">
              <select
                className="block w-full rounded-lg border-2 border-gray-400 bg-white px-3 py-2 pr-8 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          No blog posts available for this location. You can use the filter to
          check blogs of other locations.
        </div>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-col xs:flex-col md:flex-row lg:flex-row">
        <h2 className="text-title font-semibold text-host">Blog</h2>
        {/* Controls */}
        <div className="flex items-center justify-end gap-3 mb-5">
          <label className="text-sm font-medium text-gray-700">
            Destination
          </label>
          <div className="relative inline-block">
            <select
              className="block w-full rounded-lg border-2 border-gray-400 bg-white px-3 py-2 pr-8 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
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
