// Contribution statuses are reviewed in the Master Panel. Refetch the
// contributor's own submissions while these screens are open so pending,
// approved and rejected badges update without a manual page refresh.
export const CONTRIBUTION_REFRESH_INTERVAL = 15000;

export const contributionRefreshOptions = {
  refetchInterval: CONTRIBUTION_REFRESH_INTERVAL,
  refetchOnWindowFocus: "always",
};
