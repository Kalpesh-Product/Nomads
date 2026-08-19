import ClassicTemplateHome from "../ClassicTemplateHome";
import ClassicTemplateAboutPage from "../ClassicTemplateAboutPage";
import ClassicTemplateServicesPage from "../ClassicTemplateServicesPage";
import ClassicTemplateServiceDetailPage from "../ClassicTemplateServiceDetailPage";
import ClassicTemplateGalleryPage from "../ClassicTemplateGalleryPage";
import ClassicTemplateTestimonialsPage from "../ClassicTemplateTestimonialsPage";
import ClassicTemplatePartnerPage from "../ClassicTemplatePartnerPage";
import ClassicTemplateCareerPage from "../ClassicTemplateCareerPage";
import ClassicTemplateContactPage from "../ClassicTemplateContactPage";

export const DEFAULT_TEMPLATE_ID = "default";

// Keyed by section, then by the `themeVariant` value carried on the site's
// published/draft data. Any themeVariant not present for a section falls
// back to DEFAULT_TEMPLATE_ID (today the only variant that exists — this is
// scaffolding for Bold Editorial / Minimal Swiss / Warm Organic to plug into
// later without touching TemplateSite.jsx's data-fetching or routes.jsx).
export const TEMPLATE_SECTION_REGISTRY = {
  home: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateHome },
  about: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateAboutPage },
  products: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateServicesPage },
  productDetail: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateServiceDetailPage },
  gallery: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateGalleryPage },
  testimonials: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateTestimonialsPage },
  partner: { [DEFAULT_TEMPLATE_ID]: ClassicTemplatePartnerPage },
  career: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateCareerPage },
  contact: { [DEFAULT_TEMPLATE_ID]: ClassicTemplateContactPage },
};

export function resolveSectionComponent(section, themeVariant) {
  const key = String(themeVariant || "").trim() || DEFAULT_TEMPLATE_ID;
  const variants = TEMPLATE_SECTION_REGISTRY[section] || {};
  return variants[key] || variants[DEFAULT_TEMPLATE_ID];
}
