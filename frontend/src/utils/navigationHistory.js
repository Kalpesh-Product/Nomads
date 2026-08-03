export const canNavigateBackWithinApp = () => {
  if (typeof window === "undefined") return false;

  const historyIndex = window.history?.state?.idx;
  return typeof historyIndex === "number" && historyIndex > 0;
};

export const navigateBackWithinApp = (navigate) => {
  if (!canNavigateBackWithinApp()) return false;

  navigate(-1);
  return true;
};
