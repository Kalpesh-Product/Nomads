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
        label: "Home",
        icon: TbAward,
        path: "/host/ai-host-home",
    },
    {
        label: "Dashboard",
        icon: FaGlobeAmericas,
        path: "/host/ai-host-modules",
    },
    {
        label: "Attendance",
        icon: HiOutlineCurrencyDollar,
        path: "/host/ai-host-themes",
    },
    {
        label: "Tasks",
        icon: MdOutlineWorkHistory,
        path: "/host/ai-host-leads",
    },
    {
        label: "Tickets",
        icon: RiUserCommunityLine,
        path: "/host/ai-host-career",
    },
    {
        label: "My Calendar",
        icon: RiUserCommunityLine,
        path: "/host/ai-host-career",
    },
    {
        label: "Leave Requests",
        icon: HiOutlineCurrencyDollar,
        path: "/host/ai-host-career",
    },
    {
        label: "Meeting Room Booking",
        icon: HiOutlineCurrencyDollar,
        path: "/host/ai-host-career",
    },
    {
        label: "Reports",
        icon: TbAward,
        path: "/host/ai-host-career",
    },
];

const valueAdditionItems = [
    { label: "Extra Common Modules", icon: LuMapPinned, path: "/host/extra-common-modules" },
    {
        label: "Assets",
        icon: HiOutlineKey,
        path: "/host/assets",
    },
    {
        label: "Inventory",
        icon: HiOutlineCog,
        path: "/host/inventory",
    },
    { label: "Finance Management", icon: LuCircleDollarSign, path: "/host/finance-management" },
];

const valueAdditionItems1 = [
    { label: "Organization Management", icon: LuMapPinned, path: "/host/organization-management" },
    { label: "Module Management", icon: LuMapPinned, path: "/host/module-management" },
    { label: "Access Grants", icon: LuMapPinned, path: "/host/access-grants" },
    { label: "Workspace Settings", icon: LuMapPinned, path: "/host/workspace-settings" },
    { label: "Analytics", icon: LuMapPinned, path: "/host/analytics" },
];

const valueAdditionItems2 = [
    { label: "HR Department", icon: LuMapPinned, path: "/host/hr-department" },
    { label: "Administration Department", icon: LuMapPinned, path: "/host/administration-department" },
    { label: "Sales Department", icon: LuMapPinned, path: "/host/sales-department" },
    { label: "Maintenance Department", icon: LuMapPinned, path: "/host/maintenance-department" },
    { label: "Finance Department", icon: LuMapPinned, path: "/host/finance-department" },
    { label: "IT Department", icon: LuMapPinned, path: "/host/it-department" },
    { label: "HR Department", icon: LuMapPinned, path: "/host/hr-department" },
    { label: "Tech Department", icon: LuMapPinned, path: "/host/tech-department" },
];

const becomeHostItem = [{ label: "Become A Host", icon: HiOutlineViewGrid }];

const loggedOutPrompt = {
    title: "Get responses tailored to you",
    description:
        "Login to explore your nomad lifestyle and discover where you should live, work, and save more.",
    actionLabel: "Login",
};

const profileItems = [
    { label: "userFullName", icon: HiOutlineUserCircle, tab: "profile" },
    { label: "Favorites", icon: HiOutlineHeart, tab: "favorites" },
    { label: "Reviews", icon: LuCircleDollarSign, tab: "reviews" },
    { label: "Change Password", icon: HiOutlineKey, tab: "password" },
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
    compact = false,
    onToggle,
    onItemClick,
}) => {
    const ChevronIcon = isOpen ? HiChevronUp : HiChevronDown;
    const shouldShowItems = collapsed ? true : !isExpandable || isOpen;

    return (
        <div className={`px-4 ${compact ? "pt-0" : "pt-3"}`}>
            <div
                className={`${showTopBorder && !compact ? "border-t border-black/10" : ""} ${compact ? "pt-0" : "pt-2"}`}
            >
                {collapsed ? null : isExpandable ? (
                    <button
                        type="button"
                        onClick={onToggle}
                        className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-black/80"
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
                                    className={`group relative flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left transition-all hover:bg-white ${isActive ? "bg-white text-black shadow-sm" : "text-black/80"
                                        }`}
                                    title={collapsed ? item.label : ""}
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
    const [collapsed, setCollapsed] = useState(false);
    const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(true);
    const [isValueAdditionsOpen, setIsValueAdditionsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const { auth } = useAuth();
    const logout = useLogout();
    const userFullName =
        auth?.user?.fullName?.trim() || "Profile";

    const profileItemsWithUserName = profileItems.map((item) =>
        item.label === "userFullName" ? { ...item, label: userFullName } : item,
    );

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

        if (isAiHomePage) {
            setIsRecommendationsOpen(false);
            setIsValueAdditionsOpen(true);
            return;
        }

        setIsRecommendationsOpen(true);
        if (isValueAddedPage) {
            setIsValueAdditionsOpen(true);
        }
    }, [location.pathname]);

    const isLoggedIn = Boolean(auth?.user) || readStoredLoginState();
    console.log(isLoggedIn);

    const handleRecommendationClick = (item) => {
        const params = new URLSearchParams(location.search);
        const targetSearch = params.toString() ? `?${params.toString()}` : "";
        const targetRoute = `${item.path || "/search/results"}${targetSearch}`;

        if (!isLoggedIn && gatedRecommendationLabels.has(item.label)) {
            const goalSlug = goalSlugByLabel[item.label];
            const loginPath = goalSlug ? `/ai-login/${goalSlug}` : "/ai-login";

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
            pathname: "/ai-profile",
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

    const valueAdditionItemsWithActivePath1 = valueAdditionItems1.map((item) => {
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

    const valueAdditionItemsWithActivePath2 = valueAdditionItems2.map((item) => {
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
            className={`flex h-full max-h-screen flex-col overflow-y-auto overscroll-contain border-r border-black/10 bg-[#efefef] transition-all duration-300 custom-scrollbar-hide ${isMobileOverlay
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
                title="Host Dashboard"
                items={recommendationItemsWithActivePath}
                collapsed={isCollapsed}
                isExpandable
                isOpen={isRecommendationsOpen}
                onToggle={() => setIsRecommendationsOpen((prev) => !prev)}
                onItemClick={handleRecommendationClick}
            />

            <SidebarSection
                title="Extra Common Modules"
                items={valueAdditionItemsWithActivePath}
                collapsed={isCollapsed}
                isExpandable
                isOpen={isValueAdditionsOpen}
                onToggle={() => setIsValueAdditionsOpen((prev) => !prev)}
                onItemClick={handleValueAdditionClick}
            />

            <SidebarSection
                title="Common Modules"
                items={valueAdditionItemsWithActivePath1}
                collapsed={isCollapsed}
                isExpandable
                isOpen={isValueAdditionsOpen}
                onToggle={() => setIsValueAdditionsOpen((prev) => !prev)}
                onItemClick={handleValueAdditionClick}
            />

            <SidebarSection
                title="Department Access"
                items={valueAdditionItemsWithActivePath2}
                collapsed={isCollapsed}
                isExpandable
                isOpen={isValueAdditionsOpen}
                onToggle={() => setIsValueAdditionsOpen((prev) => !prev)}
                onItemClick={handleValueAdditionClick}
            />

            {isLoggedIn ? (
                <>
                    {/* <SidebarSection
                        title="Profile"
                        items={profileItemsWithUserName}
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
                    <div className="mx-4 border-t border-black/10"></div>
                    {/* <SidebarSection
                        items={becomeHostItem}
                        collapsed={isCollapsed}
                        onItemClick={handleBecomeHostClick}
                        compact={true}
                    /> */}
                    <div className="mx-4 border-t border-black/10"></div>
                    <SidebarSection
                        items={signOutItem}
                        collapsed={isCollapsed}
                        onItemClick={handleSignOutClick}
                        compact={true}
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
                    />
                    <div className="mx-4 border-t border-black/10"></div>
                    <SidebarSection
                        items={becomeHostItem}
                        collapsed={isCollapsed}
                        onItemClick={handleBecomeHostClick}
                        compact={true}
                    />
                    {/* <div className="border-t border-black/10 mt-4 mx-4"></div> */}
                    <div className="border-t border-black/10 mx-4"></div>
                    {!isCollapsed && (
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
                    )}
                </>
            )}
        </aside>
    );
};

export default AiSidebar;