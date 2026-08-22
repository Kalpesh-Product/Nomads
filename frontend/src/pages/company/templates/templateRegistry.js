import ClassicTemplateHome from "../ClassicTemplateHome";
import ClassicTemplateAboutPage from "../ClassicTemplateAboutPage";
import ClassicTemplateServicesPage from "../ClassicTemplateServicesPage";
import ClassicTemplateServiceDetailPage from "../ClassicTemplateServiceDetailPage";
import ClassicTemplateGalleryPage from "../ClassicTemplateGalleryPage";
import ClassicTemplateTestimonialsPage from "../ClassicTemplateTestimonialsPage";
import ClassicTemplatePartnerPage from "../ClassicTemplatePartnerPage";
import ClassicTemplateCareerPage from "../ClassicTemplateCareerPage";
import ClassicTemplateContactPage from "../ClassicTemplateContactPage";
import FreshStudioTemplateHome from "../FreshStudioTemplateHome";
import FreshStudioTemplateAboutPage from "../FreshStudioTemplateAboutPage";
import FreshStudioTemplateServicesPage from "../FreshStudioTemplateServicesPage";
import FreshStudioTemplateServiceDetailPage from "../FreshStudioTemplateServiceDetailPage";
import FreshStudioTemplateGalleryPage from "../FreshStudioTemplateGalleryPage";
import FreshStudioTemplateTestimonialsPage from "../FreshStudioTemplateTestimonialsPage";
import FreshStudioTemplatePartnerPage from "../FreshStudioTemplatePartnerPage";
import FreshStudioTemplateCareerPage from "../FreshStudioTemplateCareerPage";
import FreshStudioTemplateContactPage from "../FreshStudioTemplateContactPage";
import WarmOrganicTemplateHome from "../WarmOrganicTemplateHome";
import WarmOrganicTemplateAboutPage from "../WarmOrganicTemplateAboutPage";
import WarmOrganicTemplateServicesPage from "../WarmOrganicTemplateServicesPage";
import WarmOrganicTemplateServiceDetailPage from "../WarmOrganicTemplateServiceDetailPage";
import WarmOrganicTemplateGalleryPage from "../WarmOrganicTemplateGalleryPage";
import WarmOrganicTemplateTestimonialsPage from "../WarmOrganicTemplateTestimonialsPage";
import WarmOrganicTemplatePartnerPage from "../WarmOrganicTemplatePartnerPage";
import WarmOrganicTemplateCareerPage from "../WarmOrganicTemplateCareerPage";
import WarmOrganicTemplateContactPage from "../WarmOrganicTemplateContactPage";
import EmeraldStudioTemplateHome from "../EmeraldStudioTemplateHome";
import EmeraldStudioTemplateAboutPage from "../EmeraldStudioTemplateAboutPage";
import EmeraldStudioTemplateServicesPage from "../EmeraldStudioTemplateServicesPage";
import EmeraldStudioTemplateServiceDetailPage from "../EmeraldStudioTemplateServiceDetailPage";
import EmeraldStudioTemplateGalleryPage from "../EmeraldStudioTemplateGalleryPage";
import EmeraldStudioTemplateTestimonialsPage from "../EmeraldStudioTemplateTestimonialsPage";
import EmeraldStudioTemplatePartnerPage from "../EmeraldStudioTemplatePartnerPage";
import EmeraldStudioTemplateCareerPage from "../EmeraldStudioTemplateCareerPage";
import EmeraldStudioTemplateContactPage from "../EmeraldStudioTemplateContactPage";

export const DEFAULT_TEMPLATE_ID = "default";
export const FRESH_STUDIO_TEMPLATE_ID = "fresh-studio";
export const WARM_ORGANIC_TEMPLATE_ID = "warm-organic";
export const EMERALD_STUDIO_TEMPLATE_ID = "emerald-studio";

// Keyed by section, then by the `themeVariant` value carried on the site's
// published/draft data. Any themeVariant not present for a section falls
// back to DEFAULT_TEMPLATE_ID. With Emerald Studio added here, all 4
// HostPanel templates (Classic/default, Fresh Studio, Warm Organic, Emerald
// Studio) are now represented for every section — no changes to
// TemplateSite.jsx's data-fetching or to routes.jsx are needed to plug a new
// template in, only new section files + a registry entry per section.
export const TEMPLATE_SECTION_REGISTRY = {
  home: {
    [DEFAULT_TEMPLATE_ID]: ClassicTemplateHome,
    [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateHome,
    [WARM_ORGANIC_TEMPLATE_ID]: WarmOrganicTemplateHome,
    [EMERALD_STUDIO_TEMPLATE_ID]: EmeraldStudioTemplateHome,
  },
  about: {
    [DEFAULT_TEMPLATE_ID]: ClassicTemplateAboutPage,
    [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateAboutPage,
    [WARM_ORGANIC_TEMPLATE_ID]: WarmOrganicTemplateAboutPage,
    [EMERALD_STUDIO_TEMPLATE_ID]: EmeraldStudioTemplateAboutPage,
  },
  products: {
    [DEFAULT_TEMPLATE_ID]: ClassicTemplateServicesPage,
    [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateServicesPage,
    [WARM_ORGANIC_TEMPLATE_ID]: WarmOrganicTemplateServicesPage,
    [EMERALD_STUDIO_TEMPLATE_ID]: EmeraldStudioTemplateServicesPage,
  },
  productDetail: {
    [DEFAULT_TEMPLATE_ID]: ClassicTemplateServiceDetailPage,
    [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateServiceDetailPage,
    [WARM_ORGANIC_TEMPLATE_ID]: WarmOrganicTemplateServiceDetailPage,
    [EMERALD_STUDIO_TEMPLATE_ID]: EmeraldStudioTemplateServiceDetailPage,
  },
  gallery: {
    [DEFAULT_TEMPLATE_ID]: ClassicTemplateGalleryPage,
    [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateGalleryPage,
    [WARM_ORGANIC_TEMPLATE_ID]: WarmOrganicTemplateGalleryPage,
    [EMERALD_STUDIO_TEMPLATE_ID]: EmeraldStudioTemplateGalleryPage,
  },
  testimonials: {
    [DEFAULT_TEMPLATE_ID]: ClassicTemplateTestimonialsPage,
    [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateTestimonialsPage,
    [WARM_ORGANIC_TEMPLATE_ID]: WarmOrganicTemplateTestimonialsPage,
    [EMERALD_STUDIO_TEMPLATE_ID]: EmeraldStudioTemplateTestimonialsPage,
  },
  partner: {
    [DEFAULT_TEMPLATE_ID]: ClassicTemplatePartnerPage,
    [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplatePartnerPage,
    [WARM_ORGANIC_TEMPLATE_ID]: WarmOrganicTemplatePartnerPage,
    [EMERALD_STUDIO_TEMPLATE_ID]: EmeraldStudioTemplatePartnerPage,
  },
  career: {
    [DEFAULT_TEMPLATE_ID]: ClassicTemplateCareerPage,
    [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateCareerPage,
    [WARM_ORGANIC_TEMPLATE_ID]: WarmOrganicTemplateCareerPage,
    [EMERALD_STUDIO_TEMPLATE_ID]: EmeraldStudioTemplateCareerPage,
  },
  contact: {
    [DEFAULT_TEMPLATE_ID]: ClassicTemplateContactPage,
    [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateContactPage,
    [WARM_ORGANIC_TEMPLATE_ID]: WarmOrganicTemplateContactPage,
    [EMERALD_STUDIO_TEMPLATE_ID]: EmeraldStudioTemplateContactPage,
  },
};

export function resolveSectionComponent(section, themeVariant) {
  const key = String(themeVariant || "").trim() || DEFAULT_TEMPLATE_ID;
  const variants = TEMPLATE_SECTION_REGISTRY[section] || {};
  return variants[key] || variants[DEFAULT_TEMPLATE_ID];
}
