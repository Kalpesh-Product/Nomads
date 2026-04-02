import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearStoredLoginState,
  readStoredLoginState,
} from "../hooks/useNomadLoginState";
import logo from "../assets/WONO_LOGO_Black_TP.png";
import {
  HiChevronDown,
  HiChevronUp,
  HiOutlineMenu,
  HiX,
  HiOutlineViewGrid,
  HiOutlineCog,
  HiOutlineHeart,
  HiOutlineUserCircle,
  HiOutlineKey,
  HiOutlineLogout,
} from "react-icons/hi";
import { LuCircleDollarSign, LuMapPinned } from "react-icons/lu";
import { FaGlobeAmericas } from "react-icons/fa";
import { MdOutlineWorkHistory } from "react-icons/md";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { RiUserCommunityLine } from "react-icons/ri";
import { TbAward, TbWorldWww } from "react-icons/tb";
import { IoMdPersonAdd } from "react-icons/io";

const gatedRecommendationLabels = new Set([
  "Work From Anywhere",
  "Increase Your Savings",
  "Advance Your Career",
  "Find Your Community",
]);

const recommendationItems = [
  {
    label: "World Ranking",
    description:
      "Global suggestions for the best nomad destinations based on the world index which includes 50+ global factors.",
    icon: TbAward,
    path: "/search/results",
  },
  {
    label: "Work From Anywhere",
    description:
      "Custom suggestions to help you discover and work from the best nomad destinations.",
    icon: FaGlobeAmericas,
    path: "/search/results",
  },
  {
    label: "Increase Your Savings",
    description:
      "Tailored nomad destination suggestions to help you increase your savings as a nomad.",
    icon: HiOutlineCurrencyDollar,
    path: "/search/results",
  },
  {
    label: "Advance Your Career",
    description:
      "Intelligent suggestions to help you find the most suitable nomad destinations to advance your career.",
    icon: MdOutlineWorkHistory,
    path: "/search/results",
  },
  {
    label: "Find Your Community",
    description:
      "Find like minded individuals & communities as per your preferences from nomad destinations.",
    icon: RiUserCommunityLine,
    path: "/search/results",
  },
  { label: "Search Old School", icon: TbWorldWww, path: "/manual-search" },
];
const valueAdditionItems = [
  { label: "VISA Support", icon: LuMapPinned, path: "/visa-support" },
  {
    label: "Overall Activation Support",
    icon: HiOutlineKey,
    path: "/overall-activation-support",
  },
  {
    label: "New Company Setup",
    icon: HiOutlineCog,
    path: "/new-company-setup",
  },
  { label: "Consultation", icon: LuCircleDollarSign, path: "/consultation" },
  {
    label: "Apply for Job",
    icon: HiOutlineUserCircle,
    badge: "Coming soon",
  },
];

const becomeHostItem = [{ label: "Become A Host", icon: HiOutlineViewGrid }];

const loggedOutPrompt = {
  title: "Get responses tailored to you",
  description:
    "Login to explore your nomad lifestyle and discover where you should live, work, and save more.",
  actionLabel: "Login",
};

const profileItems = [
  { label: "Abrar Shaikh", icon: HiOutlineUserCircle, active: true },
  { label: "Settings", icon: HiOutlineCog },
  { label: "Favorites", icon: HiOutlineHeart },
  { label: "Reviews", icon: LuCircleDollarSign },
  { label: "Change Password", icon: HiOutlineKey },
];

const signOutItem = [{ label: "Sign Out", icon: HiOutlineLogout }];

const becomeContributorLink = {
  label: "Become a Contributor",
  icon: IoMdPersonAdd,
  path: "/become-a-contributor",
};

const SidebarSection = ({
  title,
  items,
  collapsed,
  isExpandable = false,
  isOpen = true,
  showTopBorder = true,
  onToggle,
  onItemClick,
}) => {
  const ChevronIcon = isOpen ? HiChevronUp : HiChevronDown;

  return (
    <div className="px-4 pt-3">
      <div
        className={`${showTopBorder ? "border-t border-black/10" : ""} pt-2`}
      >
        {collapsed ? null : isExpandable ? (
          <button
            type="button"
            onClick={onToggle}
            className={`flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-black/80 transition hover:text-black ${
              isOpen ? "border-b border-black/10 pb-3" : ""
            }`}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${title}`}
          >
            <span>{title}</span>
            <ChevronIcon size={16} className="shrink-0" />
          </button>
        ) : (
          <h3 className="text-xs font-semibold uppercase tracking-wide text-black/80">
            {title}
          </h3>
        )}
        {(!isExpandable || isOpen) && (
          <div className="mt-2 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onItemClick?.(item)}
                  className={`group relative flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[22px] transition ${
                    item.active && !item.disableActiveBackground
                      ? "bg-white text-black shadow-sm"
                      : "text-black/80 hover:bg-white/70"
                  }`}
                  title={collapsed ? item.label : ""}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-xs font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-0 rounded-full border border-red-400 bg-red-200 px-1.5 py-0.45 text-[7px] font-semibold tracking-wide text-black shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {item.showActiveUnderline && (
                    <span
                      className={`absolute bottom-0 left-0 block h-[1px] bg-black transition-all duration-300 ${
                        item.active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const AiSidebar = ({ isMobileOverlay = false, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(true);
  const [isValueAdditionsOpen, setIsValueAdditionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const normalizedPath = location.pathname.replace(/\/$/, "") || "/";
    const isAiHomePage = normalizedPath === "/home";

    const isValueAddedPage = valueAdditionItems.some((item) => {
      if (!item.path) return false;

      const normalizedItemPath = item.path.replace(/\/$/, "");
      return (
        normalizedPath === normalizedItemPath ||
        normalizedPath.startsWith(`${normalizedItemPath}/`)
      );
    });

    setIsRecommendationsOpen(!isAiHomePage);
    setIsValueAdditionsOpen(isAiHomePage || isValueAddedPage);
  }, [location.pathname]);

  const searchParams = new URLSearchParams(location.search);
  const isLoggedIn =
    searchParams.get("login") === "true" || readStoredLoginState();

  const handleRecommendationClick = (item) => {
    const params = new URLSearchParams(location.search);

    if (!isLoggedIn && gatedRecommendationLabels.has(item.label)) {
      navigate(`/ai-login${location.search}`, {
        state: {
          loginContext: {
            title: item.label,
            description: item.description || "",
          },
        },
      });
      return;
    }

    navigate(
      {
        pathname: item.path || "/search/results",
        search: params.toString() ? `?${params.toString()}` : "",
      },
      {
        state:
          item.path === "/search/results"
            ? { selectedGoal: item.label }
            : undefined,
      },
    );
  };

  const handleValueAdditionClick = (item) => {
    if (!item.path) return;

    const params = new URLSearchParams(location.search);
    navigate({
      pathname: item.path,
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  const handleLogInClick = () => {
    navigate(`/ai-login${location.search}`);
  };

  const handleBecomeHostClick = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://hosts.localhost:5173";
    } else {
      window.location.href = "https://hosts.wono.co";
    }
  };

  const handleBecomeContributorClick = (item) => {
    const params = new URLSearchParams(location.search);
    navigate({
      pathname: item.path,
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  const handleSignOutClick = () => {
    const nextSearchParams = new URLSearchParams(location.search);
    nextSearchParams.delete("login");
    clearStoredLoginState();

    if (isMobileOverlay) {
      onClose?.();
      navigate("/home");
      return;
    }

    navigate({
      pathname: location.pathname,
      search: nextSearchParams.toString()
        ? `?${nextSearchParams.toString()}`
        : "",
    });
  };

  const isCollapsed = isMobileOverlay ? false : collapsed;

  const normalizedPath = location.pathname.replace(/\/$/, "") || "/";

  const valueAdditionItemsWithActivePath = valueAdditionItems.map((item) => {
    if (!item.path) return item;

    const normalizedItemPath = item.path.replace(/\/$/, "");
    const isActivePath =
      normalizedPath === normalizedItemPath ||
      normalizedPath.startsWith(`${normalizedItemPath}/`);

    return {
      ...item,
      active: isActivePath,
      showActiveUnderline: true,
      disableActiveBackground: true,
    };
  });

  const BecomeContributorButton = () => {
    const Icon = becomeContributorLink.icon;

    return (
      <div className="px-4 pt-3">
        <div className="border-t border-black/10 pt-2">
          <button
            type="button"
            onClick={() => handleBecomeContributorClick(becomeContributorLink)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-3 text-left text-[22px] text-black/80 transition hover:bg-white/70"
            title={isCollapsed ? becomeContributorLink.label : ""}
          >
            <Icon size={18} className="shrink-0" />
            {!isCollapsed && (
              <span className="text-xs font-medium">
                {becomeContributorLink.label}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`flex h-full max-h-screen flex-col overflow-y-auto overscroll-contain border-r border-black/10 bg-[#efefef] transition-all duration-300 custom-scrollbar-hide ${
        isMobileOverlay
          ? "w-[calc(100%-52px)] max-w-[320px]"
          : isCollapsed
            ? "w-[70px]"
            : "w-[260px]"
      }`}
      onClick={(event) => {
        if (isMobileOverlay) event.stopPropagation();
      }}
    >
      <div className="px-4 py-4">
        {isMobileOverlay ? (
          <div className="flex items-center justify-between gap-3">
            <div className="h-10 w-24 overflow-x-hidden rounded-lg">
              <img
                src={logo}
                alt="WONO logo"
                className="h-full w-fit object-contain"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-black/80 hover:bg-black/5"
              aria-label="Close sidebar"
            >
              <HiX size={24} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded p-1 text-black/80 hover:bg-black/5"
            aria-label="Toggle sidebar"
          >
            <HiOutlineMenu size={24} />
          </button>
        )}
      </div>

      <SidebarSection
        title="WoNo Intelligence"
        items={recommendationItems}
        collapsed={isCollapsed}
        isExpandable
        isOpen={isRecommendationsOpen}
        onToggle={() => setIsRecommendationsOpen((prev) => !prev)}
        onItemClick={handleRecommendationClick}
      />
      <SidebarSection
        title="Value Added Services"
        items={valueAdditionItemsWithActivePath}
        collapsed={isCollapsed}
        isExpandable
        isOpen={isValueAdditionsOpen}
        onToggle={() => setIsValueAdditionsOpen((prev) => !prev)}
        onItemClick={handleValueAdditionClick}
      />
      {isLoggedIn ? (
        <>
          <SidebarSection
            title="Profile"
            items={profileItems}
            collapsed={isCollapsed}
            isExpandable
            isOpen={isProfileOpen}
            onToggle={() => setIsProfileOpen((prev) => !prev)}
          />
          <BecomeContributorButton />
          <SidebarSection
            items={becomeHostItem}
            collapsed={isCollapsed}
            onItemClick={handleBecomeHostClick}
          />
          <SidebarSection
            items={signOutItem}
            collapsed={isCollapsed}
            onItemClick={handleSignOutClick}
          />
        </>
      ) : (
        <>
          <BecomeContributorButton />
          <SidebarSection
            items={becomeHostItem}
            collapsed={isCollapsed}
            onItemClick={handleBecomeHostClick}
          />
          <div className="border-t border-black/10 mt-4"></div>
          {!isCollapsed && (
            <div className="mt-auto px-4 pb-4 pt-10">
              <div className="rounded-[28px]   p-4 shadow-sm">
                {/* <h3 className="text-[13px] font-semibold leading-tight text-black/90">
                  {loggedOutPrompt.title}
                </h3> */}
                <p className="mt-2 text-nano leading-[0.9rem] text-black/55">
                  {loggedOutPrompt.description}
                </p>
                <p className=" text-nano font-semibold leading-5 text-black/55">
                  Powered by your preferences.
                </p>
                <button
                  type="button"
                  onClick={handleLogInClick}
                  className="mt-6 w-full rounded-full border border-black/10 bg-primary-blue px-3 py-2 text-base font-semibold text-white transition hover:bg-black hover:text-white"
                >
                  {loggedOutPrompt.actionLabel}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default AiSidebar;
