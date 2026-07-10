import axios from "axios";
import Company from "../models/Company.js";
import WebsiteTemplate from "../models/WebsiteTemplate.js";

const normalizeTenant = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

const normalizeString = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const normalizeSlug = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
};

const getMediaSrc = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const mediaSrc = getMediaSrc(item);
      if (mediaSrc) return mediaSrc;
    }
    return "";
  }
  if (typeof value === "object") {
    return (
      normalizeString(value?.url) ||
      normalizeString(value?.preview) ||
      normalizeString(value?.location) ||
      normalizeString(value?.src)
    );
  }
  return "";
};

const normalizePageNavItems = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      name: normalizeString(item?.name),
      slug: normalizeSlug(item?.slug || item?.name, ""),
      enabled: item?.enabled !== false,
      pageHeading: normalizeString(item?.pageHeading),
      pageIntro: normalizeString(item?.pageIntro),
      metaTitle: normalizeString(item?.metaTitle),
      metaDescription: normalizeString(item?.metaDescription),
    }))
    .filter((item) => item.name && item.slug);
};

const normalizeProductDropdownPages = (items = []) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const heroImages = Array.isArray(item?.heroImages)
        ? item.heroImages.map((img) => ({
            id: normalizeString(img?.id),
            url: normalizeString(img?.url),
          }))
        : [];

      const normalized = {
        name: normalizeString(item?.name),
        slug: normalizeSlug(item?.slug || item?.name, ""),
        enabled: item?.enabled !== false,
        heroHeading: normalizeString(item?.heroHeading),
        heroSubHeading: normalizeString(item?.heroSubHeading),
        heroMode: normalizeString(item?.heroMode || "single"),
        heroImage:
          item?.heroImage && typeof item.heroImage === "object"
            ? {
                id: normalizeString(item.heroImage.id),
                url: normalizeString(item.heroImage.url),
              }
            : undefined,
        heroImages,
        heroButtonText: normalizeString(item?.heroButtonText || "View More"),
        homeCardHeading: normalizeString(item?.homeCardHeading || item?.name),
        homeCardSubText: normalizeString(item?.homeCardSubText),
        homeCardImage:
          item?.homeCardImage && typeof item.homeCardImage === "object"
            ? {
                id: normalizeString(item.homeCardImage.id),
                url: normalizeString(item.homeCardImage.url),
              }
            : undefined,
        leadEnabled: item?.leadEnabled !== false,
        leadFormLabel: normalizeString(item?.leadFormLabel),
        inclusions: Array.isArray(item?.inclusions) ? item.inclusions : [],
        faqs: Array.isArray(item?.faqs) ? item.faqs : [],
      };

      return normalized;
    })
    .filter((item) => item.name && item.slug);
};

const serializeProductPagesForClient = (items = []) =>
  normalizeProductDropdownPages(items).map((page) => ({
    ...page,
    heading: normalizeString(page?.homeCardHeading || page?.name),
    subText: normalizeString(page?.homeCardSubText),
    cardImage:
      page?.homeCardImage?.url ||
      page?.heroImage?.url ||
      page?.heroImages?.[0]?.url ||
      "",
    heroImage: page?.heroImage?.url || "",
    heroImages: Array.isArray(page?.heroImages)
      ? page.heroImages.map((img) => img?.url || "").filter(Boolean)
      : [],
  }));

const normalizeTemplatePayload = (template) => {
  if (!template) return null;

  const pageNavItems = normalizePageNavItems(
    template?.pageNavItems || template?.navItems || [],
  );
  const productDropdownPages = normalizeProductDropdownPages(
    template?.productDropdownPages || template?.productPages || template?.products || [],
  );
  const productPages = serializeProductPagesForClient(productDropdownPages);
  const companyLogoUrl = getMediaSrc(template?.companyLogoUrl || template?.companyLogo);

  return {
    ...template,
    companyName:
      normalizeString(template?.companyName) ||
      normalizeString(template?.registeredCompanyName) ||
      normalizeString(template?.searchKey),
    companyLogoUrl,
    websiteEmail: normalizeString(template?.websiteEmail || template?.email),
    contactTitle: normalizeString(template?.contactTitle || "Contact"),
    contactPageHeading:
      normalizeString(template?.contactPageHeading || template?.contactTitle) || "Contact",
    contactPageIntro: normalizeString(template?.contactPageIntro),
    galleryPageHeading:
      normalizeString(template?.galleryPageHeading || template?.galleryTitle) || "Gallery",
    testimonialsPageHeading:
      normalizeString(template?.testimonialsPageHeading || template?.testimonialTitle) ||
      "Testimonials",
    testimonialsPageIntro: normalizeString(template?.testimonialsPageIntro),
    aboutPageIntro: normalizeString(template?.aboutPageIntro || "About Our Vision"),
    pageNavItems,
    navItems: pageNavItems,
    productDropdownPages,
    productPages,
    products: Array.isArray(template?.products) ? template.products : [],
    gallery: Array.isArray(template?.gallery) ? template.gallery : [],
    testimonials: Array.isArray(template?.testimonials) ? template.testimonials : [],
    about: Array.isArray(template?.about) ? template.about : [],
    aboutPageImageCards: Array.isArray(template?.aboutPageImageCards)
      ? template.aboutPageImageCards
      : [],
    heroImages: Array.isArray(template?.heroImages) ? template.heroImages : [],
    heroVariant: normalizeString(template?.heroVariant || "text-image"),
    themeVariant: normalizeString(template?.themeVariant || "default"),
    activeSections: Array.isArray(template?.activeSections) ? template.activeSections : [],
    enabledSections: Array.isArray(template?.enabledSections) ? template.enabledSections : [],
    sectionOverrides: template?.sectionOverrides || {},
    styleConfig: template?.styleConfig || {},
    mapUrl: normalizeString(template?.mapUrl),
    phone: normalizeString(template?.phone || template?.contactPersonPhone),
    address: normalizeString(template?.address),
    copyrightText: normalizeString(template?.copyrightText),
  };
};

export const getRecruitmentJobs = async (req, res, next) => {
  try {
    const workspaceId = String(req.params.workspaceId || "").trim();
    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    const upstream = await axios.get(
      `${process.env.WONOMASTER_BE || "https://wonomasterbe.vercel.app"}/api/recruitment/jobs/public`,
      { params: { workspaceId } },
    );

    return res.json(upstream.data?.data || upstream.data);
  } catch (error) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || error?.message || "Failed to load jobs";
    return res.status(status).json({ message });
  }
};

export const getWebsiteByTenant = async (req, res, next) => {
  try {
    const tenant = normalizeTenant(req.params.tenant);

    if (!tenant) {
      return res.status(400).json({ message: "Tenant is required" });
    }

    const searchKey = tenant.split("-")[0] || tenant;

    const publishedTemplate =
      (await WebsiteTemplate.findOne({
        searchKey,
        isPublished: true,
      })
        .sort({ deployedAt: -1, updatedAt: -1 })
        .lean()
        .exec()) ||
      (await WebsiteTemplate.findOne({
        companyName: { $regex: new RegExp(`^${tenant}$`, "i") },
        isPublished: true,
      })
        .sort({ deployedAt: -1, updatedAt: -1 })
        .lean()
        .exec());

    if (publishedTemplate) {
      return res.status(200).json(normalizeTemplatePayload(publishedTemplate));
    }

    const localTemplate =
      (await WebsiteTemplate.findOne({ searchKey })
        .sort({ updatedAt: -1 })
        .lean()
        .exec()) ||
      (await WebsiteTemplate.findOne({
        companyName: { $regex: new RegExp(`^${tenant}$`, "i") },
      })
        .sort({ updatedAt: -1 })
        .lean()
        .exec());

    if (localTemplate) {
      return res.status(200).json(normalizeTemplatePayload(localTemplate));
    }

    const company = await Company.findOne({
      $or: [
        { websiteTemplateLink: tenant },
        { companyName: { $regex: new RegExp(`^${tenant}$`, "i") } },
      ],
    })
      .lean()
      .exec();

    if (company?.websiteTemplateLink) {
      const upstream = await axios.get(
        `https://wonomasterbe.vercel.app/api/editor/get-website/${encodeURIComponent(
          company.websiteTemplateLink,
        )}`,
      );

      return res
        .status(upstream.status)
        .json(normalizeTemplatePayload(upstream.data?.template || upstream.data));
    }

    const upstream = await axios.get(
      `https://wonomasterbe.vercel.app/api/editor/get-website/${encodeURIComponent(tenant)}`,
    );

    return res
      .status(upstream.status)
      .json(normalizeTemplatePayload(upstream.data?.template || upstream.data));
  } catch (error) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message || error?.message || "Failed to load website";

    return res.status(status).json({ message });
  }
};
