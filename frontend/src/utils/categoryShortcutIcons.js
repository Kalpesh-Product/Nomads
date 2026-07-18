import { useEffect, useState } from "react";
import newIcons from "../assets/newIcons.js";

const CROPPED_SHORTCUT_ICON_OVERRIDES = {
  annualevents: "/icons-new/Events-cropped.png",
  venues: "/icons-new/Venues-cropped.png",
  news: "/icons-new/News-cropped.png",
  blogs: "/icons-new/Blogs-cropped.png",
};

export const getCategoryShortcutIconSrc = (
  value,
  useCroppedShortcuts = false,
) =>
  useCroppedShortcuts
    ? CROPPED_SHORTCUT_ICON_OVERRIDES[value] || newIcons[value]
    : newIcons[value];

export const useCroppedDesktopShortcutIcons = () => {
  const [useCroppedShortcuts, setUseCroppedShortcuts] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(width: 1024px)");
    const updateShortcutIconMode = () => {
      setUseCroppedShortcuts(mediaQuery.matches);
    };

    updateShortcutIconMode();
    mediaQuery.addEventListener?.("change", updateShortcutIconMode);

    return () => {
      mediaQuery.removeEventListener?.("change", updateShortcutIconMode);
    };
  }, []);

  return useCroppedShortcuts;
};
