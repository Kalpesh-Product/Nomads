export const normalizeVertical = (value) => {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  const compact = raw.replace(/[\s_-]+/g, "");

  if (compact === "cafe") return "cafe";
  if (compact === "coworking") return "co-working";
  if (compact === "coliving") return "co-living";
  if (compact === "meetingrooms") return "meeting-rooms";
  if (compact === "workation") return "workation";
  if (compact === "hostel") return "hostel";

  return "co-working";
};

export const getNavLabelByVertical = (vertical) => {
  const normalized = normalizeVertical(vertical);

  if (normalized === "cafe") return "Menu";
  if (normalized === "co-living") return "Rooms";
  if (normalized === "meeting-rooms") return "Rooms";
  if (normalized === "workation") return "Packages";
  if (normalized === "hostel") return "Dorms";

  return "Products";
};

export const getSectionTitleByVertical = (vertical) => {
  const normalized = normalizeVertical(vertical);

  if (normalized === "cafe") return "Our Menu";
  if (normalized === "co-living") return "Our Rooms";
  if (normalized === "meeting-rooms") return "Our Meeting Rooms";
  if (normalized === "workation") return "Our Packages";
  if (normalized === "hostel") return "Our Dorms";

  return "Our Products";
};
