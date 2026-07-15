import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearStoredLoginState,
  readStoredLoginState,
} from "../../hooks/useNomadLoginState";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";
import logo from "../../assets/WONO_LOGO_Black_TP.png";
import {
  HiChevronDown,
  HiChevronUp,
  HiOutlineMenu,
  HiX,
  HiOutlineViewGrid,
  HiOutlineHeart,
  HiOutlineUserCircle,
  HiOutlineKey,
  HiOutlineLogout,
} from "react-icons/hi";
import { LuCircleDollarSign, LuMapPinned } from "react-icons/lu";
import { FaGlobeAmericas, FaHandsHelping } from "react-icons/fa";
import { MdOutlineWorkHistory } from "react-icons/md";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { RiUserCommunityLine } from "react-icons/ri";
import { TbAward, TbWorldWww } from "react-icons/tb";
import { CgWebsite } from "react-icons/cg";
import { TbCalendarUser } from "react-icons/tb";
import { MdOutlineSupportAgent } from "react-icons/md";
import { MdMeetingRoom } from "react-icons/md";
import { TiSpanner } from "react-icons/ti";
import { FaDesktop } from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { MdAccountBalance } from "react-icons/md";
import { MdOutlineHandshake } from "react-icons/md";
import { BsPersonVcard } from "react-icons/bs";
import { HiOutlineClipboardList } from "react-icons/hi";
import { MdOutlineFingerprint } from "react-icons/md";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { HiOutlineArchive } from "react-icons/hi";
import { HiOutlineLibrary } from "react-icons/hi";
import { HiOutlineCash } from "react-icons/hi";
import { HiOutlineTemplate } from "react-icons/hi";
import { HiOutlineChartBar } from "react-icons/hi";
import { HiOutlineUsers } from "react-icons/hi";
import { HiOutlineBriefcase } from "react-icons/hi";
import { HiOutlineTrendingUp } from "react-icons/hi";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { HiOutlineChip } from "react-icons/hi";
import { HiOutlineDatabase } from "react-icons/hi";

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

const hostSignupEntryPath = "/signup?step=1";

const recommendationItems = [
  {
    label: "Build & Manage Website",
    icon: CgWebsite,
    path: "/website-builder",
  },
  {
    label: "Nomad Listings",
    icon: TbWorldWww,
    path: "/modules",
  },
  {
    label: "Sales Management Module",
    icon: MdOutlineHandshake,
    path: "/modules",
  },
  {
    label: "Finance Management Module",
    icon: MdAccountBalance,
    path: "/themes",
  },
  {
    label: "Administration Management Module",
    icon: HiOutlineBriefcase,
    path: "/leads",
  },
  {
    label: "HR Management Module",
    icon: BsPeopleFill,
    path: "/career",
  },
  {
    label: "IT Infrastructure Module",
    icon: FaDesktop,
    path: "/calendar",
  },
  {
    label: "Maintenance Management Module",
    icon: TiSpanner,
    // suffixText: "...More",
  },
];

const valueAdditionItems = [
  {
    label: "Visitor Management",
    icon: BsPersonVcard,
    path: "/assets",
  },
  {
    label: "Assets Management",
    icon: HiOutlineArchive,
    path: "/extra-common-modules",
  },
  {
    label: "Inventory Management",
    icon: HiOutlineLibrary,
    path: "/extra-common-modules",
  },
  {
    label: "Finance Management",
    icon: HiOutlineCash,
    path: "/assets",
  },
  {
    label: "Reports Management",
    icon: HiOutlineDocumentReport,
  },
];

const commonFeatures = [
  {
    label: "Dashboard",
    icon: HiOutlineViewGrid,
    path: "/extra-common-modules",
  },
  {
    label: "Customer Support",
    icon: MdOutlineSupportAgent,
    path: "/extra-common-modules",
  },
  {
    label: "Tasks",
    icon: HiOutlineClipboardList,
    path: "/assets",
  },
  {
    label: "Ticketing System",
    icon: MdOutlineSupportAgent,
    path: "/inventory",
  },
  {
    label: "Meeting Room Booking System",
    icon: MdMeetingRoom,
    path: "/finance-management",
  },
  {
    label: "Attendance",
    icon: MdOutlineFingerprint,
    path: "/extra-common-modules",
  },
  {
    label: "Leave Requests",
    icon: HiOutlineLogout,
  },
  {
    label: "Calendar",
    icon: TbCalendarUser,
    path: "/finance-management",
  },
];

const coreModules = [
  {
    label: "Organization Management",
    icon: HiOutlineLibrary,
    path: "/extra-common-modules",
  },
  {
    label: "Module Management",
    icon: HiOutlineTemplate,
    path: "/extra-common-modules",
  },
  {
    label: "Access Grants",
    icon: HiOutlineKey,
    path: "/assets",
  },
  {
    label: "Unit Setting",
    icon: HiOutlineCash,
    path: "/extra-common-modules",
  },
  {
    label: "Unit Management",
    icon: HiOutlineTemplate,
    path: "/extra-common-modules",
  },
  {
    label: "Analytics",
    icon: HiOutlineChartBar,
    path: "/assets",
  },
];

const departmentAccess = [
  {
    label: "Hr Department",
    icon: HiOutlineUsers,
    path: "/extra-common-modules",
  },
  {
    label: "Administration Department",
    icon: HiOutlineBriefcase,
    path: "/extra-common-modules",
  },
  {
    label: "Sales Department",
    icon: HiOutlineTrendingUp,
    path: "/assets",
  },
  {
    label: "Finance Department",
    icon: HiOutlineCurrencyDollar,
    path: "/extra-common-modules",
  },
  {
    label: "Maintainence Department",
    icon: HiOutlineWrenchScrewdriver,
    path: "/extra-common-modules",
  },
  {
    label: "Tech Department",
    icon: HiOutlineChip,
    path: "/assets",
  },
  {
    label: "IT Department",
    icon: HiOutlineDatabase,
    path: "/assets",
  },
];

const becomeHostItem = [{ label: "Become A Nomad", icon: HiOutlineViewGrid }];

const loggedOutPrompt = {
  title: "Get responses tailored to you",
  description:
    "Login to explore your nomad lifestyle and discover where you should live, work, and save more.",
  actionLabel: "Login",
};

const profileItems = [
  { label: "Edit Profile", icon: HiOutlineUserCircle, tab: "profile" },
  { label: "Change Password", icon: HiOutlineKey, tab: "password" },
];

const signOutItem = [{ label: "Sign Out", icon: HiOutlineLogout }];

const becomeContributorLink = {
  label: "Become A Contributor",
  icon: FaHandsHelping,
  path: "/become-a-contributor",
};

const collapsedSectionLabels = {
  Modules: "MOD",
  "Common Modules": "COM",
  "Core Modules": "COR",
  "Key Apps": "APP",
  "Department Access": "DEP",
  Profile: "PRO",
};

const getCollapsedSectionLabel = (title = "") =>
  collapsedSectionLabels[title] ||
  title
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
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
  const navigate = useNavigate();

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
                    className={`shrink-0 ${isActive ? "text-black" : "text-black/80"}`}
                  />

                  {!collapsed && (
                    <>
                      <span
                        className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}
                      >
                        {item.label}
                      </span>
                      {item.suffixText && (
                        <span className="ml-auto text-[12px] font-medium tracking-wide text-black/55">
                          <button
                            onClick={() => navigate(hostSignupEntryPath)}
                            className="hover:text-primary-blue"
                          >
                            {item.suffixText}
                          </button>
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
  const [isCommonFeaturesOpen, setIsCommonFeaturesOpen] = useState(false);
  const [isCoreModulesOpen, setIsCoreModulesOpen] = useState(false);
  const [isDepartmentAccessOpen, setIsDepartmentAccessOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { auth } = useAuth();
  const logout = useLogout();
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

    const isCommonFeaturePage = commonFeatures.some((item) => {
      if (!item.path) return false;
      const normalizedItemPath = item.path.replace(/\/$/, "");
      return (
        normalizedPath === normalizedItemPath ||
        normalizedPath.startsWith(`${normalizedItemPath}/`)
      );
    });

    const isCoreModulePage = coreModules.some((item) => {
      if (!item.path) return false;
      const normalizedItemPath = item.path.replace(/\/$/, "");
      return (
        normalizedPath === normalizedItemPath ||
        normalizedPath.startsWith(`${normalizedItemPath}/`)
      );
    });

    const isDepartmentAccessPage = departmentAccess.some((item) => {
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
    if (isValueAddedPage) setIsValueAdditionsOpen(true);
    if (isCommonFeaturePage) setIsCommonFeaturesOpen(true);
    if (isCoreModulePage) setIsCoreModulesOpen(true);
    if (isDepartmentAccessPage) setIsDepartmentAccessOpen(true);
  }, [location.pathname]);

  const isLoggedIn = Boolean(auth?.user) || readStoredLoginState();
  console.log(isLoggedIn);

  const handleSidebarItemClick = () => {};

  const handleProfileClick = (item) => {
    if (!item.tab) return;

    const params = new URLSearchParams(location.search);
    params.set("tab", item.tab);

    navigate({
      pathname: "/profile",
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  const handleLogInClick = () => {
    navigate(`/ai-login${location.search}`, {
      state: {
        redirectTo: `${location.pathname}${location.search}`,
      },
    });
  };

  const handleBecomeHostClick = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://nomad.localhost:5173/home";
    } else {
      window.location.href = "https://nomad.wono.co/home";
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
      navigate("/ai-login");
      return;
    }

    navigate(
      {
        pathname: "/ai-login",
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
    .match(/^\/ai-login\/([^/]+)$/)?.[1];

  // Active state logic for recommendations
  const recommendationItemsWithActivePath = recommendationItems.map((item) => {
    if (!item.path) return item;

    const normalizedItemPath = item.path.replace(/\/$/, "");
    const goalSlug = goalSlugByLabel[item.label];
    const isActivePath =
      normalizedPath === normalizedItemPath ||
      normalizedPath.startsWith(`${normalizedItemPath}/`) ||
      (normalizedPath.startsWith("/ai-login/") &&
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

  const commonFeaturesWithActivePath = commonFeatures.map((item) => {
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

  const coreModulesWithActivePath = coreModules.map((item) => {
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

  const departmentAccessWithActivePath = departmentAccess.map((item) => {
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
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded p-1 text-black/80"
            aria-label="Toggle sidebar"
          >
            <HiOutlineMenu size={24} />
          </button>
        )}
      </div>

      {/* Sections */}
      <SidebarSection
        title="Modules"
        items={recommendationItemsWithActivePath}
        collapsed={isCollapsed}
        isExpandable
        isOpen={isRecommendationsOpen}
        onToggle={() => setIsRecommendationsOpen((prev) => !prev)}
        onItemClick={handleSidebarItemClick}
        onTooltipChange={setTooltip}
      />

      <SidebarSection
        title="Common Modules"
        items={commonFeaturesWithActivePath}
        collapsed={isCollapsed}
        isExpandable
        isOpen={isCommonFeaturesOpen}
        onToggle={() => setIsCommonFeaturesOpen((prev) => !prev)}
        onItemClick={handleSidebarItemClick}
        onTooltipChange={setTooltip}
      />
      <SidebarSection
        title="Core Modules"
        items={coreModulesWithActivePath}
        collapsed={isCollapsed}
        isExpandable
        isOpen={isCoreModulesOpen}
        onToggle={() => setIsCoreModulesOpen((prev) => !prev)}
        onItemClick={handleSidebarItemClick}
        onTooltipChange={setTooltip}
      />
      <SidebarSection
        title="Key Apps"
        items={valueAdditionItemsWithActivePath}
        collapsed={isCollapsed}
        isExpandable
        isOpen={isValueAdditionsOpen}
        onToggle={() => setIsValueAdditionsOpen((prev) => !prev)}
        onItemClick={handleSidebarItemClick}
        onTooltipChange={setTooltip}
      />
      <SidebarSection
        title="Department Access"
        items={departmentAccessWithActivePath}
        collapsed={isCollapsed}
        isExpandable
        isOpen={isDepartmentAccessOpen}
        onToggle={() => setIsDepartmentAccessOpen((prev) => !prev)}
        onItemClick={handleSidebarItemClick}
        onTooltipChange={setTooltip}
      />

      {isLoggedIn ? (
        <>
          {/* <SidebarSection
                        title="Profile"
                        items={profileItems}
                        collapsed={isCollapsed}
                        isExpandable
                        isOpen={isProfileOpen}
                        onToggle={() => setIsProfileOpen((prev) => !prev)}
                        onItemClick={handleProfileClick}
                    /> */}
          <div className="mx-4 mt-3 border-t border-black/10"></div>
          {/* Compact sections - minimal spacing */}
          {/* <SidebarSection
                        items={[becomeContributorItemWithActivePath]}
                        collapsed={isCollapsed}
                        onItemClick={handleBecomeContributorClick}
                        compact={true}
                    /> */}
          {/* <div className="mx-4 border-t border-black/10"></div>
                    <SidebarSection
                        items={becomeHostItem}
                        collapsed={isCollapsed}
                        onItemClick={handleBecomeHostClick}
                        compact={true}
                    /> */}
          <div className="mx-4 border-t border-black/10"></div>
          {/* <SidebarSection
                        items={signOutItem}
                        collapsed={isCollapsed}
                        onItemClick={handleSignOutClick}
                        compact={true}
                    /> */}
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
          {/* <div className="mx-4 border-t border-black/10"></div>
                    <SidebarSection
                        items={becomeHostItem}
                        collapsed={isCollapsed}
                        onItemClick={handleBecomeHostClick}
                        compact={true}
                    /> */}
          {/* <div className="border-t border-black/10 mt-4 mx-4"></div> */}
          <div className="border-t border-black/10 mx-4"></div>
          {/* {!isCollapsed && (
                        <div className="mt-auto px-4 pb-4 pt-10">
                            <div className="rounded-[28px] p-4 shadow-sm">
                                <p className="mt-2 text-nano leading-[0.9rem] text-black/55">
                                    {loggedOutPrompt.description}
                                </p>
                                <p className="text-nano font-semibold leading-5 text-black/55">
                                    Powered by your preferences.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleLogInClick}
                                    className="mt-6 w-full rounded-full border border-black/10 bg-primary-blue px-3 py-2 text-base font-semibold text-white"
                                >
                                    {loggedOutPrompt.actionLabel}
                                </button>
                            </div>
                        </div>
                    )} */}
        </>
      )}
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
    </aside>
  );
};

export default AiSidebar;
