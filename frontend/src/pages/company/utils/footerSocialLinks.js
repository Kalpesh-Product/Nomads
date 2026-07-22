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

export const getEnabledFooterSocials = (socials) =>
  FOOTER_SOCIAL_PLATFORMS.map((platform) => {
    const entry = socials?.[platform.key];
    if (entry?.enabled !== true) return null;

    const href = getSocialHref(platform.key, entry?.link);
    return href ? { ...platform, href } : null;
  }).filter(Boolean);
