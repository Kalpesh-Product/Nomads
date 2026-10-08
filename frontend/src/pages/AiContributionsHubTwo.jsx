import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import {
  HiArrowRight,
  HiHeart,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineSparkles,
} from "react-icons/hi";
import {
  MdEventNote,
  MdMilitaryTech,
  MdOutlineNewspaper,
  MdOutlinePlace,
  MdRateReview,
} from "react-icons/md";
import { TbNotebook } from "react-icons/tb";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Seo from "../components/Seo";
import humanDate from "../utils/humanDate";

const contributionTypes = [
  {
    key: "blog",
    label: "Blogs",
    singular: "Blog",
    endpoint: "/blogs/my",
    queryKey: "myBlogContributions",
    flag: "isBlogger",
    listPath: "/contributions/blog",
    addPath: "/contributions/blog/add",
    detailsPath: (item) => `/contributions/blog/${item._id || item.id}`,
    icon: TbNotebook,
    color: "bg-sky-500",
    softColor: "bg-sky-50 text-sky-700",
    titleFields: ["mainTitle", "title"],
    imageFields: ["mainImage", "image"],
  },
  {
    key: "news",
    label: "News",
    singular: "News",
    endpoint: "/news/my",
    queryKey: "myNewsContributions",
    flag: "isNewsWriter",
    listPath: "/contributions/news",
    addPath: "/contributions/news/add",
    detailsPath: (item) => `/contributions/news/${item._id || item.id}`,
    icon: MdOutlineNewspaper,
    color: "bg-blue-600",
    softColor: "bg-blue-50 text-blue-700",
    titleFields: ["mainTitle", "title"],
    imageFields: ["mainImage", "image"],
  },
  {
    key: "event",
    label: "Events",
    singular: "Event",
    endpoint: "/events/my",
    queryKey: "myEventContributions",
    flag: "isEventWriter",
    listPath: "/contributions/event",
    addPath: "/contributions/event/add",
    detailsPath: (item) => `/contributions/event/${item._id || item.id}`,
    icon: MdEventNote,
    color: "bg-emerald-500",
    softColor: "bg-emerald-50 text-emerald-700",
    titleFields: ["eventName", "mainTitle", "title"],
    imageFields: ["mainImage", "image"],
  },
  {
    key: "places",
    label: "Places",
    singular: "Place",
    endpoint: "/places/my",
    queryKey: "myPlaceContributions",
    flag: "isPlaceWriter",
    listPath: "/contributions/places",
    addPath: "/contributions/places/add",
    detailsPath: (item) => `/contributions/places/${item._id || item.id}`,
    icon: MdOutlinePlace,
    color: "bg-cyan-500",
    softColor: "bg-cyan-50 text-cyan-700",
    titleFields: ["placeName", "mainTitle", "title"],
    imageFields: ["mainImage", "image"],
  },
];

const fallbackImage =
  "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp";

const getFirstValue = (item, fields) => {
  for (const field of fields) {
    const value = item?.[field];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
};

const getTitle = (item, config) =>
  getFirstValue(item, config.titleFields) || `Untitled ${config.singular}`;

const getImage = (item, config) =>
  getFirstValue(item, config.imageFields) || fallbackImage;

const getDestination = (item) =>
  item?.destination || item?.location || item?.region || "Destination";

const getItemDate = (item) => item?.date || item?.updatedAt || item?.createdAt;

const getLikeCount = (item, fallback) => {
  const value =
    item?.likesCount ?? item?.likeCount ?? item?.totalLikes ?? item?.likes;

  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }

  return fallback;
};

const sortRecent = (items) =>
  [...items].sort(
    (a, b) =>
      new Date(getItemDate(b.item) || 0).getTime() -
      new Date(getItemDate(a.item) || 0).getTime(),
  );

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const StatPill = ({ label, value, tone, icon: Icon }) => (
  <div className="rounded-[1.25rem] border border-black/10 bg-white p-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-black/45">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold text-black">{value}</p>
      </div>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full ${tone}`}
      >
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const TopContributionRow = ({ entry, index }) => {
  const navigate = useNavigate();
  const { item, config } = entry;
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => navigate(config.detailsPath(item))}
      className="grid w-full grid-cols-[2.25rem_4.75rem_minmax(0,1fr)_auto] items-center gap-4 rounded-lg px-3 py-3 text-left transition hover:bg-white"
    >
      <span className="text-lg font-semibold text-black/25">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
        <img
          src={getImage(item, config)}
          alt={getTitle(item, config)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span
          className={`absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full ${config.color} text-white`}
        >
          <Icon size={14} />
        </span>
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-semibold leading-5 text-black">
          {getTitle(item, config)}
        </p>
        <p className="mt-1 text-xs font-medium text-black/45">
          {getDestination(item)} • {humanDate(getItemDate(item))}
        </p>
      </div>
      <div className="hidden items-center gap-5 text-sm font-semibold text-black/75 md:flex">
        <span className="inline-flex items-center gap-1.5">
          <HiHeart className="text-rose-500" size={18} />
          {getLikeCount(item, `${Math.max(1, index + 2)}.${index + 1}K`)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MdRateReview className="text-primary-blue" size={18} />
          {Math.max(1, index + 1)}.{index + 4}K
        </span>
      </div>
    </button>
  );
};

const AiContributionsHubTwo = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const userId = auth?.user?._id || auth?.user?.id;
  const firstName = auth?.user?.fullName?.split(" ")?.[0] || "there";

  const accessibleTypes = useMemo(
    () => contributionTypes.filter((config) => Boolean(auth?.user?.[config.flag])),
    [auth?.user],
  );

  const contributionQueries = useQueries({
    queries: contributionTypes.map((config) => ({
      queryKey: [`${config.queryKey}DemoTwo`, userId],
      queryFn: async () => {
        const response = await axiosPrivate.get(config.endpoint);
        return Array.isArray(response.data?.data) ? response.data.data : [];
      },
      enabled: Boolean(userId) && Boolean(auth?.user?.[config.flag]),
      staleTime: 1000 * 60,
    })),
  });

  useEffect(() => {
    if (!auth?.user) {
      navigate("/login", {
        replace: true,
        state: { redirectTo: "/contributions" },
      });
      return;
    }

    if (accessibleTypes.length === 0) {
      navigate("/profile", { replace: true });
    }
  }, [accessibleTypes.length, auth?.user, navigate]);

  const sections = useMemo(
    () =>
      contributionTypes
        .map((config, index) => ({
          config,
          query: contributionQueries[index],
          items: Array.isArray(contributionQueries[index]?.data)
            ? contributionQueries[index].data
            : [],
          hasAccess: Boolean(auth?.user?.[config.flag]),
        }))
        .filter((section) => section.hasAccess),
    [auth?.user, contributionQueries],
  );

  if (!auth?.user || accessibleTypes.length === 0) {
    return null;
  }

  const allItems = sections.flatMap((section) =>
    section.items.map((item) => ({ item, config: section.config })),
  );
  const submittedItems = allItems.filter(({ item }) => !item.isDraft);
  const pendingItems = submittedItems.filter(
    ({ item }) => (item.status || "pending").toLowerCase() === "pending",
  );
  const approvedItems = submittedItems.filter(
    ({ item }) => (item.status || "pending").toLowerCase() === "approved",
  );
  const draftItems = allItems.filter(({ item }) => item.isDraft);
  const rankScore =
    approvedItems.length * 4 + pendingItems.length * 2 + draftItems.length;
  const communityRank = Math.max(7, 72 - rankScore * 5);
  const recentItems = sortRecent(allItems);
  const topItems = recentItems.slice(0, 4);
  const recentListItems = recentItems.slice(0, 5);
  const isLoading = sections.some((section) => section.query?.isLoading);

  return (
    <>
      <Seo path="/contributions" />
      <main className="mx-auto w-full max-w-[80rem] px-4 py-2 md:px-8 lg:px-8">
        <div className="mt-6">
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-sky-100 bg-gradient-to-br from-white via-[#f8fdff] to-[#eef9ff] p-6">
              <div className="absolute -right-12 -top-14 h-48 w-48 rounded-full bg-sky-100/70" />
              <div className="absolute right-40 bottom-0 h-24 w-24 rounded-t-full bg-cyan-100/55" />
              <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_9rem]">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-blue ring-1 ring-sky-100">
                    <HiOutlineSparkles size={15} />
                    Contributor Studio
                  </span>
                  <h1 className="mt-4 text-2xl font-bold text-black md:text-3xl">
                    {getGreeting()}, {firstName}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65">
                    You are currently ranked{" "}
                    <span className="font-bold text-black">#{communityRank}</span>{" "}
                    in the contributor community. Keep publishing approved
                    stories and moving drafts into review to climb the
                    leaderboard.
                  </p>
                  <div className="mt-6 flex flex-nowrap gap-3">
                    {sections.map(({ config }) => (
                      <button
                        key={config.key}
                        type="button"
                        onClick={() => navigate(config.addPath)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary-blue px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-500"
                      >
                        <HiOutlinePlus size={16} />
                        Add {config.singular}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-[1.5rem] border border-white/80 bg-white/90 text-center backdrop-blur">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-blue text-white shadow-[0_12px_26px_rgba(73,159,222,0.24)]">
                    <MdMilitaryTech size={20} />
                  </span>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-black/40">
                    Community Rank
                  </p>
                  <p className="mt-1 text-2xl font-bold leading-none text-black">
                    #{communityRank}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <StatPill
                label="Total Contributions"
                value={allItems.length}
                tone="bg-sky-50 text-primary-blue"
                icon={HiOutlineDocumentText}
              />
              <StatPill
                label="Pending Review"
                value={pendingItems.length}
                tone="bg-yellow-50 text-yellow-700"
                icon={HiOutlineClock}
              />
            </div>
          </section>

          <section className="mt-6">
            <div>
              <div>
                <h2 className="text-xl font-bold text-black">Quick Links</h2>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {sections.map(({ config, items }) => {
                const Icon = config.icon;
                const liveCount = items.filter(
                  (item) =>
                    !item.isDraft &&
                    (item.status || "pending").toLowerCase() === "approved",
                ).length;
                const pendingCount = items.filter(
                  (item) =>
                    !item.isDraft &&
                    (item.status || "pending").toLowerCase() === "pending",
                ).length;
                const draftCount = items.filter((item) => item.isDraft).length;

                return (
                  <div
                    key={config.key}
                    className="overflow-hidden rounded-xl border border-black/10 bg-white/90 transition hover:-translate-y-0.5 hover:border-primary-blue/30"
                  >
                    <div className={`h-1 ${config.color}`} />
                    <div className="p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.softColor}`}
                          >
                            <Icon size={18} />
                          </span>
                          <p className="truncate text-sm font-bold text-black">
                            {config.label}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-slate-50 px-2 py-2">
                          <p className="text-sm font-bold text-black">
                            {liveCount}
                          </p>
                          <p className="text-[10px] font-medium text-black/45">
                            live
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-2 py-2">
                          <p className="text-sm font-bold text-black">
                            {pendingCount}
                          </p>
                          <p className="text-[10px] font-medium text-black/45">
                            pending
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-2 py-2">
                          <p className="text-sm font-bold text-black">
                            {draftCount}
                          </p>
                          <p className="text-[10px] font-medium text-black/45">
                            drafts
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 rounded-full bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/contributions/${config.key}`)
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-black transition hover:text-primary-blue"
                        >
                          View
                          <HiArrowRight size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(config.addPath)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary-blue px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-500"
                        >
                          Add
                          <HiOutlinePlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-2">
                <div className="rounded-[1.5rem] border border-cyan-100 bg-gradient-to-br from-[#ecfbff] via-white to-[#f3f8ff] p-5">
                  <h2 className="text-xl font-bold text-black">
                    Top contributions
                  </h2>

                  {isLoading ? (
                    <div className="mt-5 rounded-lg border border-dotted bg-white p-8 text-center text-sm text-black/50">
                      Loading contributions...
                    </div>
                  ) : topItems.length > 0 ? (
                    <div className="mt-5 space-y-1">
                      {topItems.map((entry, index) => (
                        <TopContributionRow
                          key={`${entry.config.key}-${entry.item._id || entry.item.id || index}`}
                          entry={entry}
                          index={index}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-lg border border-dotted bg-white p-8 text-center text-sm text-black/50">
                      Add your first contribution to start building this list.
                    </div>
                  )}
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-5">
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      Recent Contributions
                    </h2>
                    <p className="mt-1 text-xs text-black/55">
                      The latest items across blogs, news, events, and places.
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="mt-5 rounded-lg border border-dotted bg-white p-8 text-center text-sm text-black/50">
                      Loading recent contributions...
                    </div>
                  ) : recentListItems.length > 0 ? (
                    <div className="mt-5">
                      <div className="hidden grid-cols-[4.75rem_minmax(0,1fr)_6rem_5.75rem_5rem] items-center gap-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black/35 md:grid">
                        <span>Image</span>
                        <span>Title</span>
                        <span className="justify-self-center whitespace-nowrap">
                          Last Updated
                        </span>
                        <span className="justify-self-center">Status</span>
                        <span className="justify-self-center">Category</span>
                      </div>
                      <div className="hidden border-t border-black/10 md:block" />
                      <div className="mt-2 space-y-1">
                      {recentListItems.map(({ item, config }, index) => {
                        const Icon = config.icon;
                        const status = item.isDraft
                          ? "draft"
                          : (item.status || "pending").toLowerCase();
                        const statusClass =
                          status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : status === "rejected"
                              ? "bg-rose-50 text-rose-700"
                              : status === "draft"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-amber-50 text-amber-700";

                        return (
                          <button
                            key={`${config.key}-recent-${item._id || item.id || index}`}
                            type="button"
                            onClick={() => navigate(config.detailsPath(item))}
                            className="grid w-full grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-4 rounded-lg px-3 py-3 text-left transition hover:bg-white md:grid-cols-[4.75rem_minmax(0,1fr)_6rem_5.75rem_5rem]"
                          >
                            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                              <img
                                src={getImage(item, config)}
                                alt={getTitle(item, config)}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                              <span
                                className={`absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full ${config.color} text-white`}
                              >
                                <Icon size={14} />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-semibold leading-5 text-black">
                                {getTitle(item, config)}
                              </p>
                              <p className="mt-1 truncate text-xs text-black/50">
                                {config.singular} in {getDestination(item)}
                              </p>
                            </div>
                            <span className="hidden justify-self-center whitespace-nowrap text-xs font-medium text-black/50 md:block">
                              {humanDate(getItemDate(item))}
                            </span>
                            <span
                              className={`hidden w-fit justify-self-center rounded-full px-3 py-1 text-xs capitalize md:inline-flex ${statusClass}`}
                            >
                              {status}
                            </span>
                            <span className="hidden w-fit justify-self-center rounded-full bg-white px-3 py-1 text-xs text-black/65 md:inline-flex">
                              {config.label}
                            </span>
                          </button>
                        );
                      })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-lg border border-dotted bg-slate-50 p-8 text-center text-sm text-black/50">
                      No recent contributions yet.
                    </div>
                  )}
                </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AiContributionsHubTwo;
