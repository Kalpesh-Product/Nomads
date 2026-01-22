import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axios"; // your custom axios instance
import { IoChevronDown } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";
import humanDate from "../utils/humanDate";
import { useSelector } from "react-redux";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const DESTS = [
  { label: "All", country: null, keyword: null, lang: null }, // ✅ New option
  { label: "Goa", country: "in", keyword: "goa", lang: "en" },
  { label: "Bali", country: "id", keyword: "bali", lang: "en" },
  { label: "Bangkok", country: "th", keyword: "bangkok", lang: "en" },
  { label: "Phuket", country: "th", keyword: "phuket", lang: "en" },
  { label: "Ho Chi Minh", country: "vn", keyword: "ho chi minh", lang: "en" },
  { label: "Rio", country: "br", keyword: "rio", lang: "en" },
  { label: "Dubai", country: "uae", keyword: "dubai", lang: "en" },
  { label: "Auckland", country: "nz", keyword: "auckland", lang: "en" },
  { label: "Western Cape", country: "za", keyword: "western cape", lang: "en" },
  { label: "Budapest", country: "hu", keyword: "budapest", lang: "hu" },
  { label: "Mexico City", country: "mx", keyword: "mexico city", lang: "es" },
  { label: "Quintana Roo", country: "mx", keyword: "quintana roo", lang: "es" },
  { label: "Tulum", country: "mx", keyword: "tulum", lang: "es" },

  { label: "Montreal", country: "ca", keyword: "montreal", lang: "fr" },

  { label: "Abuja (FCT)", country: "ng", keyword: "abuja fct", lang: "en" },

  { label: "Cairo Governorate", country: "eg", keyword: "cairo", lang: "ar" },

  {
    label: "North Holland",
    country: "nl",
    keyword: "north holland",
    lang: "nl",
  },

  { label: "Lagos", country: "ng", keyword: "lagos", lang: "en" },
  { label: "Lagos State", country: "ng", keyword: "lagos state", lang: "en" },

  { label: "Lisbon", country: "pt", keyword: "lisbon", lang: "pt" },
  { label: "Nadi", country: "fj", keyword: "nadi", lang: "en" },

  { label: "Buenos Aires", country: "ar", keyword: "buenos aires", lang: "es" },
  {
    label: "Funchal (Madeira)",
    country: "pt",
    keyword: "funchal madeira",
    lang: "pt",
  },
  {
    label: "Canary Island",
    country: "es",
    keyword: "canary island",
    lang: "es",
  },
  { label: "Toronto", country: "ca", keyword: "toronto", lang: "en" },
  { label: "Vancouver", country: "ca", keyword: "vancouver", lang: "en" },
  {
    label: "Casablanca Settat",
    country: "ma",
    keyword: "casablanca settat",
    lang: "ar",
  },
  { label: "Marrakech", country: "ma", keyword: "marrakech", lang: "ar" },
  { label: "Otago Region", country: "nz", keyword: "otago region", lang: "en" },
  {
    label: "Santa Catarina",
    country: "br",
    keyword: "santa catarina",
    lang: "pt",
  },
  { label: "Sao Paulo", country: "br", keyword: "sao paulo", lang: "pt" },
  {
    label: "San Jose Province",
    country: "cr",
    keyword: "san jose province",
    lang: "es",
  },
  { label: "Sydney", country: "au", keyword: "sydney", lang: "en" },
  {
    label: "Santa Cruz de Tenerife",
    country: "es",
    keyword: "santa cruz de tenerife",
    lang: "es",
  },
  { label: "Cebu City", country: "ph", keyword: "cebu city", lang: "en" },
  { label: "Chiang Mai", country: "th", keyword: "chiang mai", lang: "en" },
  { label: "Barcelona", country: "es", keyword: "barcelona", lang: "es" },
  { label: "Lima", country: "pe", keyword: "lima", lang: "es" },
  { label: "Santiago", country: "cl", keyword: "santiago", lang: "es" },
  { label: "Koh Phangan", country: "th", keyword: "koh phangan", lang: "en" },
  {
    label: "Surigao del Norte",
    country: "ph",
    keyword: "surigao del norte",
    lang: "en",
  },
  { label: "Gold Coast", country: "au", keyword: "gold coast", lang: "en" },
  { label: "Fes-Meknes", country: "ma", keyword: "fes-meknes", lang: "ar" },
  {
    label: "Giza Governorate",
    country: "eg",
    keyword: "giza governorate",
    lang: "ar",
  },
  { label: "Istanbul", country: "tr", keyword: "istanbul", lang: "tr" },
  { label: "Valencia", country: "es", keyword: "valencia", lang: "es" },
  { label: "Da Nang", country: "vn", keyword: "da nang", lang: "en" },
  { label: "Nassau", country: "bs", keyword: "nassau", lang: "en" },
  { label: "Victoria", country: "ca", keyword: "victoria", lang: "en" },
  { label: "Bogotá D.C.", country: "co", keyword: "bogota d.c.", lang: "es" },
  { label: "Medellin", country: "co", keyword: "medellin", lang: "es" },
  { label: "Quito", country: "ec", keyword: "quito", lang: "es" },
];

const stripHTML = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const selectClasses =
  "text-[0.7rem] leading-6 min-h-12 px-2.5 py-1 flex items-center justify-start font-normal";
const menuListClasses = "py-2 h-60";

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

const normalizeLabel = (label) =>
  label ? label.replace(/\+/g, " ").trim() : label;

const buildExactKeyword = (label) => {
  if (!label) return null;
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `^${escaped}$`;
};

const BlogFetch = () => {
  // const [dest, setDest] = useState(DESTS[0]);
  const [searchParams, setSearchParams] = useSearchParams();
  // const initialDest =
  //   DESTS.find((d) => d.label === searchParams.get("dest")) || DESTS[0];
  const [dest, setDest] = useState(DESTS[0]);
  const formData = useSelector((state) => state.location.formValues);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 1) Priority: URL (?dest=...)
    const urlDestLabel = normalizeLabel(searchParams.get("dest"));
    if (urlDestLabel) {
      const foundByLabel = DESTS.find(
        (d) => d.label.toLowerCase() === urlDestLabel.toLowerCase(),
      );
      if (foundByLabel) {
        setDest(foundByLabel);
        return;
      } else {
        // URL has an unknown destination -> keep original behavior (null + clear)
        setDest(null);
        setSearchParams({});
        return;
      }
    }

    // 2) Fallback: Redux (formData.location uses keyword)
    const selectedDest = normalizeLabel(formData?.location);
    if (selectedDest) {
      const foundByKeyword = DESTS.find(
        (d) => d.keyword?.toLowerCase() === selectedDest.toLowerCase(),
      );
      if (foundByKeyword) {
        setDest(foundByKeyword);
        setSearchParams({ dest: foundByKeyword.label });
        return;
      } else {
        // No matching destination -> original behavior
        setDest(null);
        setSearchParams({});
        return;
      }
    }

    // 3) No location in Redux -> default to All
    setDest(DESTS[0]);
    setSearchParams({});
  }, [formData, searchParams, setSearchParams]);

  const handleChange = (val) => {
    const selected = DESTS.find((d) => d.label === val);
    setDest(selected);
    setSearchParams({ dest: selected.label });
  };

  const params = useMemo(() => {
    if (!dest || dest.label === "All") return null;
    return {
      country: dest.country,
      keyword: buildExactKeyword(dest.label),
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
            <FormControl variant="standard" sx={{ minWidth: 140 }}>
              {/* <InputLabel>Destination</InputLabel> */}
              <Select
                className={selectClasses}
                MenuProps={{ MenuListProps: { className: menuListClasses } }}
                value={""}
                onChange={(e) => handleChange(e.target.value)}
                label="Destination"
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                {DESTS.map((d) => (
                  <MenuItem
                    key={d.label}
                    value={d.label}
                    sx={{ fontSize: "12px" }}
                  >
                    {d.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
          <FormControl variant="standard" sx={{ minWidth: 140 }}>
            {/* <InputLabel>Destination</InputLabel> */}
            <Select
              className={selectClasses}
              MenuProps={{ MenuListProps: { className: menuListClasses } }}
              value={dest.label}
              onChange={(e) => handleChange(e.target.value)}
              label="Destination"
            >
              {DESTS.map((d) => (
                <MenuItem
                  key={d.label}
                  value={d.label}
                  sx={{ fontSize: "12px" }}
                >
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
        {isPending && (
          <div className="h-screen">
            <span className="text-sm text-gray-500">Loading…</span>
          </div>
        )}
        {isError && (
          <div className="h-screen">
            <span className="text-sm text-red-600">Could not load blogs.</span>
          </div>
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
