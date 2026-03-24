import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearStoredLoginState,
  readStoredLoginState,
} from "../hooks/useNomadLoginState";
import {
  HiChevronDown,
  HiChevronUp,
  HiOutlineMenu,
  HiOutlineViewGrid,
  HiOutlineCog,
  HiOutlineHeart,
  HiOutlineUserCircle,
  HiOutlineKey,
  HiOutlineLogout,
} from "react-icons/hi";
import { LuCircleDollarSign, LuMapPinned } from "react-icons/lu";

const gatedRecommendationLabels = new Set([
  "Work From Anywhere",
  "Increase Your Savings",
  "Advance Your Career",
  "Find Your Community",
]);

const recommendationItems = [
  { label: "World Ranking", icon: HiOutlineViewGrid, path: "/home" },
  {
    label: "Work From Anywhere",
    icon: HiOutlineHeart,
    path: "/search/home",
  },
  {
    label: "Increase Your Savings",
    icon: LuCircleDollarSign,
    path: "/home",
  },
  { label: "Advance Your Career", icon: LuMapPinned, path: "/home" },
  {
    label: "Find Your Community",
    icon: HiOutlineUserCircle,
    path: "/home",
  },
  { label: "Search Old School", icon: HiOutlineMenu, path: "/" },
];
const valueAdditionItems = [
  { label: "VISA Support", icon: LuMapPinned, path: "/visa-support" },
  {
    label: "Help you get activated",
    icon: HiOutlineKey,
    path: "/help-you-get-activated",
  },
  { label: "Company Setup", icon: HiOutlineCog },
  { label: "Apply for Job", icon: HiOutlineUserCircle },
  { label: "Consultation", icon: LuCircleDollarSign, path: "/consultation" },
  { label: "Become A Host", icon: HiOutlineViewGrid },
];

const loggedOutPrompt = {
  title: "Get responses tailored to you",
  description:
    "Log in to get answers based on saved chats, plus create images and upload files.",
  actionLabel: "Log in",
};

const profileItems = [
  { label: "Abrar Shaikh", icon: HiOutlineUserCircle, active: true },
  { label: "Settings", icon: HiOutlineCog },
  { label: "Favorites", icon: HiOutlineHeart },
  { label: "Reviews", icon: LuCircleDollarSign },
  { label: "Change Password", icon: HiOutlineKey },
];

const signOutItem = [{ label: "Sign Out", icon: HiOutlineLogout }];

const SidebarSection = ({
  title,
  items,
  collapsed,
  isExpandable = false,
  isOpen = true,
  onToggle,
  onItemClick,
}) => {
  const ChevronIcon = isOpen ? HiChevronUp : HiChevronDown;

  return (
    <div className="px-4 pt-3">
      <div className="border-t border-black/10 pt-2">
        {collapsed ? null : isExpandable ? (
          <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-black/80 transition hover:text-black"
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
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[22px] transition  ${
                    item.active
                      ? "bg-white text-black shadow-sm"
                      : "text-black/80 hover:bg-white/70"
                  }`}
                  title={collapsed ? item.label : ""}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <span className="text-xs font-medium ">{item.label}</span>
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

const AiSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(true);
  const [isValueAdditionsOpen, setIsValueAdditionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const isLoggedIn =
    searchParams.get("login") === "true" || readStoredLoginState();

  const handleRecommendationClick = (item) => {
    const params = new URLSearchParams(location.search);

    if (!isLoggedIn && gatedRecommendationLabels.has(item.label)) {
      navigate(`/ai-login${location.search}`);
      return;
    }

    navigate({
      pathname: item.path || "/home",
      search: params.toString() ? `?${params.toString()}` : "",
    });
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

  const handleSignOutClick = () => {
    const nextSearchParams = new URLSearchParams(location.search);
    nextSearchParams.delete("login");
    clearStoredLoginState();

    navigate({
      pathname: location.pathname,
      search: nextSearchParams.toString()
        ? `?${nextSearchParams.toString()}`
        : "",
    });
  };

  return (
    <aside
      className={`flex h-full flex-col border-r border-black/10 bg-[#efefef] transition-all duration-300 ${
        collapsed ? "w-[70px]" : "w-[260px]"
      }`}
    >
      <div className="px-4 py-4">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded p-1 text-black/80 hover:bg-black/5"
          aria-label="Toggle sidebar"
        >
          <HiOutlineMenu size={24} />
        </button>
      </div>

      <SidebarSection
        title="Nomad Recommendations"
        items={recommendationItems}
        collapsed={collapsed}
        isExpandable
        isOpen={isRecommendationsOpen}
        onToggle={() => setIsRecommendationsOpen((prev) => !prev)}
        onItemClick={handleRecommendationClick}
      />
      <SidebarSection
        title="Value Additions"
        items={valueAdditionItems}
        collapsed={collapsed}
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
            collapsed={collapsed}
            isExpandable
            isOpen={isProfileOpen}
            onToggle={() => setIsProfileOpen((prev) => !prev)}
          />
          <SidebarSection
            items={signOutItem}
            collapsed={collapsed}
            onItemClick={handleSignOutClick}
          />
        </>
      ) : (
        !collapsed && (
          <div className="mt-auto px-4 pb-4 pt-10">
            <div className="rounded-[28px]   p-4 shadow-sm">
              <h3 className="text-[13px] font-semibold leading-tight text-black/90">
                {loggedOutPrompt.title}
              </h3>
              <p className="mt-4 text-nano leading-7 text-black/55">
                {loggedOutPrompt.description}
              </p>
              <button
                type="button"
                onClick={handleLogInClick}
                className="mt-6 w-full rounded-full border border-black/10 bg-white px-3 py-2 text-base font-semibold text-black transition hover:bg-black hover:text-white"
              >
                {loggedOutPrompt.actionLabel}
              </button>
            </div>
          </div>
        )
      )}
    </aside>
  );
};

export default AiSidebar;
