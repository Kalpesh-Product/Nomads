import { useMemo } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  getCareerJobPath,
  getMediaSrc,
  getProductPath,
  getSectionPath,
  normalizeSlug,
  resolveSectionFromSlug,
} from "../utils/templateRouteUtils";
import { getApprovedTestimonials } from "../utils/pageTemplateUtils";
import { getEnabledFooterSocials } from "../utils/footerSocialLinks";

// Shared data/navigation layer for every *new* template built on top of
// Nomads' real react-router routing (Fresh Studio first, Warm Organic and
// Emerald Studio to follow in later sessions). Classic keeps its own
// self-contained per-page logic, untouched, proven working — this hook is
// only consumed by templates built after it.
//
// Unlike HostPanel's `useWebsiteTemplateData` (one hook instance backing an
// entire single-page template with in-memory state for which "page" is
// showing), Nomads is genuinely multi-route: each section is its own routed
// page component, mounted independently by React Router, reading the same
// `useOutletContext()` data TemplateSite.jsx fetches once. So this hook is
// deliberately *thinner* than HostPanel's — it derives common read-only view
// data and exposes real navigation helpers (wrapping `useNavigate` +
// templateRouteUtils path builders), but it does not hold cross-section UI
// state (e.g. "which job/product is open") the way HostPanel's hook does,
// because in Nomads that state already lives in the URL (`:slug`,
// `:itemSlug`, `:jobCode` route params), not in a shared React state object.
export const useTemplateData = () => {
  const outletContext = useOutletContext() || {};
  const {
    data,
    isPending,
    error,
    routeContext = {},
    approvedReviews = [],
    rawProductDropdownPages = [],
  } = outletContext;
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = useMemo(
    () => (Array.isArray(data?.pageNavItems) ? data.pageNavItems : []),
    [data?.pageNavItems],
  );

  // Whole-page visibility (e.g. "is the About page enabled at all") — mirrors
  // the same `pageNavItems`-presence check every Classic*.jsx page already
  // does locally, and that TemplateSite.jsx's redirect guard also uses.
  const isPageEnabled = (slug) =>
    navItems.some((item) => resolveSectionFromSlug(item.slug) === slug);

  const aboutPageEnabled = isPageEnabled("about");
  const productsPageEnabled = isPageEnabled("products");
  const galleryPageEnabled = isPageEnabled("gallery");
  const partnerPageEnabled = isPageEnabled("partner");
  const careersPageEnabled = isPageEnabled("careers");
  const contactPageEnabled = isPageEnabled("contact");

  // Finer-grained home-page block visibility (hero/about/products/etc. as
  // individually toggleable strips on the home page only) — carried on
  // `data.sectionOverrides` same as HostPanel's builder writes it.
  const isHomeSectionEnabled = (key) => data?.sectionOverrides?.[key] !== false;

  const productPages = useMemo(
    () => (Array.isArray(data?.productPages) ? data.productPages : []),
    [data?.productPages],
  );

  const galleryItems = useMemo(
    () =>
      Array.isArray(data?.gallery)
        ? data.gallery.map((item) => getMediaSrc(item)).filter(Boolean)
        : [],
    [data?.gallery],
  );
  const homeGalleryItems = galleryItems.slice(0, 6);

  const testimonials = useMemo(() => {
    // getApprovedTestimonials maps each item's `key` from _id/upstreamReviewId/
    // id — local/draft testimonials (data.testimonials) usually have none of
    // those, so every one of them would come back with the same empty-string
    // key. Give those a synthetic per-index key first (mirrors HostPanel's
    // `draft-${index}` keys) so the dedupe filter below doesn't treat two
    // *different* draft testimonials as the same one and drop all but the
    // first.
    const fromDraft = getApprovedTestimonials(data?.testimonials).map((item, index) => ({
      ...item,
      key: item.key || `draft-${index}`,
    }));
    const merged = [...fromDraft, ...approvedReviews];
    return merged.filter(
      (item, index, array) =>
        index ===
        array.findIndex(
          (candidate) =>
            String(candidate?.key || "").trim() === String(item?.key || "").trim() ||
            (candidate?.name === item?.name && candidate?.text === item?.text),
        ),
    );
  }, [data?.testimonials, approvedReviews]);

  const footerSocialLinks = useMemo(
    () => getEnabledFooterSocials(data?.socials),
    [data?.socials],
  );

  const contactEmail = String(data?.websiteEmail || data?.email || "").trim();
  const contactPhone = String(data?.phone || "").trim();
  const contactAddress = String(data?.address || "").trim();
  const footerCompanyName = String(
    data?.registeredCompanyName || data?.companyName || "",
  ).trim();
  const footerCopyrightText = String(data?.copyrightText || "").trim();

  // Navigation — real router navigation, unlike HostPanel's preview which
  // just flips in-memory `currentSection` state.
  const goToSection = (slug) => navigate(getSectionPath(slug, location.pathname));
  const goToProductPage = (slug) => navigate(getProductPath(slug, location.pathname));
  const goToProductItem = (productSlug, itemSlug) =>
    navigate(`${getProductPath(productSlug, location.pathname)}/${normalizeSlug(itemSlug, "")}`);
  const handleProductCardAction = (product) =>
    goToProductPage(product?.slug || product?.name || "");
  const goToCareerJob = (jobCode, jobTitle) =>
    navigate(getCareerJobPath(jobCode, location.pathname), {
      state: jobTitle ? { jobTitle } : undefined,
    });

  return {
    data,
    isPending,
    error,
    routeContext,
    approvedReviews,
    rawProductDropdownPages,
    navItems,
    isPageEnabled,
    aboutPageEnabled,
    productsPageEnabled,
    galleryPageEnabled,
    partnerPageEnabled,
    careersPageEnabled,
    contactPageEnabled,
    isHomeSectionEnabled,
    productPages,
    galleryItems,
    homeGalleryItems,
    testimonials,
    footerSocialLinks,
    contactEmail,
    contactPhone,
    contactAddress,
    footerCompanyName,
    footerCopyrightText,
    goToSection,
    goToProductPage,
    goToProductItem,
    handleProductCardAction,
    goToCareerJob,
  };
};

export default useTemplateData;
