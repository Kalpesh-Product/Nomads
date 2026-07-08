const TEMPLATE_PAGE_SEGMENT = "page";

const FALLBACK_PAGE_NAV_ITEMS = [
  { name: "Home", slug: "home", enabled: true },
  { name: "About Us", slug: "about", enabled: true },
  { name: "Products", slug: "products", enabled: true },
  { name: "Gallery", slug: "gallery", enabled: true },
  { name: "Partner", slug: "partner", enabled: true },
  { name: "Careers", slug: "careers", enabled: true },
  { name: "Testimonials", slug: "testimonials", enabled: true },
  { name: "Contact Us", slug: "contact", enabled: true },
];

const PAGE_NAV_ORDER = {
  home: 0,
  about: 1,
  products: 2,
  gallery: 3,
  partner: 4,
  careers: 5,
  testimonials: 6,
  contact: 7,
};

const DEFAULT_PRODUCT_DROPDOWN_PAGES = [];

const SECTION_LABELS = {
  home: "Home",
  about: "About Us",
  products: "Products",
  gallery: "Gallery",
  partner: "Partner",
  careers: "Careers",
  testimonials: "Testimonials",
  contact: "Contact Us",
};

const normalizeString = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

export const normalizeSlug = (value, fallback = "home") => {
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

export const resolveSectionFromSlug = (slug) => {
  const normalized = normalizeSlug(slug);
  if (normalized.includes("about")) return "about";
  if (normalized.includes("product")) return "products";
  if (normalized.includes("gallery")) return "gallery";
  if (normalized.includes("partner")) return "partner";
  if (normalized.includes("career")) return "careers";
  if (normalized.includes("testimonial") || normalized.includes("review"))
    return "testimonials";
  if (normalized.includes("contact")) return "contact";
  if (normalized === "home" || normalized === "") return "home";
  return null;
};

export const getMediaSrc = (value) => {
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
      normalizeString(value?.src) ||
      normalizeString(value?.uri)
    );
  }
  return "";
};

export const getSectionLabel = (section) => {
  const resolved = resolveSectionFromSlug(section);
  return resolved ? SECTION_LABELS[resolved] || "Home" : "Home";
};

export const normalizePageNavItems = (items, fallbackItems = FALLBACK_PAGE_NAV_ITEMS) => {
  const sourceItems = Array.isArray(items) && items.length > 0 ? items : fallbackItems;

  const normalizedItems = sourceItems
    .map((item) => ({
      name: normalizeString(item?.name),
      slug: normalizeSlug(item?.slug || item?.name, "home"),
      enabled: item?.enabled !== false,
      pageHeading: normalizeString(item?.pageHeading),
      pageIntro: normalizeString(item?.pageIntro),
      metaTitle: normalizeString(item?.metaTitle),
      metaDescription: normalizeString(item?.metaDescription),
    }))
    .filter((item) => item.name && item.slug && item.enabled !== false);

  if (normalizedItems.length === 0 && sourceItems !== fallbackItems) {
    return normalizePageNavItems(fallbackItems, []);
  }

  if (normalizedItems.length === 0) return [];

  const displayNameForSlug = (item) => {
    if (item.slug === "about") return "About Us";
    if (item.slug === "contact") return "Contact Us";
    if (item.slug === "home") return "Home";
    if (item.slug === "products") return "Products";
    if (item.slug === "gallery") return "Gallery";
    if (item.slug === "testimonials") return "Testimonials";
    if (item.slug === "careers") return "Careers";
    return item.name;
  };

  return [...normalizedItems]
    .map((item) => ({
      ...item,
      name: displayNameForSlug(item),
    }))
    .sort((a, b) => {
    const orderA = Object.prototype.hasOwnProperty.call(PAGE_NAV_ORDER, a.slug)
      ? PAGE_NAV_ORDER[a.slug]
      : Number.MAX_SAFE_INTEGER;
    const orderB = Object.prototype.hasOwnProperty.call(PAGE_NAV_ORDER, b.slug)
      ? PAGE_NAV_ORDER[b.slug]
      : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
};

export const normalizeProductDropdownPages = (items) => {
  if (!Array.isArray(items) || items.length === 0) return DEFAULT_PRODUCT_DROPDOWN_PAGES;

  return items
    .map((item) => {
      const heroImages = Array.isArray(item?.heroImages)
        ? item.heroImages
            .map((img) => ({
              id: normalizeString(img?.id),
              url: normalizeString(img?.url),
            }))
            .filter((img) => img.id || img.url)
        : [];

      const heroImage =
        item?.heroImage && typeof item.heroImage === "object"
          ? {
              id: normalizeString(item.heroImage.id),
              url: normalizeString(item.heroImage.url),
            }
          : undefined;

      const homeCardImage =
        item?.homeCardImage && typeof item.homeCardImage === "object"
          ? {
              id: normalizeString(item.homeCardImage.id),
              url: normalizeString(item.homeCardImage.url),
            }
          : undefined;

      return {
        ...item,
        name: normalizeString(item?.name),
        slug: normalizeSlug(item?.slug || item?.name, ""),
        enabled: item?.enabled !== false,
        heroHeading: normalizeString(item?.heroHeading),
        heroSubHeading: normalizeString(item?.heroSubHeading),
        heroMode: normalizeString(item?.heroMode || "single"),
        heroImage,
        heroImages,
        heroButtonText: normalizeString(item?.heroButtonText || "View More"),
        homeCardHeading: normalizeString(item?.homeCardHeading || item?.name),
        homeCardSubText: normalizeString(item?.homeCardSubText),
        homeCardImage,
        leadEnabled: item?.leadEnabled !== false,
        leadFormLabel: normalizeString(item?.leadFormLabel),
        inclusions: Array.isArray(item?.inclusions) ? item.inclusions : [],
        faqs: Array.isArray(item?.faqs) ? item.faqs : [],
      };
    })
    .filter((item) => item.name && item.slug && item.enabled !== false);
};

export const normalizeProductPages = (items) => {
  const productPages = normalizeProductDropdownPages(items);
  return productPages.map((page) => ({
    ...page,
    heading: normalizeString(page?.homeCardHeading || page?.name),
    subText: normalizeString(page?.homeCardSubText),
    cardImage:
      getMediaSrc(page?.homeCardImage) ||
      getMediaSrc(page?.heroImage) ||
      getMediaSrc(page?.heroImages?.[0]),
    heroImage: getMediaSrc(page?.heroImage),
    heroImages: Array.isArray(page?.heroImages)
      ? page.heroImages.map((img) => getMediaSrc(img)).filter(Boolean)
      : [],
  }));
};

const getTemplateRouteParts = (pathname = "") => {
  const cleanedPathname = String(pathname || "")
    .split("?")[0]
    .split("#")[0]
    .replace(/^\/website-preview\/?/, "")
    .replace(/\/+$/, "");

  const parts = cleanedPathname.split("/").filter(Boolean);
  if (parts[0] === TEMPLATE_PAGE_SEGMENT) {
    return {
      prefix: `/${TEMPLATE_PAGE_SEGMENT}`,
      parts: parts.slice(1),
    };
  }

  return {
    prefix: "",
    parts,
  };
};

export const getTemplateRouteContext = (pathname = "") => {
  const { prefix, parts } = getTemplateRouteParts(pathname);
  const section = resolveSectionFromSlug(parts[0] || "home") || "home";
  const productSlug = parts[1] ? normalizeSlug(parts[1], "") : "";
  const itemSlug = parts[2] ? normalizeSlug(parts[2], "") : "";
  const careerJobCode = section === "careers" && parts[1] ? parts[1] : "";

  return {
    prefix,
    currentSection: section,
    currentProductSlug: productSlug,
    currentItemSlug: itemSlug,
    currentCareerJobCode: careerJobCode,
    isProductDetail: section === "products" && !!productSlug,
    isItemDetail: section === "products" && !!productSlug && !!itemSlug,
    isCareerDetail: !!careerJobCode,
  };
};

export const getSectionPath = (section, pathname = "") => {
  const normalizedSection = resolveSectionFromSlug(section) || "home";
  const { prefix } = getTemplateRouteContext(pathname);

  if (prefix) {
    return normalizedSection === "home"
      ? `${prefix}/home`
      : `${prefix}/${normalizedSection}`;
  }

  return normalizedSection === "home" ? "/" : `/${normalizedSection}`;
};

export const getCareerJobPath = (jobCode, pathname = "") => {
  const { prefix } = getTemplateRouteContext(pathname);
  const base = prefix ? `${prefix}/careers` : "/careers";
  return `${base}/${encodeURIComponent(jobCode)}`;
};

export const getProductPath = (slug, pathname = "") => {
  const normalizedSlug = normalizeSlug(slug, "");
  const { prefix } = getTemplateRouteContext(pathname);

  if (prefix) {
    return `${prefix}/products/${normalizedSlug}`;
  }

  return `/products/${normalizedSlug}`;
};

export const normalizeTemplateData = (data) => {
  if (!data) return data;

  const normalizedPageNavItems = normalizePageNavItems(
    data?.pageNavItems,
    data?.navItems,
  );
  const normalizedNavItems = normalizedPageNavItems;
  const normalizedProductDropdownPages = normalizeProductDropdownPages(
    data?.productDropdownPages || data?.productPages || data?.products,
  );
  const normalizedProductPages = normalizeProductPages(
    data?.productPages || data?.productDropdownPages || data?.products,
  );

  return {
    ...data,
    companyName: normalizeString(data?.companyName),
    companyId: normalizeString(data?.companyId),
    workspaceId: normalizeString(data?.workspaceId),
    searchKey: normalizeString(data?.searchKey),
    vertical: normalizeString(data?.vertical),
    websiteEmail: normalizeString(data?.websiteEmail || data?.email),
    contactTitle: normalizeString(data?.contactTitle),
    contactPageHeading: normalizeString(data?.contactPageHeading),
    contactPageIntro: normalizeString(data?.contactPageIntro),
    galleryPageHeading: normalizeString(data?.galleryPageHeading || data?.galleryTitle),
    testimonialsPageHeading: normalizeString(
      data?.testimonialsPageHeading || data?.testimonialTitle,
    ),
    testimonialsPageIntro: normalizeString(data?.testimonialsPageIntro),
    phone: normalizeString(data?.phone || data?.contactPersonPhone),
    address: normalizeString(data?.address),
    mapUrl: normalizeString(data?.mapUrl),
    copyrightText: normalizeString(data?.copyrightText),
    companyLogoUrl: getMediaSrc(data?.companyLogoUrl || data?.companyLogo),
    pageNavItems: normalizedPageNavItems,
    navItems: normalizedNavItems,
    productDropdownPages: normalizedProductDropdownPages,
    productPages: normalizedProductPages,
    products: Array.isArray(data?.products) ? data.products : [],
    menuItems: Array.isArray(data?.menuItems) ? data.menuItems : [],
    gallery: Array.isArray(data?.gallery) ? data.gallery : [],
    testimonials: Array.isArray(data?.testimonials) ? data.testimonials : [],
    about: Array.isArray(data?.about) ? data.about : [],
    aboutPageImageCards: Array.isArray(data?.aboutPageImageCards)
      ? data.aboutPageImageCards
      : [],
    heroImages: Array.isArray(data?.heroImages) ? data.heroImages : [],
    careersPageHeading: normalizeString(data?.careersPageHeading),
    careersPageIntro: normalizeString(data?.careersPageIntro),
    careersApplyButtonText: normalizeString(data?.careersApplyButtonText),
    careersClosingText: normalizeString(data?.careersClosingText),
    careersClosingHeading: normalizeString(data?.careersClosingHeading),
    careersFormFields: data?.careersFormFields ?? [],
    heroVariant: normalizeString(data?.heroVariant || "text-image"),
    themeVariant: normalizeString(data?.themeVariant || "default"),
    activeSections: Array.isArray(data?.activeSections) ? data.activeSections : [],
    enabledSections: Array.isArray(data?.enabledSections) ? data.enabledSections : [],
    sectionOverrides: data?.sectionOverrides || {},
    styleConfig: data?.styleConfig || {},
  };
};

export const getTemplateBreadcrumbItems = ({
  data,
  pathname = "",
  routeContext = {},
  itemName = "",
} = {}) => {
  const homePath = getSectionPath("home", pathname);
  const currentSection = routeContext?.currentSection || "home";
  const currentProductSlug = routeContext?.currentProductSlug || "";
  const currentItemSlug = routeContext?.currentItemSlug || "";
  const items = [
    {
      label: "Home",
      path: homePath,
    },
  ];

  if (currentSection === "home") {
    return items;
  }

  const sectionPath = getSectionPath(currentSection, pathname);
  const sectionLabel = getSectionLabel(currentSection);

  items.push({
    label: sectionLabel,
    path: sectionPath,
  });

  if (currentSection === "products" && currentProductSlug) {
    const productPages = Array.isArray(data?.productPages) ? data.productPages : [];
    const productDropdownPages = Array.isArray(data?.productDropdownPages)
      ? data.productDropdownPages
      : [];
    const matchedProduct =
      productPages.find(
        (item) =>
          normalizeSlug(item?.slug || item?.name || "", "") === currentProductSlug,
      ) ||
      productDropdownPages.find(
        (item) =>
          normalizeSlug(item?.slug || item?.name || "", "") === currentProductSlug,
      );

    const productPath = getProductPath(currentProductSlug, pathname);
    
    items.push({
      label:
        normalizeString(
          matchedProduct?.name ||
            matchedProduct?.homeCardHeading ||
            matchedProduct?.heroHeading,
        ) || "Product",
      path: productPath,
    });

    // If we have an item detail (itemSlug), add it to breadcrumbs
    if (currentItemSlug && itemName) {
      items.push({
        label: normalizeString(itemName) || "Item",
      });
    }
  }

  if (currentSection === "careers" && routeContext?.currentCareerJobCode) {
    items.push({
      label: itemName || routeContext.currentCareerJobCode,
    });
  }

  return items;
};
