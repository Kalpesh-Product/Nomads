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
import { CgWebsite } from "react-icons/cg";
import { IoMdChatbubbles } from "react-icons/io";
import { TbCalendarUser } from "react-icons/tb";
import { MdOutlineSupportAgent } from "react-icons/md";
import { MdMeetingRoom } from "react-icons/md";
import { RiApps2AiLine } from "react-icons/ri";
import { TiSpanner } from "react-icons/ti";
import { FaDesktop } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { BsPeopleFill } from "react-icons/bs";
import { MdAccountBalance } from "react-icons/md";
import { MdOutlineHandshake } from "react-icons/md";
import { BsPersonVcard } from "react-icons/bs";

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

const hostSignupEntryPath = "/host/ai-host-signup?step=0";

const recommendationItems = [
    {
        label: "Build & Manage Website",
        icon: CgWebsite,
        path: "/host/ai-host-website-builder",
    },
    {
        label: "Sales Management",
        icon: MdOutlineHandshake,
        path: "/host/ai-host-modules",
    },
    {
        label: "Finance Suite",
        icon: MdAccountBalance,
        path: "/host/ai-host-themes",
    },
    {
        label: "Operations Module",
        icon: IoSettingsOutline,
        path: "/host/ai-host-leads",
    },
    {
        label: "HR Management System",
        icon: BsPeopleFill,
        path: "/host/ai-host-career",
    },
    {
        label: "IT Infrastructure Module",
        icon: FaDesktop,
        path: "/host/ai-host-calendar",
    },
    {
        label: "Maintenance Module",
        icon: TiSpanner,
        suffixText: "...More",
    },
];

const valueAdditionItems = [
    {
        label: "AI Apps - Automation",
        icon: RiApps2AiLine,
        path: "/host/extra-common-modules",
    },
    {
        label: "Meeting Room System",
        icon: MdMeetingRoom,
        path: "/host/extra-common-modules",
    },
    {
        label: "Visitor Management",
        icon: BsPersonVcard,
        path: "/host/assets",
    },
    {
        label: "Ticketing System",
        icon: MdOutlineSupportAgent,
        path: "/host/inventory",
    },
    {
        label: "Smart Calendar",
        icon: TbCalendarUser,
        path: "/host/finance-management",
    },
    {
        label: "Chat Bot",
        icon: IoMdChatbubbles,
        suffixText: "...More",
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
    const navigate = useNavigate();

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
                                            {item.suffixText && (
                                                <span className="ml-auto text-[12px] font-medium tracking-wide text-black/55">
                                                    <button onClick={() => navigate(hostSignupEntryPath)} className="hover:text-primary-blue">{item.suffixText}</button>
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
        navigate(hostSignupEntryPath);
    };

    const handleValueAdditionClick = (item) => {
        navigate(hostSignupEntryPath);
    };

    const handleProfileClick = (item) => {
        if (!item.tab) return;

        const params = new URLSearchParams(location.search);
        params.set("tab", item.tab);

        navigate({
            pathname: "/host/ai-host-profile",
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
                title="Modules"
                items={recommendationItemsWithActivePath}
                collapsed={isCollapsed}
                isExpandable
                isOpen={isRecommendationsOpen}
                onToggle={() => setIsRecommendationsOpen((prev) => !prev)}
                onItemClick={handleRecommendationClick}
            />

            <SidebarSection
                title="Key Apps"
                items={valueAdditionItemsWithActivePath}
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
        </aside>
    );
};

export default AiSidebar;
