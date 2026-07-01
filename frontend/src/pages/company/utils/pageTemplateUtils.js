import { getMediaSrc, normalizeSlug } from "./templateRouteUtils";

export const getMediaUrl = (item) => getMediaSrc(item);

const normalizeCatalogItem = (item, fallbackType = "") => {
  const rawImages = item?.images || item?.image;
  const images = Array.isArray(rawImages)
    ? rawImages
    : rawImages
      ? [rawImages]
      : [];

  return {
    ...item,
    slug: normalizeSlug(item?.slug || item?.name || item?.title || "", ""),
    name:
      String(item?.name || item?.title || item?.heading || item?.category || fallbackType)
        .trim(),
    type: String(item?.type || item?.category || fallbackType).trim(),
    cost: String(item?.cost || item?.price || "").trim(),
    description: String(item?.description || "").trim(),
    cardImage:
      getMediaSrc(item?.cardImage) ||
      getMediaSrc(item?.homeCardImage) ||
      getMediaSrc(item?.heroImage) ||
      getMediaSrc(images?.[0]),
    images,
  };
};

export const mapTestimonialItem = (item) => {
  if (!item) return null;
  return {
    key: String(item?._id || item?.upstreamReviewId || item?.id || "").trim(),
    image: getMediaUrl(item?.reviewerImage || item?.image),
    name:
      String(
        item?.reviewerName ||
          item?.reviewreName ||
          item?.fullName ||
          item?.name ||
          "",
      ).trim() || "Reviewer",
    role: String(item?.role || item?.designation || item?.jobPosition || "").trim(),
    text: String(item?.text || item?.review || item?.comment || item?.description || item?.testimony || "").trim(),
    rating: Number(item?.starCount ?? item?.rating ?? item?.rate ?? 0) || 0,
  };
};

export const getApprovedTestimonials = (testimonials = []) => {
  if (!Array.isArray(testimonials)) return [];
  const approved = testimonials.filter((item) => {
    const status =
      typeof item?.status === "string" ? item.status.toLowerCase() : "";
    return !status || status === "approved";
  });
  return approved.map(mapTestimonialItem).filter(Boolean);
};

export const getPreviewTestimonials = (data, approvedReviews = []) => {
  return [...getApprovedTestimonials(data?.testimonials), ...approvedReviews];
};

export const getEnabledProductPages = (pages = []) => {
  if (!Array.isArray(pages)) return [];
  return pages
    .map((item) => ({
      ...item,
      name: typeof item?.name === "string" ? item.name.trim() : "",
      slug: normalizeSlug(item?.slug || item?.name, ""),
      enabled: item?.enabled !== false,
    }))
    .filter((item) => item?.enabled !== false && item?.slug && item?.name);
};

export const getCatalogItemsForProductPage = (data, page) => {
  const slug = normalizeSlug(page?.slug || page?.name || "", "");
  if (slug.includes("cafe")) {
    return Array.isArray(data?.menuItems)
      ? data.menuItems.map((item) => normalizeCatalogItem(item, "Cafe"))
      : [];
  }

  if (slug.includes("co-living") || slug.includes("coliving")) {
    return Array.isArray(data?.coLivingRooms)
      ? data.coLivingRooms.map((item) => normalizeCatalogItem(item, "Co-Living"))
      : [];
  }

  if (slug.includes("meeting")) {
    const meetingRooms = Array.isArray(data?.meetingRooms) ? data.meetingRooms : [];
    const rooms = Array.isArray(data?.rooms) ? data.rooms : [];
    return [...meetingRooms, ...rooms].map((item) =>
      normalizeCatalogItem(item, "Meeting Room"),
    );
  }

  if (slug.includes("workation")) {
    return Array.isArray(data?.packages)
      ? data.packages.map((item) => normalizeCatalogItem(item, "Package"))
      : [];
  }

  if (slug.includes("hostel")) {
    return Array.isArray(data?.dorms)
      ? data.dorms.map((item) => normalizeCatalogItem(item, "Dorm"))
      : [];
  }

  return Array.isArray(data?.products)
    ? data.products.map((item) => normalizeCatalogItem(item, "Product"))
    : [];
};

export const getPageHeroImages = (page) => {
  if (Array.isArray(page?.heroImages) && page.heroImages.length > 0) {
    return page.heroImages.map(getMediaUrl).filter(Boolean);
  }
  const fallback = getMediaUrl(page?.heroImage);
  if (fallback) return [fallback];
  const cardFallback = getMediaUrl(page?.cardImage || page?.homeCardImage);
  return cardFallback ? [cardFallback] : [];
};
