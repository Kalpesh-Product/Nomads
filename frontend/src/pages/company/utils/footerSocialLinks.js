export const FOOTER_SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "twitter", label: "Twitter / X" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "whatsapp", label: "WhatsApp" },
];

export const getSocialHref = (key, link) => {
  const value = String(link || "").trim();
  if (!value) return "";

  if (key === "whatsapp") {
    const number = value.replace(/[^\d]/g, "");
    return number ? `https://wa.me/${number}` : "";
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const isUsableSocialHref = (key, href) => {
  if (!href) return false;
  if (key === "whatsapp") return /^https:\/\/wa\.me\/\d{7,}$/.test(href);
  try {
    const url = new URL(href);
    return /^https?:$/.test(url.protocol) && /\.[a-z]{2,}$/i.test(url.hostname);
  } catch {
    return false;
  }
};

// For the newer templates: every enabled platform keeps its icon; `href` is
// only set when the saved link is a usable URL, so an empty or invalid link
// renders as a plain (non-clickable) icon instead of a broken redirect.
export const getEnabledFooterSocialsWithFallback = (socials) =>
  FOOTER_SOCIAL_PLATFORMS.map((platform) => {
    const entry = socials?.[platform.key];
    if (entry?.enabled !== true) return null;
    const href = getSocialHref(platform.key, entry?.link);
    return { ...platform, href: isUsableSocialHref(platform.key, href) ? href : "" };
  }).filter(Boolean);

export const getEnabledFooterSocials = (socials) =>
  FOOTER_SOCIAL_PLATFORMS.map((platform) => {
    const entry = socials?.[platform.key];
    if (entry?.enabled !== true) return null;

    const href = getSocialHref(platform.key, entry?.link);
    return href ? { ...platform, href } : null;
  }).filter(Boolean);
