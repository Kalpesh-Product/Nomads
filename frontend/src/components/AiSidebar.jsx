import React, { useState } from "react";
import {
  HiOutlineMenu,
  HiOutlineViewGrid,
  HiOutlineCog,
  HiOutlineHeart,
  HiOutlineUserCircle,
  HiOutlineKey,
} from "react-icons/hi";
import { LuCircleDollarSign, LuMapPinned } from "react-icons/lu";

const recommendationItems = [
  { label: "World Rankings", icon: HiOutlineViewGrid, path: "/world-rankings" },
  { label: "Best For You", icon: HiOutlineHeart, path: "/home" },
  { label: "Increase Your Savings", icon: LuCircleDollarSign, path: "/home" },
  { label: "Budget Destinations", icon: LuMapPinned, path: "/home" },
  { label: "Compatible For You", icon: HiOutlineUserCircle, path: "/home" },
  { label: "Search Old Style", icon: HiOutlineMenu, path: "/" },
];

const valueAdditionItems = [
  { label: "Visa Assist", icon: LuMapPinned },
  { label: "Become A Host", icon: HiOutlineViewGrid },
];

const profileItems = [
  { label: "Abrar Shaikh", icon: HiOutlineUserCircle, active: true },
  { label: "Settings", icon: HiOutlineCog },
  { label: "Favorites", icon: HiOutlineHeart },
  { label: "Reviews", icon: LuCircleDollarSign },
  { label: "Change Password", icon: HiOutlineKey },
];

const SidebarSection = ({ title, items, collapsed, onItemClick }) => (
  <div className="px-4 pt-3">
    <div className="border-t border-black/10 pt-2">
      {!collapsed && (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-black/80">
          {title}
        </h3>
      )}
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
    </div>
  </div>
);

const AiSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const handleRecommendationClick = (item) => {
    const targetPath = item.path || "/home";
    window.location.assign(`${window.location.origin}${targetPath}`);
  };

  return (
    <aside
      className={`h-full border-r border-black/10 bg-[#efefef] transition-all duration-300 ${
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
        onItemClick={handleRecommendationClick}
      />
      <SidebarSection
        title="Value Additions"
        items={valueAdditionItems}
        collapsed={collapsed}
      />
      <SidebarSection
        title="Profile"
        items={profileItems}
        collapsed={collapsed}
      />
    </aside>
  );
};

export default AiSidebar;
