import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  readStoredLoginState,
} from "../../hooks/useNomadLoginState";
import useAuth from "../../hooks/useAuth";
import useHostModuleCatalog from "../../hooks/useHostModuleCatalog";
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

const hostSignupEntryPath = "/signup?step=1";

// Plan badge shown next to every nav item that maps to a real catalog
// module, site-wide, so browsing the sidebar itself shows which tier
// unlocks what — same lookup handleSidebarItemClick uses to deep-link.
const planForLabel = (label, categories) => {
  const target = findModuleByLabel(label, categories);
  if (!target) return null;
  const found = findModule(target.categoryId, target.moduleId, categories);
  return found?.module?.plan || found?.parent?.plan || null;
};

const SIDEBAR_PLAN_RANK = { basic: 0, professional: 1, custom: 2 };

const categoryToSidebarItems = (categories, categoryId) => {
  const category = categories.find((item) => item.id === categoryId);
  return (category?.modules || []).map((module) => ({
    label: module.label,
    icon: module.icon || HiOutlineViewGrid,
    plan: module.plan,
    planAccessMode: module.planAccessMode,
    categoryId,
    moduleId: module.id,
    children: module.children?.length
      ? module.children.map((child) => ({
          label: child.label,
          icon: child.icon || module.icon || HiOutlineViewGrid,
          plan: child.plan || module.plan,
          planAccessMode: child.planAccessMode || module.planAccessMode,
          categoryId,
          moduleId: child.id,
          parentModuleId: module.id,
        }))
      : undefined,
  }));
};

const becomeNomadItem = [{ label: "Become a Nomad", icon: HiOutlineViewGrid }];

const hostLoginPrompt = {
  description:
    "Login to manage your host tools, listings, operations, and business setup.",
  actionLabel: "Login as Business",
};

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
  const { categories } = useHostModuleCatalog({ liveRefresh: true });
  const catalogSidebarSections = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        label: category.label,
        items: categoryToSidebarItems(categories, category.id),
      })),
    [categories],
  );
  const modulesOverviewItems = useMemo(
    () => [
      ...categoryToSidebarItems(categories, "key-apps").slice(0, 2),
      ...categoryToSidebarItems(categories, "department-accesses"),
    ],
    [categories],
  );
  const [collapsed, setCollapsed] = useState(true);
  // The sidebar transition changes available width without a window resize.
  // Recalculate responsive text once that transition has settled.
  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event("resize")), 320);
    return () => clearTimeout(timer);
  }, [collapsed]);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [openCatalogSections, setOpenCatalogSections] = useState({});
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
  useEffect(() => {
    if (normalizedPath === "/home") {
      setIsRecommendationsOpen(false);
      return;
    }

    setIsRecommendationsOpen(true);
    if (normalizedPath === "/modules") {
      const categoryId = new URLSearchParams(location.search).get("category");
      if (categoryId) {
        setOpenCatalogSections((current) => ({
          ...current,
          [categoryId]: true,
        }));
      }
    }
  }, [location.search, normalizedPath]);

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
    if (item?.categoryId && item?.moduleId) {
      const plan = item.plan || selectedModulesPlan || "basic";
      navigate(
        `/modules?plan=${plan}&category=${item.categoryId}&module=${item.moduleId}`,
      );
      if (isMobileOverlay) onClose?.();
      return;
    }

    const match = findModuleByLabel(item?.label, categories);
    if (match) {
      const plan = planForLabel(item?.label, categories) || selectedModulesPlan || "basic";
      navigate(`/modules?plan=${plan}&category=${match.categoryId}&module=${match.moduleId}`);
      if (isMobileOverlay) onClose?.();
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

  const isCollapsed = isMobileOverlay ? false : collapsed;

  // A module selected on /modules (?category=&module=) shows as the
  // selected item here too, by matching its label against the real
  // catalog — same mapping handleSidebarItemClick uses to get there.
  const activeModuleParam =
    normalizedPath === "/modules"
      ? new URLSearchParams(location.search).get("module")
      : null;
  const isModuleActive = (item) => {
    if (!activeModuleParam) return false;
    if (item.moduleId) return item.moduleId === activeModuleParam;
    const match = findModuleByLabel(item.label, categories);
    return Boolean(match && match.moduleId === activeModuleParam);
  };

  // Active state logic for recommendations. The sidebar is a fixed, custom
  // menu — it does not filter items in or out as the /modules plan changes,
  // so no plan is passed to filterSidebarItemsForPlan here.
  const recommendationItemsWithActivePath = modulesOverviewItems.map((item) => {
    const moduleActive = isModuleActive(item);
    return { ...item, active: moduleActive };
  });

  const catalogSectionsWithActivePath = catalogSidebarSections.map((section) => {
    const items = section.items.map((item) => {
      const children = item.children?.map((child) => ({
        ...child,
        active: isModuleActive(child),
      }));
      return {
        ...item,
        children,
        active:
          isModuleActive(item) || Boolean(children?.some((child) => child.active)),
      };
    });

    return {
      ...section,
      items,
    };
  });

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

      {catalogSectionsWithActivePath.map((section) =>
        section.items.length > 0 ? (
          <SidebarSection
            key={section.id}
            title={section.label}
            items={section.items}
            collapsed={isCollapsed}
            isExpandable
            isOpen={Boolean(openCatalogSections[section.id])}
            onToggle={() =>
              setOpenCatalogSections((current) => ({
                ...current,
                [section.id]: !current[section.id],
              }))
            }
            onItemClick={(item) => handleSidebarItemClick(item, section.id)}
            onTooltipChange={setTooltip}
          />
        ) : null,
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
