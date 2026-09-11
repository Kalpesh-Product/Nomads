import productSeoEntries from "./productSeoEntries.js";

const normalizeProductSeoPath = (value = "") => {
  try {
    const url = new URL(value, "https://wono.co");
    const pathname =
      url.pathname.length > 1 ? url.pathname.replace(/\/$/, "") : url.pathname;
    const companyType = url.searchParams.get("companyType");

    if (!pathname.startsWith("/listings/") || !companyType) return null;

    const params = new URLSearchParams({
      companyType: companyType.trim().toLowerCase(),
    });

    return `${pathname}?${params.toString()}`;
  } catch {
    return null;
  }
};

const decodeProductSeoPath = (path = "") => {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
};

const productSeoByPath = productSeoEntries.reduce((lookup, entry) => {
  const key = normalizeProductSeoPath(entry.link);

  if (key) {
    lookup[key] = entry;
    lookup[decodeProductSeoPath(key)] = entry;
  }

  return lookup;
}, {});

export const getProductSeoDetailsByPath = (path, fallbackPath) => {
  const key = normalizeProductSeoPath(path);
  const fallbackKey = fallbackPath
    ? normalizeProductSeoPath(fallbackPath)
    : null;

  return (
    (key
      ? productSeoByPath[key] || productSeoByPath[decodeProductSeoPath(key)]
      : null) ||
    (fallbackKey
      ? productSeoByPath[fallbackKey] ||
        productSeoByPath[decodeProductSeoPath(fallbackKey)]
      : null) ||
    null
  );
};
