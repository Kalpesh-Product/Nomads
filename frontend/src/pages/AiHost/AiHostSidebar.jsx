import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearStoredLoginState,
  readStoredLoginState,
} from "../../hooks/useNomadLoginState";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";
import { findModuleByLabel, findModule } from "../../data/hostModulesCatalog";
import logo from "../../assets/WONO_LOGO_Black_TP.svg";
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
import { FaGlobeAmericas } from "react-icons/fa";
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

// The "Modules" overview section uses marketing-style labels that don't
// match any catalog module/department label, so they're mapped explicitly
// to a real anchor on /modules instead of relying on label matching.
const modulesOverviewTargets = {
  "Build & Manage Website": { categoryId: "key-apps", moduleId: "create-edit-website" },
  "Nomad Listings": { categoryId: "key-apps", moduleId: "listings" },
  "Sales Management": { categoryId: "department-accesses", moduleId: "sales-leads-management" },
  "Finance Management": {
    categoryId: "department-accesses",
    moduleId: "finance-expenses-budget",
  },
  "Administration Management": {
    categoryId: "department-accesses",
    moduleId: "admin-printout-management",
  },
  "HR Management": { categoryId: "department-accesses", moduleId: "hr-company-management" },
  "IT Infrastructure": { categoryId: "department-accesses", moduleId: "it-repair-logs" },
  "Maintenance Management": {
    categoryId: "department-accesses",
    moduleId: "maintenance-repair-logs",
  },
};

// Plan badge shown next to every nav item that maps to a real catalog
// module, site-wide, so browsing the sidebar itself shows which tier
// unlocks what — same lookup handleSidebarItemClick uses to deep-link.
const planForLabel = (label) => {
  const target = modulesOverviewTargets[label] || findModuleByLabel(label);
  if (!target) return null;
  const found = findModule(target.categoryId, target.moduleId);
  return found?.module?.plan || found?.parent?.plan || null;
};

const SIDEBAR_PLAN_RANK = { basic: 0, professional: 1, custom: 2 };
const filterSidebarItemsForPlan = (items, activePlan) => {
  if (!activePlan) return items;
  const activeRank = SIDEBAR_PLAN_RANK[activePlan];

  return items.reduce((visibleItems, item) => {
    const requiredPlan = planForLabel(item.label);
    const children = item.children
      ? filterSidebarItemsForPlan(item.children, activePlan)
      : null;
    const itemIsIncluded = requiredPlan
      ? (SIDEBAR_PLAN_RANK[requiredPlan] ?? 0) <= activeRank
      : item.children
        ? children.length > 0
        : true;

    if (!itemIsIncluded) return visibleItems;
    visibleItems.push(children ? { ...item, children } : item);
    return visibleItems;
  }, []);
};

const recommendationItems = [
  {
    label: "Build & Manage Website",
    icon: CgWebsite,
    // path: "/website-builder",
  },
  {
    label: "Nomad Listings",
    icon: TbWorldWww,
    // path: "/modules",
  },
  {
    label: "Sales Management",
    icon: MdOutlineHandshake,
    // path: "/modules",
  },
  {
    label: "Finance Management",
    icon: MdAccountBalance,
    // path: "/themes",
  },
  {
    label: "Administration Management",
    icon: HiOutlineBriefcase,
    // path: "/leads",
  },
  {
    label: "HR Management",
    icon: BsPeopleFill,
    // path: "/career",
  },
  {
    label: "IT Infrastructure",
    icon: FaDesktop,
    // path: "/calendar",
  },
  {
    label: "Maintenance Management",
    icon: TiSpanner,
    // suffixText: "...More",
  },
];

// Real Key Apps, per the dev team's Add-Ons plan matrix.
const valueAdditionItems = [
  { label: "Website Builder", icon: CgWebsite },
  { label: "Nomad Listings", icon: TbWorldWww },
  { label: "All Leads", icon: HiOutlineDocumentReport },
  { label: "Visitor Management", icon: BsPersonVcard },
];

// Locked-until-Custom-plan modules, per the Add-Ons matrix's own
// "Extra Common Modules" group.
const extraCommonModules = [
  { label: "Assets", icon: HiOutlineArchive },
  { label: "Inventory", icon: HiOutlineLibrary },
  { label: "Finance Management", icon: HiOutlineCash },
  { label: "Team Management", icon: BsPeopleFill },
  { label: "Reports", icon: HiOutlineDocumentReport },
];

const commonFeatures = [
  { label: "Dashboard", icon: HiOutlineViewGrid },
  { label: "Customer Support", icon: MdOutlineSupportAgent },
  { label: "Tickets", icon: HiOutlineClipboardList },
  { label: "Meeting Room Booking", icon: MdMeetingRoom },
  { label: "Calendar", icon: TbCalendarUser },
  { label: "Printouts", icon: HiOutlineDocumentReport },
  { label: "Attendance", icon: MdOutlineFingerprint },
  { label: "Tasks", icon: HiOutlineClipboardList },
  { label: "Leave Requests", icon: HiOutlineLogout },
];

const coreModules = [
  { label: "Organization Management", icon: HiOutlineLibrary },
  { label: "Access Grants", icon: HiOutlineKey },
  { label: "Analytics", icon: HiOutlineChartBar },
  { label: "Unit Settings", icon: HiOutlineCash },
  { label: "Unit Management", icon: HiOutlineTemplate },
];

// Each department's own module list, per "Department Accesses" in the
// dev team's Add-Ons plan matrix and the Customise Plan doc. Ordered to
// match the Modules overview section above (Sales, Finance,
// Administration, HR, IT, Maintenance), with Tech appended alongside IT.
const departmentAccess = [
  {
    label: "Sales Department",
    icon: HiOutlineTrendingUp,
    children: [
      { label: "Leads Management", icon: HiOutlineDocumentReport },
      { label: "Tenant Companies", icon: HiOutlineLibrary },
      { label: "Virtual Offices", icon: CgWebsite },
      { label: "Resource & Pricing", icon: HiOutlineCash },
      { label: "Sales Architecture", icon: TbWorldWww },
    ],
  },
  {
    label: "Finance Department",
    icon: HiOutlineCurrencyDollar,
    children: [
      { label: "Expenses & Budget", icon: HiOutlineCash },
      { label: "Billing & Payments", icon: HiOutlineCurrencyDollar },
      { label: "Accounting", icon: HiOutlineChartBar },
    ],
  },
  {
    label: "Administration Department",
    icon: HiOutlineBriefcase,
    children: [
      { label: "Printout Management", icon: HiOutlineDocumentReport },
      { label: "Bookings", icon: MdMeetingRoom },
      { label: "Visitors Management", icon: BsPersonVcard },
      { label: "Resource Management", icon: HiOutlineLibrary },
      { label: "Housekeeping", icon: HiOutlineClipboardList },
    ],
  },
  {
    label: "HR Department",
    icon: HiOutlineUsers,
    children: [
      { label: "Company Management", icon: HiOutlineLibrary },
      { label: "Documents", icon: HiOutlineDocumentReport },
      { label: "Recruitment", icon: HiOutlineBriefcase },
      { label: "Leave Request Processing", icon: HiOutlineLogout },
      { label: "Attendance Review", icon: MdOutlineFingerprint },
      { label: "Payroll Management", icon: HiOutlineCash },
      { label: "Resignation Management", icon: HiOutlineLogout },
    ],
  },
  {
    label: "IT Department",
    icon: HiOutlineDatabase,
    children: [{ label: "IT Repair Logs", icon: HiOutlineChip }],
  },
  {
    label: "Maintenance Department",
    icon: HiOutlineWrenchScrewdriver,
    children: [
      { label: "Maintenance Repair Logs", icon: HiOutlineWrenchScrewdriver },
      { label: "AMC Maintenance Schedule", icon: TbCalendarUser },
    ],
  },
  // Last on purpose: every item here duplicates what Key Apps > Website
  // Builder already covers — this is that same feature surfaced again
  // under Tech's own department access.
  {
    label: "Tech Department",
    icon: HiOutlineChip,
    children: [
      { label: "Website Builder", icon: CgWebsite },
      { label: "Website Leads", icon: HiOutlineDocumentReport },
      { label: "Website Review", icon: HiOutlineHeart },
    ],
  },
];

const becomeNomadItem = [{ label: "Become a Nomad", icon: HiOutlineViewGrid }];

const hostLoginPrompt = {
  description:
    "Login to manage your host tools, listings, operations, and business setup.",
  actionLabel: "Login as Business",
};

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

const collapsedSectionLabels = {
  Modules: "MOD",
  "Common Modules": "COM",
  "Extra Common Modules": "EXT",
  "Core Modules": "COR",
  "Key Apps": "APP",
  "Department Accesses": "DEP",
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
              const hasChildren = !!item.children?.length;
              const isChildActive =
                hasChildren && item.children.some((c) => c.active);
              const isActive = !!item.active || isChildActive;

              return (
                <div key={item.label}>
                  <button
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
                      isActive ? "text-black" : "text-black/80"
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
                          className={`min-w-0 flex-1 truncate whitespace-nowrap text-xs font-medium ${isActive ? "font-semibold text-black" : ""}`}
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
                  </button>
                </div>
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
  // The sidebar transition changes available width without a window resize.
  // Recalculate responsive text once that transition has settled.
  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event("resize")), 320);
    return () => clearTimeout(timer);
  }, [collapsed]);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [isValueAdditionsOpen, setIsValueAdditionsOpen] = useState(false);
  const [isCommonFeaturesOpen, setIsCommonFeaturesOpen] = useState(false);
  const [isExtraCommonModulesOpen, setIsExtraCommonModulesOpen] = useState(false);
  const [isCoreModulesOpen, setIsCoreModulesOpen] = useState(false);
  const [isDepartmentAccessOpen, setIsDepartmentAccessOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const normalizedPath = location.pathname.replace(/\/$/, "") || "/";
  const requestedModulesPlan = new URLSearchParams(location.search).get("plan");
  const selectedModulesPlan =
    normalizedPath === "/modules" && requestedModulesPlan in SIDEBAR_PLAN_RANK
      ? requestedModulesPlan
      : null;

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

  // Mock wiring: every item under Modules / Common Modules / Core Modules /
  // Key Apps routes into /modules and jumps straight to that item's
  // section (and pre-selects it when its label matches a real module from
  // hostModulesCatalog.js). Falls back to the section's default category,
  // or the top of the page, when there's no exact match yet.
  // /modules is plan-scoped — a deep link needs ?plan= too, or the target
  // module may be filtered out of the selected plan's module index.
  const handleSidebarItemClick = (item, defaultCategoryId) => {
    const override = modulesOverviewTargets[item?.label];
    if (override) {
      const plan = planForLabel(item?.label) || selectedModulesPlan || "basic";
      navigate(`/modules?plan=${plan}&category=${override.categoryId}&module=${override.moduleId}`);
      return;
    }

    const match = findModuleByLabel(item?.label);
    if (match) {
      const plan = planForLabel(item?.label) || selectedModulesPlan || "basic";
      navigate(`/modules?plan=${plan}&category=${match.categoryId}&module=${match.moduleId}`);
      return;
    }
    if (defaultCategoryId) {
      navigate(
        selectedModulesPlan
          ? `/modules?plan=${selectedModulesPlan}&category=${defaultCategoryId}`
          : `/modules?category=${defaultCategoryId}`,
      );
      return;
    }
    navigate("/modules");
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

  const handleLogInClick = () => {
    navigate(`/ai-login${location.search}`, {
      state: {
        redirectTo: `${location.pathname}${location.search}`,
      },
    });
  };

  const handleBecomeNomadClick = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://localhost:5173/";
    } else {
      window.location.href = "https://wono.co/";
    }
  };

  const handleHostLoginClick = () => {
    window.location.href = "https://hostpanel.wono.co";
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

  const redirectGoal = location.pathname
    .replace(/\/$/, "")
    .match(/^\/ai-login\/([^/]+)$/)?.[1];

  // A module selected on /modules (?category=&module=) shows as the
  // selected item here too, by matching its label against the real
  // catalog — same mapping handleSidebarItemClick uses to get there.
  const activeModuleParam =
    normalizedPath === "/modules"
      ? new URLSearchParams(location.search).get("module")
      : null;
  const isModuleActive = (item) => {
    if (!activeModuleParam) return false;
    const override = modulesOverviewTargets[item.label];
    if (override) return override.moduleId === activeModuleParam;
    const match = findModuleByLabel(item.label);
    return Boolean(match && match.moduleId === activeModuleParam);
  };

  // Active state logic for recommendations
  const recommendationItemsWithActivePath = filterSidebarItemsForPlan(recommendationItems.map((item) => {
    const moduleActive = isModuleActive(item);
    if (!item.path) return { ...item, active: moduleActive };

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
      active: isActivePath || moduleActive,
    };
  }), null);

  // Active state logic for value additions
  const valueAdditionItemsWithActivePath = filterSidebarItemsForPlan(valueAdditionItems.map((item) => {
    const moduleActive = isModuleActive(item);
    if (!item.path) return { ...item, active: moduleActive };

    const normalizedItemPath = item.path.replace(/\/$/, "");
    const isActivePath =
      normalizedPath === normalizedItemPath ||
      normalizedPath.startsWith(`${normalizedItemPath}/`);

    return {
      ...item,
      active: isActivePath || moduleActive,
    };
  }), null);

  const commonFeaturesWithActivePath = filterSidebarItemsForPlan(commonFeatures.map((item) => {
    const moduleActive = isModuleActive(item);
    if (!item.path) return { ...item, active: moduleActive };

    const normalizedItemPath = item.path.replace(/\/$/, "");
    const isActivePath =
      normalizedPath === normalizedItemPath ||
      normalizedPath.startsWith(`${normalizedItemPath}/`);

    return {
      ...item,
      active: isActivePath || moduleActive,
    };
  }), null);

  const coreModulesWithActivePath = filterSidebarItemsForPlan(coreModules.map((item) => {
    const moduleActive = isModuleActive(item);
    if (!item.path) return { ...item, active: moduleActive };

    const normalizedItemPath = item.path.replace(/\/$/, "");
    const isActivePath =
      normalizedPath === normalizedItemPath ||
      normalizedPath.startsWith(`${normalizedItemPath}/`);

    return {
      ...item,
      active: isActivePath || moduleActive,
    };
  }), null);

  const departmentAccessWithActivePath = filterSidebarItemsForPlan(departmentAccess.map((item) => {
    const children = item.children?.map((child) => ({
      ...child,
      active: isModuleActive(child),
    }));
    const moduleActive =
      isModuleActive(item) || Boolean(children?.some((c) => c.active));
    if (!item.path) return { ...item, active: moduleActive, children };

    const normalizedItemPath = item.path.replace(/\/$/, "");
    const isActivePath =
      normalizedPath === normalizedItemPath ||
      normalizedPath.startsWith(`${normalizedItemPath}/`);

    return {
      ...item,
      active: isActivePath || moduleActive,
      children,
    };
  }), null);

  // Extra Common Modules — locked-until-Custom-plan modules.
  const extraCommonModulesWithActivePath = filterSidebarItemsForPlan(extraCommonModules.map((item) => {
    const moduleActive = isModuleActive(item);
    if (!item.path) return { ...item, active: moduleActive };

    const normalizedItemPath = item.path.replace(/\/$/, "");
    const isActivePath =
      normalizedPath === normalizedItemPath ||
      normalizedPath.startsWith(`${normalizedItemPath}/`);

    return {
      ...item,
      active: isActivePath || moduleActive,
    };
  }), null);

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
      <div
        className={`py-4 ${
          !isMobileOverlay && isCollapsed ? "flex justify-center px-0" : "px-4"
        }`}
      >
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
            className="flex items-center justify-center rounded p-1 text-black/80"
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
        onItemClick={(item) => handleSidebarItemClick(item, "key-apps")}
        onTooltipChange={setTooltip}
      />

      {commonFeaturesWithActivePath.length > 0 && (
        <SidebarSection
          title="Common Modules"
          items={commonFeaturesWithActivePath}
          collapsed={isCollapsed}
          isExpandable
          isOpen={isCommonFeaturesOpen}
          onToggle={() => setIsCommonFeaturesOpen((prev) => !prev)}
          onItemClick={(item) => handleSidebarItemClick(item, "common-modules")}
          onTooltipChange={setTooltip}
        />
      )}
      {extraCommonModulesWithActivePath.length > 0 && (
        <SidebarSection
          title="Extra Common Modules"
          items={extraCommonModulesWithActivePath}
          collapsed={isCollapsed}
          isExpandable
          isOpen={isExtraCommonModulesOpen}
          onToggle={() => setIsExtraCommonModulesOpen((prev) => !prev)}
          onItemClick={(item) => handleSidebarItemClick(item, "extra-common-modules")}
          onTooltipChange={setTooltip}
        />
      )}
      {valueAdditionItemsWithActivePath.length > 0 && (
        <SidebarSection
          title="Key Apps"
          items={valueAdditionItemsWithActivePath}
          collapsed={isCollapsed}
          isExpandable
          isOpen={isValueAdditionsOpen}
          onToggle={() => setIsValueAdditionsOpen((prev) => !prev)}
          onItemClick={(item) => handleSidebarItemClick(item, "key-apps")}
          onTooltipChange={setTooltip}
        />
      )}
      {coreModulesWithActivePath.length > 0 && (
        <SidebarSection
          title="Core Modules"
          items={coreModulesWithActivePath}
          collapsed={isCollapsed}
          isExpandable
          isOpen={isCoreModulesOpen}
          onToggle={() => setIsCoreModulesOpen((prev) => !prev)}
          onItemClick={(item) => handleSidebarItemClick(item, "core-modules")}
          onTooltipChange={setTooltip}
        />
      )}
      {departmentAccessWithActivePath.length > 0 && (
        <SidebarSection
          title="Department Accesses"
          items={departmentAccessWithActivePath}
          collapsed={isCollapsed}
          isExpandable
          isOpen={isDepartmentAccessOpen}
          onToggle={() => setIsDepartmentAccessOpen((prev) => !prev)}
          onItemClick={(item) => handleSidebarItemClick(item, "department-accesses")}
          onTooltipChange={setTooltip}
        />
      )}

      {isMobileOverlay && (
        <>
          <div className="mx-4 mt-3 border-t border-black/10"></div>
          <SidebarSection
            items={becomeNomadItem}
            collapsed={isCollapsed}
            onItemClick={handleBecomeNomadClick}
            compact={true}
            onTooltipChange={setTooltip}
          />
          <div className="mx-4 border-t border-black/10"></div>

          <div className="mt-auto px-4 pb-4 pt-10">
            <div className="rounded-[28px] p-4">
              <p className="mt-2 text-nano leading-[0.9rem] text-black/55">
                {hostLoginPrompt.description}
              </p>
              <p className="text-nano font-semibold leading-5 text-black/55">
                Built for your host workflow.
              </p>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleHostLoginClick}
                  className="mt-6 w-[70%] rounded-full border border-black/30 bg-[#efefef] px-0 py-2 text-nano text-black/80 hover:bg-[#e0e0e0]"
                >
                  {hostLoginPrompt.actionLabel}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {!isMobileOverlay && isLoggedIn ? (
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
          <div className="px-4 pt-3">
            <div className="border-t border-black/10"></div>
          </div>
          {/* Compact sections - minimal spacing */}
          {/* <SidebarSection
                        items={becomeNomadItem}
                        collapsed={isCollapsed}
                        onItemClick={handleBecomeNomadClick}
                        compact={true}
                    /> */}
          <div className="px-4 pt-3">
            <div className="border-t border-black/10"></div>
          </div>
          {/* <SidebarSection
                        items={signOutItem}
                        collapsed={isCollapsed}
                        onItemClick={handleSignOutClick}
                        compact={true}
                    /> */}
          <div className="px-4 pt-3">
            <div className="border-t border-black/10"></div>
          </div>
        </>
      ) : (
        !isMobileOverlay && (
          <>
            {/* <div className="border-t border-black/10 mt-4 mx-4"></div>
                    <SidebarSection
                        items={becomeNomadItem}
                        collapsed={isCollapsed}
                        onItemClick={handleBecomeNomadClick}
                        compact={true}
                    /> */}
            {/* <div className="border-t border-black/10 mt-4 mx-4"></div> */}
            <div className="px-4 pt-3">
              <div className="border-t border-black/10"></div>
            </div>
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
        )
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
