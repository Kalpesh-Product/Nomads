import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaCheck } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";
import { HiOutlineChevronDown } from "react-icons/hi2";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Seo from "../components/Seo";
import humanDate from "../utils/humanDate";

const contributionPageConfig = {
  blog: {
    label: "Blog Contributions",
    heading: "My Blog Contributions",
    addLabel: "Add Blog",
    emptyText: "You haven't added any blogs yet.",
    flag: "isBlogger",
    seoPath: "/blog-contributions",
  },
  news: {
    label: "News Contributions",
    heading: "My News Contributions",
    addLabel: "Add News",
    emptyText: "You haven't added any news yet.",
    flag: "isNewsWriter",
    seoPath: "/news-contributions",
  },
  event: {
    label: "Event Contributions",
    heading: "My Event Contributions",
    addLabel: "Add Event",
    emptyText: "You haven't added any events yet.",
    flag: "isEventWriter",
    seoPath: "/event-contributions",
  },
  places: {
    label: "Places Contributions",
    heading: "My Places Contributions",
    addLabel: "Add Place",
    emptyText: "You haven't added any places yet.",
    flag: "isPlaceWriter",
    seoPath: "/places-contributions",
  },
};

const statusOptions = [
  { label: "Show All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const statusBadgeStyles = {
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const fallbackImage =
  "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp";

const BlogStatusFilter = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);
  const selectedLabel =
    statusOptions.find((option) => option.value === value)?.label || "Show All";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="flex items-start gap-3">
      <span className="mt-3 whitespace-nowrap font-play text-sm text-black/80">
        Status Options
      </span>
      <div ref={filterRef} className="relative w-48">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-full border border-sky-500 bg-sky-500 px-4 py-2 text-sm font-medium text-white"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{selectedLabel}</span>
          <HiOutlineChevronDown
            size={18}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen ? (
          <div className="absolute right-0 top-full z-40 mt-3 w-full rounded-2xl border border-sky-100 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
            <ul role="listbox" aria-label="Blog status filter">
              {statusOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`group flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-sky-50 font-medium text-sky-600"
                          : "text-black/80 hover:bg-slate-50"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="mr-2 inline-flex w-4 shrink-0 items-center justify-center">
                        <FaCheck
                          size={13}
                          className={`text-primary-blue transition-opacity ${
                            isSelected
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        />
                      </span>
                      <span>{option.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const BlogContributionCard = ({ blog }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const status = (blog.status || "pending").toLowerCase();

  return (
    <article className="w-full max-w-[164px]">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={blog.mainImage || fallbackImage}
          alt={blog.mainTitle}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          onClick={() =>
            navigate("/blog/blog-details", {
              state: {
                content: blog,
                selectedStateLabel: blog.destination,
                sourceSearch: location.search,
              },
            })
          }
          className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/55 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-black/70"
        >
          View Blog Content
        </button>
        {!blog.isDraft ? (
          <div className="absolute bottom-2 right-2">
            <span
              className={`rounded-full border px-2 py-1 text-[10px] font-semibold capitalize ${
                statusBadgeStyles[status] || statusBadgeStyles.pending
              }`}
            >
              {status}
            </span>
          </div>
        ) : null}
      </div>

      <h3 className="mt-2 line-clamp-2 text-xs font-semibold text-black">
        {blog.mainTitle || "Untitled Blog"}
      </h3>
      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-600">
        <span className="truncate">{blog.destination || "Destination"}</span>
        <time className="shrink-0" dateTime={blog.date || blog.updatedAt}>
          {humanDate(blog.date || blog.updatedAt)}
        </time>
      </div>
    </article>
  );
};

const AiContributionDashboard = ({ type }) => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const userId = auth?.user?._id || auth?.user?.id;
  const [statusFilter, setStatusFilter] = useState("all");
  const config = useMemo(
    () => contributionPageConfig[type] || contributionPageConfig.blog,
    [type],
  );
  const hasAccess = Boolean(auth?.user?.[config.flag]);

  const {
    data: blogContributions = [],
    isLoading: isBlogsLoading,
    isError: isBlogsError,
  } = useQuery({
    queryKey: ["myBlogContributions", userId],
    queryFn: async () => {
      const response = await axiosPrivate.get("/blogs/my");
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: type === "blog" && Boolean(userId) && hasAccess,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (!auth?.user) {
      navigate("/login", {
        replace: true,
        state: {
          redirectTo: config.seoPath,
        },
      });
      return;
    }

    if (!hasAccess) {
      navigate("/profile", { replace: true });
    }
  }, [auth?.user, config.seoPath, hasAccess, navigate]);

  if (!auth?.user || !hasAccess) {
    return null;
  }

  const submittedBlogs = blogContributions.filter((blog) => !blog.isDraft);
  const filteredSubmittedBlogs =
    statusFilter === "all"
      ? submittedBlogs
      : submittedBlogs.filter(
          (blog) => (blog.status || "pending").toLowerCase() === statusFilter,
        );
  const draftBlogs = blogContributions.filter((blog) => blog.isDraft);
  const isBlogPage = type === "blog";
  const shouldShowStatusFilter = submittedBlogs.length > 0;

  return (
    <>
      <Seo path={config.seoPath} />
      <main className="mx-auto w-full max-w-[70rem] px-1 py-2 md:px-6 lg:px-0">
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/10 pt-6">
          <h1 className="text-lg font-semibold text-black">{config.heading}</h1>
          <button
            type="button"
            onClick={() => navigate(`${config.seoPath}/add`)}
            className="inline-flex items-center gap-1 rounded-full bg-primary-blue px-6 py-3 text-sm font-semibold uppercase text-white transition hover:bg-sky-500"
          >
            <HiPlus size={18} />
            {config.addLabel}
          </button>
        </div>

        {isBlogPage ? (
          <div className="mt-8 min-h-[28rem]">
            {isBlogsLoading ? (
              <p className="text-center text-sm text-slate-500">Loading...</p>
            ) : isBlogsError ? (
              <p className="text-center text-sm text-red-500">
                Could not load your blog contributions.
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <h2 className="text-base font-semibold text-black">
                    Published Blogs
                  </h2>
                  {shouldShowStatusFilter ? (
                    <BlogStatusFilter
                      value={statusFilter}
                      onChange={setStatusFilter}
                    />
                  ) : null}
                </div>

                {filteredSubmittedBlogs.length > 0 ? (
                  <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                    {filteredSubmittedBlogs.map((blog) => (
                      <BlogContributionCard key={blog._id} blog={blog} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg border border-dotted p-6 text-center text-sm text-gray-500">
                    {statusFilter === "all"
                      ? config.emptyText
                      : `No ${statusFilter} blogs found.`}
                  </div>
                )}

                <section className="mt-10">
                  <h2 className="text-base font-semibold text-black">
                    Saved As Drafts
                  </h2>
                  {draftBlogs.length > 0 ? (
                    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                      {draftBlogs.map((blog) => (
                        <BlogContributionCard key={blog._id} blog={blog} />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-lg border border-dotted p-6 text-center text-sm text-gray-500">
                      You don't have any saved drafts yet.
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        ) : (
          <div className="flex min-h-[28rem] items-center justify-center text-center">
            <p className="text-base text-gray-500">{config.emptyText}</p>
          </div>
        )}
      </main>
    </>
  );
};

export default AiContributionDashboard;
