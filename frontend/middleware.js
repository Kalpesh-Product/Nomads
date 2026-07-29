// Vercel Edge Middleware.
// Serves a small static HTML page with Open Graph tags to social-media link
// preview crawlers (WhatsApp, Facebook, Twitter/X, LinkedIn, Slack, etc.) for
// listing pages, since those crawlers don't execute JavaScript and can't see
// the SPA's client-side <Helmet> tags. Real browser traffic is untouched and
// falls through to the normal SPA.

export const config = {
  matcher: "/listings/:company*",
};

const BOT_UA_PATTERN =
  /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|SkypeUriPreview|vkShare|redditbot/i;

const API_BASE =
  process.env.VITE_PROD_LINK || "https://wononomadsbe.vercel.app/api/";

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(str = "", max = 160) {
  const collapsed = str.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) return collapsed;
  return collapsed.slice(0, max - 1).trimEnd() + "…";
}

export default async function middleware(request) {
  const userAgent = request.headers.get("user-agent") || "";

  if (!BOT_UA_PATTERN.test(userAgent)) {
    return; // not a crawler, let the SPA handle it as usual
  }

  const url = new URL(request.url);
  const companySegment = url.pathname
    .replace("/listings/", "")
    .split("/")[0];
  const companyName = decodeURIComponent(companySegment);
  const companyType = url.searchParams.get("companyType") || "";

  let ogData = null;
  try {
    const apiUrl = new URL("company/og-data", API_BASE);
    apiUrl.searchParams.set("companyName", companyName);
    if (companyType) apiUrl.searchParams.set("companyType", companyType);

    const res = await fetch(apiUrl.toString());
    if (res.ok) {
      ogData = await res.json();
    }
  } catch (err) {
    // fall through to defaults below on any network/API failure
  }

  const listingName = ogData?.companyTitle || companyName || "Nomad listing";
  const title = escapeHtml(`${listingName} | Nomads by WONO`);
  const description = escapeHtml(
    `${truncate(
      ogData?.about ||
        "Discover spaces and experiences built for digital nomads.",
      112,
    ).replace(/[.!?]+$/, "")}. Explore on Nomads by WONO - wono.co.`,
  );
  const image = ogData?.image || "https://www.wono.co/email-logo-wono.png";
  const pageUrl = url.toString();

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:url" content="${escapeHtml(pageUrl)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Nomads by WONO" />
<meta property="og:image:secure_url" content="${escapeHtml(image)}" />
<meta property="og:image:alt" content="${escapeHtml(listingName)} hero image" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
</head>
<body>
${title}
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
