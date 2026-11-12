import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "../styles/driverGuide.css";

let activeGuide = null;

const removeDriverDom = () => {
  if (typeof document === "undefined") {
    return;
  }

  document
    .querySelectorAll(".driver-overlay, .driver-popover, #driver-dummy-element")
    .forEach((element) => element.remove());

  document.body.classList.remove(
    "driver-active",
    "driver-fade",
    "driver-simple",
    "driver-no-scroll",
  );
  document.body.style.removeProperty("--driver-animation-duration");

  document.querySelectorAll(".driver-active-element").forEach((element) => {
    const parent = element.parentElement;

    if (parent && parent !== document.body) {
      parent.classList.remove(
        "driver-active-element-parent",
        "driver-active-element-parent-no-scroll",
      );
    }

    element.classList.remove("driver-active-element", "driver-no-interaction");
    element.removeAttribute("aria-haspopup");
    element.removeAttribute("aria-expanded");
    element.removeAttribute("aria-controls");
  });
};

export const destroyActiveGuide = () => {
  const guide = activeGuide;
  activeGuide = null;

  if (typeof guide?.destroy === "function") {
    guide.destroy();
  }

  removeDriverDom();
};

export const installGuideNavigationCleanup = () => {
  if (typeof document === "undefined") {
    return () => {};
  }

  const handlePotentialNavigation = (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest(".driver-popover")) {
      return;
    }

    if (target.closest("a[href]")) {
      destroyActiveGuide();
    }
  };

  document.addEventListener("click", handlePotentialNavigation, true);

  return () => {
    document.removeEventListener("click", handlePotentialNavigation, true);
  };
};

export const hasSeenDriverGuide = (guideSeenKey) => {
  if (typeof window === "undefined" || !guideSeenKey) {
    return false;
  }

  return window.localStorage.getItem(guideSeenKey) === "1";
};

export const markDriverGuideSeen = (guideSeenKey) => {
  if (typeof window === "undefined" || !guideSeenKey) {
    return;
  }

  window.localStorage.setItem(guideSeenKey, "1");
};

export const createDriverGuide = (options) => {
  const { guideSeenKey, ...driverOptions } = options;

  if (hasSeenDriverGuide(guideSeenKey)) {
    return null;
  }

  destroyActiveGuide();

  let guide;
  guide = driver({
    ...driverOptions,
    popoverClass: ["wono-driver-popover", driverOptions.popoverClass]
      .filter(Boolean)
      .filter((className, index, classes) => classes.indexOf(className) === index)
      .join(" "),
    onDestroyed: (...args) => {
      if (activeGuide === guide) {
        activeGuide = null;
      }

      driverOptions.onDestroyed?.(...args);
    },
  });

  activeGuide = guide;
  markDriverGuideSeen(guideSeenKey);
  return guide;
};
