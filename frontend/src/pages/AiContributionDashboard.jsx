import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { HiPlus } from "react-icons/hi";
import useAuth from "../hooks/useAuth";
import Seo from "../components/Seo";

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

const AiContributionDashboard = ({ type }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const config = useMemo(
    () => contributionPageConfig[type] || contributionPageConfig.blog,
    [type],
  );
  const hasAccess = Boolean(auth?.user?.[config.flag]);

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

  return (
    <>
      <Seo path={config.seoPath} />
      <main className="mx-auto w-full max-w-5xl px-1 py-2 md:px-6 lg:px-0">
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

        <div className="flex min-h-[28rem] items-center justify-center text-center">
          <p className="text-base text-gray-500">{config.emptyText}</p>
        </div>
      </main>
    </>
  );
};

export default AiContributionDashboard;
