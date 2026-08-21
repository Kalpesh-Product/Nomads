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

export const DEFAULT_TEMPLATE_ID = "default";
export const FRESH_STUDIO_TEMPLATE_ID = "fresh-studio";

// Keyed by section, then by the `themeVariant` value carried on the site's
// published/draft data. Any themeVariant not present for a section falls
// back to DEFAULT_TEMPLATE_ID. Warm Organic / Emerald Studio are scaffolded
// for later sessions the same way Fresh Studio was added here — no changes
// to TemplateSite.jsx's data-fetching or to routes.jsx are needed to plug a
// new template in, only new section files + a registry entry per section.
export const TEMPLATE_SECTION_REGISTRY = {
  home: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateHome, [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateHome },
  about: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateAboutPage, [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateAboutPage },
  products: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateServicesPage, [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateServicesPage },
  productDetail: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateServiceDetailPage, [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateServiceDetailPage },
  gallery: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateGalleryPage, [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateGalleryPage },
  testimonials: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateTestimonialsPage, [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateTestimonialsPage },
  partner: { [DEFAULT_TEMPLATE_ID]: ClassicTemplatePartnerPage, [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplatePartnerPage },
  career: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateCareerPage, [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateCareerPage },
  contact: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateContactPage, [FRESH_STUDIO_TEMPLATE_ID]: FreshStudioTemplateContactPage },
};

export function resolveSectionComponent(section, themeVariant) {
  const key = String(themeVariant || "").trim() || DEFAULT_TEMPLATE_ID;
  const variants = TEMPLATE_SECTION_REGISTRY[section] || {};
  return variants[key] || variants[DEFAULT_TEMPLATE_ID];
}
