import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearStoredLoginState,
  readStoredLoginState,
} from "../hooks/useNomadLoginState";
import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
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
  HiOutlineLogin,
} from "react-icons/hi";
import { LuCircleDollarSign, LuMapPinned } from "react-icons/lu";
import { FaGlobeAmericas, FaHandsHelping } from "react-icons/fa";
import { MdOutlineWorkHistory } from "react-icons/md";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { RiUserCommunityLine } from "react-icons/ri";
import { TbAward, TbWorldWww } from "react-icons/tb";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdComputer } from "react-icons/md";
import { IoBriefcaseSharp } from "react-icons/io5";
import { MdRateReview } from "react-icons/md";

const gatedRecommendationLabels = new Set([
  "Work From Anywhere",
  "Increase Your Savings",
  "Advance Your Career",
  "Find Your Community",
]);

const goalSlugByLabel = {
  "World Ranking": "worldranking",
  "Work From Anywhere": "workfromanywhere",
  "Increase Your Savings": "increaseyoursavings",
  "Advance Your Career": "advanceyourcareer",
  "Find Your Community": "findyourcommunity",
};

const getSearchPathForGoal = (goalLabel) => {
  const goalSlug = goalSlugByLabel[goalLabel];
  return goalSlug ? `/search/${goalSlug}/results` : "/search/results";
};

const recommendationItems = [
  {
    label: "World Ranking",
    description:
      "Global suggestions for the best nomad destinations based on the world index which includes 50+ global factors.",
    icon: TbAward,
    path: getSearchPathForGoal("World Ranking"),
  },
  {
    label: "Work From Anywhere",
    description:
      "Custom suggestions to help you discover and work from the best nomad destinations.",
    icon: FaGlobeAmericas,
    path: getSearchPathForGoal("Work From Anywhere"),
  },
  {
    label: "Increase Your Savings",
    description:
      "Tailored nomad destination suggestions to help you increase your savings as a nomad.",
    icon: HiOutlineCurrencyDollar,
    path: getSearchPathForGoal("Increase Your Savings"),
  },
  {
    label: "Advance Your Career",
    description:
      "Intelligent suggestions to help you find the most suitable nomad destinations to advance your career.",
    icon: MdOutlineWorkHistory,
    path: getSearchPathForGoal("Advance Your Career"),
  },
  {
    label: "Find Your Community",
    description:
      "Find like minded individuals & communities as per your preferences from nomad destinations.",
    icon: RiUserCommunityLine,
    path: getSearchPathForGoal("Find Your Community"),
  },
  { label: "Classic Search", icon: TbWorldWww, path: "/manual-search" },
];

const valueAdditionItems = [
  { label: "VISA Support", icon: LuMapPinned, path: "/visa-support" },
  {
    label: "Activation Support",
    icon: HiOutlineKey,
    path: "/overall-activation-support",
  },
  {
    label: "Company Setup",
    icon: HiOutlineCog,
    path: "/new-company-setup",
  },
  { label: "Consultation", icon: HiOutlineUserGroup, path: "/consultation" },
  { label: "Workation", icon: MdComputer, path: "/workation" },
  {
    label: "Apply for Jobs",
    icon: IoBriefcaseSharp,
    badge: "Coming soon",
  },
];

const becomeHostItem = [{ label: "Become a Host", icon: HiOutlineViewGrid }];

const loggedOutPrompt = {
  title: "Get responses tailored to you",
  description:
    "Login to explore your nomad lifestyle and discover where you should live, work, and save more.",
  actionLabel: "Login as Nomad",
};

const profileItems = [
  { label: "userFullName", icon: HiOutlineUserCircle, tab: "profile" },
  { label: "Favorites", icon: HiOutlineHeart, tab: "favorites" },
  { label: "Reviews", icon: MdRateReview, tab: "reviews" },
  { label: "Change Password", icon: HiOutlineKey, tab: "password" },
];

const signOutItem = [{ label: "Sign Out", icon: HiOutlineLogout }];

const becomeContributorLink = {
  label: "Become a Contributor",
  icon: FaHandsHelping,
  path: "/become-a-contributor",
};

const collapsedSectionLabels = {
  "WoNo Intelligence": "WOI",
  "Value-Added Services": "VAS",
  Profile: "PRO",
};

const getCollapsedSectionLabel = (title = "") =>
  collapsedSectionLabels[title] ||
  title
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const SidebarSection = ({
  title,
  items,
  collapsed,
  isExpandable = false,
  isOpen = true,
  showTopBorder = true,
  compact = false,
  onToggle,
  onItemClick,
  onTooltipChange,
}) => {
  const ChevronIcon = isOpen ? HiChevronUp : HiChevronDown;
  const shouldShowItems = !isExpandable || isOpen;

  return (
    <div className={`px-4 ${compact ? "pt-0" : "pt-3"}`}>
      <div
        className={`${showTopBorder && !compact ? "border-t border-black/10" : ""} ${compact ? "pt-0" : "pt-2"}`}
      >
        {isExpandable ? (
          <button
            type="button"
            onClick={onToggle}
            onMouseEnter={(event) => {
              if (!collapsed) return;

              const rect = event.currentTarget.getBoundingClientRect();
              onTooltipChange?.({
                label: title.toUpperCase(),
                top: rect.top + rect.height / 2,
                left: rect.right + 14,
              });
            }}
            onMouseLeave={() => onTooltipChange?.(null)}
            onFocus={(event) => {
              if (!collapsed) return;

              const rect = event.currentTarget.getBoundingClientRect();
              onTooltipChange?.({
                label: title.toUpperCase(),
                top: rect.top + rect.height / 2,
                left: rect.right + 14,
              });
            }}
            onBlur={() => onTooltipChange?.(null)}
            className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-black/80"
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${title}`}
          >
            <span>{collapsed ? getCollapsedSectionLabel(title) : title}</span>
            <ChevronIcon size={16} className="shrink-0" />
          </button>
        ) : collapsed ? null : (
          <h3 className="text-xs font-semibold uppercase tracking-wide text-black/80">
            {title}
          </h3>
        )}

        {shouldShowItems && (
          // <div className="mt-2 space-y-1">
          <div className=" space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = !!item.active;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onItemClick?.(item)}
                  onMouseEnter={(event) => {
                    if (!collapsed) return;

                    const rect = event.currentTarget.getBoundingClientRect();
                    onTooltipChange?.({
                      label: item.label,
                      top: rect.top + rect.height / 2,
                      left: rect.right + 14,
                    });
                  }}
                  onMouseLeave={() => onTooltipChange?.(null)}
                  onFocus={(event) => {
                    if (!collapsed) return;

                    const rect = event.currentTarget.getBoundingClientRect();
                    onTooltipChange?.({
                      label: item.label,
                      top: rect.top + rect.height / 2,
                      left: rect.right + 14,
                    });
                  }}
                  onBlur={() => onTooltipChange?.(null)}
                  className={`group relative flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left transition-all hover:bg-white ${
                    isActive ? "bg-white text-black shadow-sm" : "text-black/80"
                  }`}
                  aria-label={collapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${isActive ? "text-primary-blue" : "text-black/80"}`}
                  />

                  {!collapsed && (
                    <>
                      <span
                        className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="ml-auto rounded-full border border-red-400 bg-red-200 px-1.5 py-0.5 text-[7px] font-semibold tracking-wide text-black shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {/* <span
                    className={`absolute bottom-0 left-0 h-[0.5px] bg-black rounded-t transition-all duration-300 ease-out
      ${isActive
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                      }`}
                  /> */}
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
  const [collapsed, setCollapsed] = useState(true);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(true);
  const [isValueAdditionsOpen, setIsValueAdditionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { auth } = useAuth();
  const logout = useLogout();
  const userFullName = auth?.user?.fullName?.trim() || "Profile";

  const profileItemsWithUserName = profileItems.map((item) =>
    item.label === "userFullName" ? { ...item, label: userFullName } : item,
  );

  useEffect(() => {
    const normalizedPath = location.pathname.replace(/\/$/, "") || "/";
    const isAiHomePage = normalizedPath === "/";
    const isValueAdditionPage = valueAdditionItems.some((item) => {
      if (!item.path) return false;

      const normalizedItemPath = item.path.replace(/\/$/, "");
      return (
        normalizedPath === normalizedItemPath ||
        normalizedPath.startsWith(`${normalizedItemPath}/`)
      );
    });

    if (isAiHomePage) {
      setIsRecommendationsOpen(false);
      setIsValueAdditionsOpen(true);
      return;
    }

    setIsRecommendationsOpen(true);
    setIsValueAdditionsOpen(isValueAdditionPage);
  }, [location.pathname]);

  const isLoggedIn = Boolean(auth?.user) || readStoredLoginState();
  console.log(isLoggedIn);

  const handleRecommendationClick = (item) => {
    const params = new URLSearchParams(location.search);
    const targetSearch = params.toString() ? `?${params.toString()}` : "";
    const targetRoute = `${item.path || "/search/results"}${targetSearch}`;

    if (!isLoggedIn && gatedRecommendationLabels.has(item.label)) {
      const goalSlug = goalSlugByLabel[item.label];
      const loginPath = goalSlug ? `/login/${goalSlug}` : "/login";

      navigate(`${loginPath}${location.search}`, {
        state: {
          loginContext: {
            title: item.label,
            description: item.description || "",
          },
          redirectTo: targetRoute,
        },
      });
      return;
    }

    navigate(
      {
        pathname: item.path || "/search/results",
        search: targetSearch,
      },
      {
        state:
          item.path?.includes("/search") && item.path?.includes("/results")
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

  const handleProfileClick = (item) => {
    if (!item.tab) return;

    const params = new URLSearchParams(location.search);
    params.set("tab", item.tab);

    navigate({
      pathname: "/profile",
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  const getNomadLoginRedirectPath = () => {
    const authPages = new Set(["/signup", "/login", "/forgot-password"]);

    if (authPages.has(location.pathname)) {
      return "/";
    }

    return `${location.pathname}${location.search}`;
  };

  const handleLogInClick = () => {
    navigate(`/login${location.search}`, {
      state: {
        redirectTo: getNomadLoginRedirectPath(),
      },
    });
  };

  const handleBecomeHostClick = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://host.localhost:5173/";
    } else {
      window.location.href = "https://host.wono.co/";
    }
  };

  const handleBecomeContributorClick = (item) => {
    const params = new URLSearchParams(location.search);
    navigate({
      pathname: item.path,
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  const handleSignOutClick = async () => {
    if (auth?.user) {
      await logout();
    }

    const nextSearchParams = new URLSearchParams(location.search);
    nextSearchParams.delete("login");
    clearStoredLoginState();

    if (isMobileOverlay) {
      onClose?.();
      navigate("/login");
      return;
    }

    navigate(
      {
        pathname: "/login",
        search: nextSearchParams.toString()
          ? `?${nextSearchParams.toString()}`
          : "",
      },
      {
        state: {
          redirectTo: `${location.pathname}${location.search}`,
        },
      },
    );
  };

  const isCollapsed = isMobileOverlay ? false : collapsed;

  const normalizedPath = location.pathname.replace(/\/$/, "") || "/";
  const redirectGoal = location.pathname
    .replace(/\/$/, "")
    .match(/^\/login\/([^/]+)$/)?.[1];

  // Active state logic for recommendations
  const recommendationItemsWithActivePath = recommendationItems.map((item) => {
    if (!item.path) return item;

    const normalizedItemPath = item.path.replace(/\/$/, "");
    const goalSlug = goalSlugByLabel[item.label];
    const isActivePath =
      normalizedPath === normalizedItemPath ||
      normalizedPath.startsWith(`${normalizedItemPath}/`) ||
      (normalizedPath.startsWith("/login/") &&
        Boolean(goalSlug) &&
        goalSlug === redirectGoal);

    return {
      ...item,
      active: isActivePath,
    };
  });

  // Active state logic for value additions
  const valueAdditionItemsWithActivePath = valueAdditionItems.map((item) => {
    if (!item.path) return item;

    const normalizedItemPath = item.path.replace(/\/$/, "");
    const isActivePath =
      normalizedPath === normalizedItemPath ||
      normalizedPath.startsWith(`${normalizedItemPath}/`);

    return {
      ...item,
      active: isActivePath,
    };
  });

  const becomeContributorItemWithActivePath = {
    ...becomeContributorLink,
    active:
      normalizedPath === becomeContributorLink.path ||
      normalizedPath.startsWith(`${becomeContributorLink.path}/`),
  };

  return (
    <>
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
        {/* Logo / Collapse Button */}
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
                className="rounded p-1 text-black/80"
                aria-label="Close sidebar"
              >
                <HiX size={24} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTooltip(null);
                setCollapsed((prev) => !prev);
              }}
              className="rounded p-1 text-black/80"
              aria-label="Toggle sidebar"
            >
              <HiOutlineMenu size={24} />
            </button>
          )}
        </div>

        {/* Sections */}
        <SidebarSection
          title="WoNo Intelligence"
          items={recommendationItemsWithActivePath}
          collapsed={isCollapsed}
          isExpandable
          isOpen={isRecommendationsOpen}
          onToggle={() => setIsRecommendationsOpen((prev) => !prev)}
          onItemClick={handleRecommendationClick}
          onTooltipChange={setTooltip}
        />

        <SidebarSection
          title="Value-Added Services"
          items={valueAdditionItemsWithActivePath}
          collapsed={isCollapsed}
          isExpandable
          isOpen={isValueAdditionsOpen}
          onToggle={() => setIsValueAdditionsOpen((prev) => !prev)}
          onItemClick={handleValueAdditionClick}
          onTooltipChange={setTooltip}
        />

        {isLoggedIn ? (
          <>
            <SidebarSection
              title="Profile"
              items={profileItemsWithUserName}
              collapsed={isCollapsed}
              isExpandable
              isOpen={isProfileOpen}
              onToggle={() => setIsProfileOpen((prev) => !prev)}
              onItemClick={handleProfileClick}
              onTooltipChange={setTooltip}
            />
            <div className="mx-4 mt-3 border-t border-black/10"></div>
            {/* Compact sections - minimal spacing */}
            <SidebarSection
              items={[becomeContributorItemWithActivePath]}
              collapsed={isCollapsed}
              onItemClick={handleBecomeContributorClick}
              compact={true}
              onTooltipChange={setTooltip}
            />
            <div className="mx-4 border-t border-black/10"></div>
            <SidebarSection
              items={becomeHostItem}
              collapsed={isCollapsed}
              onItemClick={handleBecomeHostClick}
              compact={true}
              onTooltipChange={setTooltip}
            />
            <div className="mx-4 border-t border-black/10"></div>
            <SidebarSection
              items={signOutItem}
              collapsed={isCollapsed}
              onItemClick={handleSignOutClick}
              compact={true}
              onTooltipChange={setTooltip}
            />
            <div className="mx-4 border-t border-black/10"></div>
          </>
        ) : (
          <>
            <div className="mx-4 mt-3 border-t border-black/10"></div>
            <SidebarSection
              items={[becomeContributorItemWithActivePath]}
              collapsed={isCollapsed}
              onItemClick={handleBecomeContributorClick}
              compact={true}
              onTooltipChange={setTooltip}
            />
            <div className="mx-4 border-t border-black/10"></div>
            <SidebarSection
              items={becomeHostItem}
              collapsed={isCollapsed}
              onItemClick={handleBecomeHostClick}
              compact={true}
              onTooltipChange={setTooltip}
            />
            {/* <div className="border-t border-black/10 mt-4 mx-4"></div> */}
            <div className="border-t border-black/10 mx-4"></div>
            {!isCollapsed ? (
              <div className="mt-auto px-4 pb-4 pt-10">
                <div className="rounded-[28px] p-4 ">
                  <p className="mt-2 text-nano leading-[0.9rem] text-black/55">
                    {loggedOutPrompt.description}
                  </p>
                  <p className="text-nano font-semibold leading-5 text-black/55">
                    Powered by your preferences.
                  </p>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleLogInClick}
                      className="mt-6 w-[70%] rounded-full border border-black/30 bg-[#efefef] px-0 py-2 text-nano text-black/80 hover:bg-[#e0e0e0]"
                    >
                      {loggedOutPrompt.actionLabel}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-auto flex justify-center px-2 pb-4">
                <button
                  type="button"
                  onClick={handleLogInClick}
                  onMouseEnter={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();

                    setTooltip({
                      label: loggedOutPrompt.actionLabel,
                      top: rect.top + rect.height / 2,
                      left: rect.right + 14,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-white text-black/80 transition-all hover:bg-[#e0e0e0]"
                  aria-label={loggedOutPrompt.actionLabel}
                >
                  <HiOutlineLogin size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </aside>

      {isCollapsed && tooltip && (
        <div
          className="pointer-events-none fixed z-[1000] -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white shadow-lg"
          style={{ top: `${tooltip.top}px`, left: `${tooltip.left}px` }}
          role="tooltip"
        >
          <span className="absolute left-[-5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-black" />
          {tooltip.label}
        </div>
      )}
    </>
  );
};

export default AiSidebar;
