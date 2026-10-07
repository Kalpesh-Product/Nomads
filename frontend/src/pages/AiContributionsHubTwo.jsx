import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import {
  HiArrowRight,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineSparkles,
  HiOutlineThumbUp,
} from "react-icons/hi";
import { MdEventNote, MdOutlineNewspaper, MdOutlinePlace } from "react-icons/md";
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
    listPath: "/blog-contributions",
    addPath: "/blog-contributions/add",
    detailsPath: (item) => `/blog-contributions/${item._id || item.id}`,
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
    listPath: "/news-contributions",
    addPath: "/news-contributions/add",
    detailsPath: (item) => `/news-contributions/${item._id || item.id}`,
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
    listPath: "/event-contributions",
    addPath: "/event-contributions/add",
    detailsPath: (item) => `/event-contributions/${item._id || item.id}`,
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
    listPath: "/places-contributions",
    addPath: "/places-contributions/add",
    detailsPath: (item) => `/places-contributions/${item._id || item.id}`,
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

const sortRecent = (items) =>
  [...items].sort(
    (a, b) =>
      new Date(getItemDate(b.item) || 0).getTime() -
      new Date(getItemDate(a.item) || 0).getTime(),
  );

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Hello, good morning";
  if (hour < 17) return "Hello, good afternoon";
  return "Hello, good evening";
};

const MetricTile = ({ icon: Icon, value, label, tone }) => (
  <div className={`rounded-lg p-5 ${tone}`}>
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/85 text-primary-blue shadow-sm">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-3xl font-bold leading-none text-black">{value}</p>
        <p className="mt-1 text-sm font-medium text-black/60">{label}</p>
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
          <HiOutlineEye className="text-primary-blue" size={18} />
          {Math.max(1, index + 2)}.{index + 1}K
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HiOutlineThumbUp className="text-primary-blue" size={18} />
          {Math.max(1, index + 1)}.{index + 4}K
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-xs capitalize text-black/65">
          {item.isDraft ? "draft" : item.status || "pending"}
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
        state: { redirectTo: "/contributions-2" },
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
  const draftItems = allItems.filter(({ item }) => item.isDraft);
  const pendingItems = submittedItems.filter(
    ({ item }) => (item.status || "pending").toLowerCase() === "pending",
  );
  const recentItems = sortRecent(allItems);
  const topItems = recentItems.slice(0, 4);
  const recentListItems = recentItems.slice(0, 5);
  const isLoading = sections.some((section) => section.query?.isLoading);

  return (
    <>
      <Seo path="/contributions-2" />
      <main className="mx-auto w-full max-w-[80rem] px-4 py-2 md:px-8 lg:px-8">
        <div className="mt-6 border-t border-black/10 pt-6">
          <div className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <section className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[16rem] flex-1">
                    <HiOutlineSearch
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                      size={19}
                    />
                    <input
                      type="search"
                      placeholder="Search contributions"
                      className="h-12 w-full rounded-lg border border-black/10 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-primary-blue/40 focus:bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(sections[0]?.config.addPath || "/contributions")}
                    className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary-blue px-5 text-sm font-semibold text-white transition hover:bg-sky-500"
                  >
                    <HiOutlinePencilAlt size={18} />
                    Write new post
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-[1.5rem] bg-[#dff4ff] p-6 md:p-8">
                  <div className="absolute right-6 top-6 hidden h-28 w-28 rounded-full bg-white/45 md:block" />
                  <div className="absolute bottom-0 right-20 hidden h-20 w-44 rounded-t-full bg-sky-200/60 md:block" />
                  <div className="relative z-10 max-w-xl">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-blue">
                      <HiOutlineSparkles size={15} />
                      Contributor dashboard
                    </span>
                    <h1 className="mt-4 text-3xl font-bold text-black">
                      {getGreeting()}, {firstName}!
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-black/65">
                      Your stories, local updates, events, and places are gathered
                      here in one editorial workspace.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {sections.map(({ config }) => (
                        <button
                          key={config.key}
                          type="button"
                          onClick={() => navigate(config.addPath)}
                          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-sm transition hover:text-primary-blue"
                        >
                          + {config.singular}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-black">
                      Top contributions
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigate("/contributions")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-blue"
                    >
                      Main view
                      <HiArrowRight size={15} />
                    </button>
                  </div>

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

                <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ring-1 ring-black/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-black">
                        Recent Contributions
                      </h2>
                      <p className="mt-1 text-xs text-black/55">
                        The latest items across blogs, news, events, and places.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/contributions")}
                      className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-primary-blue transition hover:bg-sky-100"
                    >
                      View all
                      <HiArrowRight size={15} />
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="mt-5 rounded-lg border border-dotted bg-slate-50 p-8 text-center text-sm text-black/50">
                      Loading recent contributions...
                    </div>
                  ) : recentListItems.length > 0 ? (
                    <div className="mt-5 overflow-hidden rounded-lg border border-black/10">
                      {recentListItems.map(({ item, config }, index) => {
                        const Icon = config.icon;
                        const status = item.isDraft
                          ? "draft"
                          : (item.status || "pending").toLowerCase();

                        return (
                          <button
                            key={`${config.key}-recent-${item._id || item.id || index}`}
                            type="button"
                            onClick={() => navigate(config.detailsPath(item))}
                            className="flex w-full items-center gap-4 border-b border-black/10 bg-white px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.softColor}`}
                            >
                              <Icon size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-black">
                                {getTitle(item, config)}
                              </p>
                              <p className="mt-1 truncate text-xs text-black/50">
                                {config.singular} in {getDestination(item)}
                              </p>
                            </div>
                            <div className="hidden text-right sm:block">
                              <p className="text-xs font-medium text-black/50">
                                {humanDate(getItemDate(item))}
                              </p>
                              <p className="mt-1 text-xs font-semibold capitalize text-black/70">
                                {status}
                              </p>
                            </div>
                            <HiArrowRight
                              className="shrink-0 text-black/35"
                              size={18}
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-lg border border-dotted bg-slate-50 p-8 text-center text-sm text-black/50">
                      No recent contributions yet.
                    </div>
                  )}
                </div>
              </section>

              <aside className="space-y-4">
                <MetricTile
                  icon={HiOutlineCurrencyDollar}
                  value={submittedItems.length}
                  label="Submitted"
                  tone="bg-sky-100"
                />
                <MetricTile
                  icon={HiOutlinePencilAlt}
                  value={draftItems.length}
                  label="Saved drafts"
                  tone="bg-indigo-100"
                />
                <MetricTile
                  icon={HiOutlineClock}
                  value={pendingItems.length}
                  label="Pending review"
                  tone="bg-cyan-100"
                />

                <div className="rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-black">Quick Links</h2>
                  <p className="mt-1 text-xs text-black/50">
                    Jump directly into each contribution workspace.
                  </p>
                  <div className="mt-4 space-y-2">
                    {sections.map(({ config }) => {
                      const Icon = config.icon;

                      return (
                        <button
                          key={config.key}
                          type="button"
                          onClick={() => navigate(config.listPath)}
                          className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-black transition hover:border-primary-blue/30 hover:bg-sky-50 hover:text-primary-blue"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Icon size={18} />
                            View {config.label}
                          </span>
                          <HiArrowRight size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AiContributionsHubTwo;
