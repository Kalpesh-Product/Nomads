// Real vertical-led website templates (same set rendered by
// ../pages/company/verticalTemplates/index.js), kept here so the marketing
// Themes pages can show accurate cards instead of a hand-maintained screenshot
// list. Name/description/swatch are mirrored from WoNoMasterPanel's
// templateRegistry.js so the two stay describing the same thing. heroImage is
// a screenshot of each template's actual home-page hero, captured from its
// seeded demo site (see memory: project_nomads_demo_companies).
export const VERTICAL_TEMPLATE_CATALOG = [
  {
    id: "savor",
    name: "Savor",
    tag: "cafe",
    description:
      "Photo-first and menu-led — category browsing, filters and a built-in reservation flow. Made for cafés, works for any service.",
    swatch: { bg: "#fff7ed", fg: "#2a1a12", accent: "#e4572e", font: "'Bricolage Grotesque', sans-serif" },
    heroImage: "/hosts/themes/savor-hero.jpg",
    heroImageMobile: "/hosts/themes/savor-hero-mobile.jpg",
  },
  {
    id: "wayfarer",
    name: "Wayfarer",
    tag: "hostel",
    description:
      "Booking-led — a search bar in the hero, results-style stay lists with filters and a sticky booking card. Made for hostels, works for any service.",
    swatch: { bg: "#f3fbfa", fg: "#0c2a2e", accent: "#f26b3a", font: "'Sora', sans-serif" },
    heroImage: "/hosts/themes/wayfarer-hero.jpg",
    heroImageMobile: "/hosts/themes/wayfarer-hero-mobile.jpg",
  },
  {
    id: "haven",
    name: "Haven",
    tag: "co-living",
    description:
      "Residence-led — arch-framed photos, room cards with a side-by-side compare view and a visit form on the home page. Made for co-living and workation stays, works for any service.",
    swatch: { bg: "#f4f1ea", fg: "#26312b", accent: "#5b7f6a", font: "'Fraunces', Georgia, serif" },
    heroImage: "/hosts/themes/haven-hero.jpg",
    heroImageMobile: "/hosts/themes/haven-hero-mobile.jpg",
  },
  {
    id: "camelia",
    name: "Camelia",
    tag: "co-living",
    description:
      "Boutique-resort style — a plain top bar, a full-bleed hero and a bold geometric sans paired with a light editorial serif. Made for co-living and workation stays, works for any service.",
    swatch: { bg: "#f6f3ec", fg: "#2b2a26", accent: "#8a9a86", font: "'Poppins', ui-sans-serif, sans-serif" },
    heroImage: "/hosts/themes/camelia-hero.jpg",
    heroImageMobile: "/hosts/themes/camelia-hero-mobile.jpg",
  },
  {
    id: "commons",
    name: "Commons",
    tag: "co-working",
    description:
      "Co-working style — a bold headline over a bento grid, an interactive space explorer and a visit form on the home page. Made for co-working, works for any service.",
    swatch: { bg: "#f6f7f9", fg: "#0b1f3a", accent: "#ffc21a", font: "'Plus Jakarta Sans', sans-serif" },
    heroImage: "/hosts/themes/commons-hero.jpg",
    heroImageMobile: "/hosts/themes/commons-hero-mobile.jpg",
  },
  {
    id: "huddle",
    name: "Huddle",
    tag: "meeting-rooms",
    description:
      "Booking-led — a date, time and duration panel on the home page that filters the rooms, room rows with hourly rates and a rate table. Made for meeting rooms, works for any service.",
    swatch: { bg: "#f5f6f8", fg: "#14161a", accent: "#3b6cf0", font: "'Sora', sans-serif" },
    heroImage: "/hosts/themes/huddle-hero.jpg",
    heroImageMobile: "/hosts/themes/huddle-hero-mobile.jpg",
  },
  {
    id: "travigo",
    name: "Travigo",
    tag: "hostel",
    description:
      "Editorial travel style — oversized typography, circular destination photography, room-led browsing and direct hostel booking.",
    swatch: { bg: "#f5f3ed", fg: "#111111", accent: "#d8ff48", font: "'Manrope', sans-serif" },
    heroImage: "/hosts/themes/travigo-hero.jpg",
    heroImageMobile: "/hosts/themes/travigo-hero-mobile.jpg",
  },
  {
    id: "tulum",
    name: "Tulum",
    tag: "co-living",
    description:
      "Quiet editorial co-living style: a full-bleed video hero with a nightly price, serif headings, sage bands, unit rows and pricing cards. Made for co-living and workation stays, works for any service.",
    swatch: { bg: "#f1f1ed", fg: "#4f5a53", accent: "#8a968f", font: "'Cormorant Upright', serif" },
    heroImage: "/hosts/themes/tulum-hero.jpg",
    heroImageMobile: "/hosts/themes/tulum-hero-mobile.jpg",
  },
  {
    id: "grindelwald",
    name: "Grindelwald",
    tag: "co-living",
    description:
      "Forest-retreat style: a deep green hero with a round photo and dashed neon rings, a pale intro with stats, a parallax photo, room cards, a photo slider and a closing band. Made for co-living and cabin stays, works for any service.",
    swatch: { bg: "#f8f8f8", fg: "#1b3936", accent: "#75ff69", font: "'Bodoni Moda', serif" },
    heroImage: "/hosts/themes/grindelwald-hero.jpg",
    heroImageMobile: "/hosts/themes/grindelwald-hero-mobile.jpg",
  },
  {
    id: "biznest",
    name: "Biznest",
    tag: "co-working",
    description:
      "The original WoNo layout — clean, spacious, corporate. A real, live co-working/workation site (biznest.wono.co), not a seeded demo.",
    swatch: { bg: "#e9e9e9", fg: "#1f1f1f", accent: "#3b82f6", font: "'Poppins', sans-serif" },
    heroImage: "/hosts/themes/biznest-hero.jpg",
    heroImageMobile: "/hosts/themes/biznest-hero-mobile.jpg",
    // A real, already-live company site, not one of our seeded "<id>demo" ones.
    externalDemoUrl: "https://biznest.wono.co",
  },
];

export const findTemplate = (id) => VERTICAL_TEMPLATE_CATALOG.find((template) => template.id === id);

// Human-readable label per `tag`, for the vertical filter on the Themes pages.
const TAG_LABELS = {
  cafe: "Cafe",
  hostel: "Hostel",
  "co-living": "Co-Living",
  "co-working": "Co-Working",
  "meeting-rooms": "Meeting Rooms",
};

// "all" first, then every tag actually used in the catalog, in catalog order.
export const buildVerticalFilters = (catalog = VERTICAL_TEMPLATE_CATALOG) => [
  { value: "all", label: "All" },
  ...Array.from(new Set(catalog.map((template) => template.tag).filter(Boolean))).map((tag) => ({
    value: tag,
    label: TAG_LABELS[tag] || tag,
  })),
];

export const VERTICAL_FILTERS = buildVerticalFilters();

const MASTER_PANEL_PROD_URL = "https://masterpanel.wono.co";
// The master panel client's own local dev port (see WoNoMasterPanel's
// .claude/launch.json) — NOT the Nomads dev port.
const MASTER_PANEL_LOCAL_PORT = 3007;

// Routes to the master panel's public "/website-preview/demo/:templateId" —
// loads the same sample-content preview as the Website Builder's own
// "Preview with sample content" button, generated on the fly client-side.
// Deliberately NOT a "<id>demo.wono.co" seeded tenant site: those only exist
// wherever someone manually seeded them (e.g. local dev), so they 404 on
// environments — like production — where that seeding step was never run.
// This preview needs no seeded company or DB data at all, so it works the
// same everywhere. A template can still set its own `externalDemoUrl` (e.g.
// Biznest, a real pre-existing live site) to skip this entirely.
export const demoSiteUrl = (templateId) => {
  if (typeof window === "undefined") return `${MASTER_PANEL_PROD_URL}/website-preview/demo/${templateId}`;
  const { protocol, hostname } = window.location;
  const isLocalHost = hostname === "localhost" || hostname.endsWith(".localhost");
  const base = isLocalHost ? `${protocol}//localhost:${MASTER_PANEL_LOCAL_PORT}` : MASTER_PANEL_PROD_URL;
  return `${base}/website-preview/demo/${templateId}`;
};

export const templateDemoUrl = (template) => template.externalDemoUrl || demoSiteUrl(template.id);
