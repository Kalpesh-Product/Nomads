const normalizeBadgeKey = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[-_\s]+/g, " ");

export const formatAiSearchBadge = (value = "") => {
  const normalizedValue = normalizeBadgeKey(value);

  if (!normalizedValue) return "";

  const strictLabelMap = {
    coworking: "Co-Working",
    "co working": "Co-Working",
    coliving: "Co-Living",
    "co living": "Co-Living",
    meetingroom: "MeetingRooms",
    "meeting room": "MeetingRooms",
  };

  if (strictLabelMap[normalizedValue]) {
    return strictLabelMap[normalizedValue];
  }

  return normalizedValue
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const dedupeAiSearchBadges = (badges = []) => {
  const seen = new Set();

  return badges
    .map((badge) => formatAiSearchBadge(badge))
    .filter((badge) => {
      if (!badge) return false;

      const badgeKey = normalizeBadgeKey(badge);
      if (seen.has(badgeKey)) return false;

      seen.add(badgeKey);
      return true;
    });
};

export const buildAiSearchBadgesWithLocation = ({
  badges = [],
  selectedStateBadge = "",
}) => {
  const normalizedBadges = dedupeAiSearchBadges(badges);
  const formattedSelectedStateBadge = formatAiSearchBadge(selectedStateBadge);

  if (!formattedSelectedStateBadge) return normalizedBadges;

  const selectedStateKey = normalizeBadgeKey(formattedSelectedStateBadge);
  const badgesWithoutSelectedState = normalizedBadges.filter(
    (badge) => normalizeBadgeKey(badge) !== selectedStateKey,
  );

  return [...badgesWithoutSelectedState, formattedSelectedStateBadge];
};
