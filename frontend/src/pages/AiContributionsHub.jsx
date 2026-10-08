import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import {
  HiArrowRight,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlinePlus,
  HiOutlineSparkles,
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
    description: "Long-form guides, destination stories, and nomad insights.",
    endpoint: "/blogs/my",
    queryKey: "myBlogContributions",
    flag: "isBlogger",
    listPath: "/blog-contributions",
    addPath: "/blog-contributions/add",
    detailsPath: (item) => `/blog-contributions/${item._id || item.id}`,
    emptyText: "No blog contributions yet.",
    color: "from-sky-500 to-cyan-400",
    softColor: "bg-sky-50 text-sky-700",
    icon: TbNotebook,
    titleFields: ["mainTitle", "title"],
    imageFields: ["mainImage", "image"],
  },
  {
    key: "news",
    label: "News",
    singular: "News",
    description: "Local updates and timely information for every destination.",
    endpoint: "/news/my",
    queryKey: "myNewsContributions",
    flag: "isNewsWriter",
    listPath: "/news-contributions",
    addPath: "/news-contributions/add",
    detailsPath: (item) => `/news-contributions/${item._id || item.id}`,
    emptyText: "No news contributions yet.",
    color: "from-indigo-500 to-blue-400",
    softColor: "bg-indigo-50 text-indigo-700",
    icon: MdOutlineNewspaper,
    titleFields: ["mainTitle", "title"],
    imageFields: ["mainImage", "image"],
  },
  {
    key: "event",
    label: "Events",
    singular: "Event",
    description: "Festivals, meetups, workshops, and things to experience.",
    endpoint: "/events/my",
    queryKey: "myEventContributions",
    flag: "isEventWriter",
    listPath: "/event-contributions",
    addPath: "/event-contributions/add",
    detailsPath: (item) => `/event-contributions/${item._id || item.id}`,
    emptyText: "No event contributions yet.",
    color: "from-emerald-500 to-teal-400",
    softColor: "bg-emerald-50 text-emerald-700",
    icon: MdEventNote,
    titleFields: ["eventName", "mainTitle", "title"],
    imageFields: ["mainImage", "image"],
  },
  {
    key: "places",
    label: "Places",
    singular: "Place",
    description: "Useful places, local favorites, and destination essentials.",
    endpoint: "/places/my",
    queryKey: "myPlaceContributions",
    flag: "isPlaceWriter",
    listPath: "/places-contributions",
    addPath: "/places-contributions/add",
    detailsPath: (item) => `/places-contributions/${item._id || item.id}`,
    emptyText: "No place contributions yet.",
    color: "from-amber-500 to-orange-400",
    softColor: "bg-amber-50 text-amber-700",
    icon: MdOutlinePlace,
    titleFields: ["placeName", "mainTitle", "title"],
    imageFields: ["mainImage", "image"],
  },
];

const statusStyles = {
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const fallbackImage =
  "https://biznest.co.in/assets/img/projects/subscription/Managed%20Workspace.webp";

const readFirstValue = (item, fields) => {
  for (const field of fields) {
    const value = item?.[field];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
};

const getTitle = (item, config) =>
  readFirstValue(item, config.titleFields) || `Untitled ${config.singular}`;

const getImage = (item, config) =>
  readFirstValue(item, config.imageFields) || fallbackImage;

const getDestination = (item) =>
  item?.destination || item?.location || item?.region || "Destination";

const getItemDate = (item) => item?.date || item?.updatedAt || item?.createdAt;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const sortByRecent = (items) =>
  [...items].sort(
    (a, b) =>
      new Date(getItemDate(b.item) || 0).getTime() -
      new Date(getItemDate(a.item) || 0).getTime(),
  );

const ContributionMiniCard = ({ item, config }) => {
  const navigate = useNavigate();
  const status = (item.status || "pending").toLowerCase();
  const title = getTitle(item, config);
  const image = getImage(item, config);

  return (
    <article className="group overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.10)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {!item.isDraft ? (
          <span
            className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${
              statusStyles[status] || statusStyles.pending
            }`}
          >
            {status}
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600">
            draft
          </span>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-black">
            {title}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs font-medium text-black/55">
            <span className="truncate">{getDestination(item)}</span>
            <span className="shrink-0">{humanDate(getItemDate(item))}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(config.detailsPath(item))}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-slate-50 px-4 py-2 text-xs font-semibold text-black transition hover:border-primary-blue/30 hover:bg-sky-50 hover:text-primary-blue"
        >
          <HiOutlineEye size={16} />
          View
        </button>
      </div>
    </article>
  );
};

const StatPill = ({ label, value, tone, icon: Icon }) => (
  <div className="rounded-lg border border-black/10 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
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

const AiContributionsHub = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const userId = auth?.user?._id || auth?.user?.id;
  const userName = auth?.user?.fullName?.split(" ")?.[0] || "there";

  const accessibleTypes = useMemo(
    () => contributionTypes.filter((config) => Boolean(auth?.user?.[config.flag])),
    [auth?.user],
  );

  const contributionQueries = useQueries({
    queries: contributionTypes.map((config) => ({
      queryKey: [config.queryKey, userId],
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
  const approvedItems = submittedItems.filter(
    ({ item }) => (item.status || "pending").toLowerCase() === "approved",
  );
  const recentItems = sortByRecent(allItems).slice(0, 5);
  const spotlightItems = sortByRecent(submittedItems).slice(0, 4);
  const isLoading = sections.some((section) => section.query?.isLoading);
  const hasError = sections.some((section) => section.query?.isError);

  return (
    <>
      <Seo path="/contributions-2" />
      <main className="mx-auto w-full max-w-[80rem] px-4 py-2 md:px-8 lg:px-8">
        <div className="mt-6 border-t border-black/10 pt-6">
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
            <div className="relative overflow-hidden rounded-lg border border-sky-100 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.07)]">
              <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-sky-100/70" />
              <div className="relative z-10 max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-primary-blue">
                  <HiOutlineSparkles size={15} />
                  Contributor Studio
                </span>
                <h1 className="mt-4 text-2xl font-bold text-black md:text-3xl">
                  {getGreeting()}, {userName}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65">
                  Manage your blogs, news, events, and places from one command
                  center. Add new stories, continue drafts, and keep an eye on
                  review status without jumping around the sidebar.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {sections.map(({ config }) => (
                    <button
                      key={config.key}
                      type="button"
                      onClick={() => navigate(config.addPath)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary-blue px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-500"
                    >
                      <HiOutlinePlus size={16} />
                      Add {config.singular}
                    </button>
                  ))}
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

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sections.map(({ config, items }) => {
              const Icon = config.icon;
              const submittedCount = items.filter((item) => !item.isDraft).length;
              const draftCount = items.filter((item) => item.isDraft).length;
              const pendingCount = items.filter(
                (item) =>
                  !item.isDraft &&
                  (item.status || "pending").toLowerCase() === "pending",
              ).length;

              return (
                <article
                  key={config.key}
                  className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)]"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${config.color}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
                          {config.label}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-black">
                          {items.length}
                        </p>
                      </div>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full ${config.softColor}`}
                      >
                        <Icon size={22} />
                      </div>
                    </div>
                    <p className="mt-4 min-h-[2.5rem] text-xs leading-5 text-black/55">
                      {config.description}
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-slate-50 px-2 py-2">
                        <p className="text-sm font-bold text-black">
                          {submittedCount}
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
                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(config.listPath)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black transition hover:border-primary-blue/30 hover:text-primary-blue"
                      >
                        View
                        <HiArrowRight size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(config.addPath)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-blue px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-500"
                      >
                        Add
                        <HiOutlinePlus size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-black">
                    Recent Contributions
                  </h2>
                  <p className="mt-1 text-xs text-black/55">
                    The latest items across all contribution types.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sections.map(({ config }) => (
                    <button
                      key={config.key}
                      type="button"
                      onClick={() => navigate(config.listPath)}
                      className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-black/70 transition hover:border-primary-blue/30 hover:bg-sky-50 hover:text-primary-blue"
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="mt-8 rounded-lg border border-dotted p-8 text-center text-sm text-black/50">
                  Loading your contribution studio...
                </div>
              ) : hasError ? (
                <div className="mt-8 rounded-lg border border-dotted border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">
                  Could not load every contribution feed right now.
                </div>
              ) : recentItems.length > 0 ? (
                <div className="mt-5 overflow-hidden rounded-lg border border-black/10">
                  {recentItems.map(({ item, config }, index) => {
                    const Icon = config.icon;
                    const status = item.isDraft
                      ? "draft"
                      : (item.status || "pending").toLowerCase();

                    return (
                      <button
                        key={`${config.key}-${item._id || item.id || index}`}
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
                        <HiArrowRight className="shrink-0 text-black/35" size={18} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 rounded-lg border border-dotted p-8 text-center text-sm text-black/50">
                  Your contribution workspace is ready. Add your first item to
                  start filling it up.
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-lg border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
                <h2 className="text-lg font-semibold text-black">Quick Actions</h2>
                <div className="mt-4 space-y-2">
                  {sections.map(({ config }) => (
                    <button
                      key={config.key}
                      type="button"
                      onClick={() => navigate(config.addPath)}
                      className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-black transition hover:border-primary-blue/30 hover:bg-sky-50 hover:text-primary-blue"
                    >
                      <span className="inline-flex items-center gap-2">
                        <HiOutlinePencilAlt size={17} />
                        Write {config.singular}
                      </span>
                      <HiArrowRight size={16} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-black/10 bg-[#f9fbff] p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
                <h2 className="text-lg font-semibold text-black">Review Snapshot</h2>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/60">Approved</span>
                    <span className="font-bold text-emerald-600">
                      {approvedItems.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/60">Waiting for review</span>
                    <span className="font-bold text-yellow-700">
                      {pendingItems.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/60">Saved drafts</span>
                    <span className="font-bold text-slate-700">
                      {draftItems.length}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section className="mt-6 rounded-lg border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Contribution Cards
                </h2>
                <p className="mt-1 text-xs text-black/55">
                  Jump into the newest submitted content without opening each
                  individual section.
                </p>
              </div>
            </div>

            {spotlightItems.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {spotlightItems.map(({ item, config }) => (
                  <ContributionMiniCard
                    key={`${config.key}-${item._id || item.id}`}
                    item={item}
                    config={config}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dotted p-8 text-center text-sm text-black/50">
                No submitted contributions yet.
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default AiContributionsHub;
