const DEFAULT_FRONTEND_ORIGIN = "https://www.wono.co";
const DEFAULT_IMAGE = "https://www.wono.co/email-logo-wono.png";
const BRAND_NAME = "Nomads by WONO";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const collapseWhitespace = (value = "") =>
  String(value).replace(/\\n/g, " ").replace(/\s+/g, " ").trim();

export const truncateShareDescription = (value = "", maxLength = 112) => {
  const text = collapseWhitespace(value);
  if (text.length <= maxLength) return text;

  const shortened = text.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  const boundary =
    lastSpace >= Math.floor(maxLength * 0.65)
      ? lastSpace
      : shortened.length;

  return `${shortened.slice(0, boundary).trimEnd()}...`;
};

const resolveFrontendOrigin = (frontendOrigin) => {
  try {
    return new URL(frontendOrigin || DEFAULT_FRONTEND_ORIGIN).origin;
  } catch {
    return DEFAULT_FRONTEND_ORIGIN;
  }
};

const resolveImageUrl = (company) => {
  const image =
    (Array.isArray(company?.images) && company.images[0]?.url) ||
    company?.logo?.url ||
    company?.logo ||
    DEFAULT_IMAGE;

  try {
    return new URL(image).toString();
  } catch {
    return DEFAULT_IMAGE;
  }
};

export const buildListingShareData = (
  company,
  frontendOrigin = process.env.NOMADS_FRONTEND_URL,
) => {
  const origin = resolveFrontendOrigin(frontendOrigin);
  const listingName =
    collapseWhitespace(company?.companyTitle) ||
    collapseWhitespace(company?.companyName) ||
    "Nomad listing";
  const companyName = collapseWhitespace(company?.companyName) || listingName;

  const listingUrl = new URL(
    `/listings/${encodeURIComponent(companyName)}`,
    origin,
  );
  if (company?.companyType) {
    listingUrl.searchParams.set("companyType", company.companyType);
  }

  const location = [
    collapseWhitespace(company?.city),
    collapseWhitespace(company?.country),
  ]
    .filter(Boolean)
    .join(", ");
  const fallbackDescription = [
    company?.companyType
      ? `${collapseWhitespace(company.companyType)} listing`
      : "Nomad listing",
    location ? `in ${location}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const summary =
    truncateShareDescription(company?.about) || fallbackDescription;
  const summarySentence = /[.!?]$/.test(summary)
    ? summary
    : `${summary}.`;

  return {
    title: `${listingName} | ${BRAND_NAME}`,
    description: `${summarySentence} Explore on ${BRAND_NAME} - wono.co.`,
    image: resolveImageUrl(company),
    imageAlt: `${listingName} hero image`,
    listingName,
    listingUrl: listingUrl.toString(),
    siteName: BRAND_NAME,
  };
};

export const renderListingSharePage = (shareData) => {
  const title = escapeHtml(shareData.title);
  const description = escapeHtml(shareData.description);
  const image = escapeHtml(shareData.image);
  const imageAlt = escapeHtml(shareData.imageAlt);
  const listingUrl = escapeHtml(shareData.listingUrl);
  const siteName = escapeHtml(shareData.siteName);
  const listingName = escapeHtml(shareData.listingName);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${listingUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:alt" content="${imageAlt}" />
  <meta property="og:url" content="${listingUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${imageAlt}" />
  <meta http-equiv="refresh" content="0;url=${listingUrl}" />
</head>
<body>
  <p>Opening <a href="${listingUrl}">${listingName}</a> on ${siteName}...</p>
  <script>window.location.replace(${JSON.stringify(shareData.listingUrl)});</script>
</body>
</html>`;
};
