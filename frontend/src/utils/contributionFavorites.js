export const rankContributionsByFavorites = (entries, counts) => {
  const countsByItem = new Map(counts.map(({ kind, contentId, favoritesCount }) => [
    `${kind}:${contentId}`, favoritesCount,
  ]));
  return entries.map((entry) => ({
    ...entry,
    favoritesCount: countsByItem.get(
      `${entry.config.key === "places" ? "place" : entry.config.key}:${entry.item._id || entry.item.id}`,
    ) || 0,
  })).sort((a, b) => b.favoritesCount - a.favoritesCount);
};
