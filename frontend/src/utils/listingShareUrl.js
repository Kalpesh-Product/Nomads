const DEFAULT_SHARE_API_BASE = "https://wononomadsbe.vercel.app/api/";

export const buildCanonicalListingUrl = ({
  currentUrl,
  companyType,
  fallbackUrl = "",
}) => {
  if (!currentUrl) return fallbackUrl;

  try {
    const listingUrl = new URL(currentUrl);
    if (companyType) {
      listingUrl.searchParams.set("companyType", companyType);
    }
    return listingUrl.toString();
  } catch {
    return fallbackUrl;
  }
};

export const buildListingShareUrl = ({
  apiBaseUrl,
  companyName,
  companyType,
  canonicalUrl,
}) => {
  if (!companyName) return canonicalUrl;

  try {
    const browserOrigin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://www.wono.co";
    const normalizedBase = new URL(
      apiBaseUrl || DEFAULT_SHARE_API_BASE,
      browserOrigin,
    );
    if (!normalizedBase.pathname.endsWith("/")) {
      normalizedBase.pathname += "/";
    }

    const shareUrl = new URL("company/share-listing", normalizedBase);
    shareUrl.searchParams.set("companyName", companyName);
    if (companyType) {
      shareUrl.searchParams.set("companyType", companyType);
    }

    return shareUrl.toString();
  } catch {
    return canonicalUrl;
  }
};
