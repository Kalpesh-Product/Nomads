import React, { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Container from "../../components/Container";
import ProductCard from "./components/ProductCard";
import ProductModalContent from "./components/ProductModalContent";
import TempModal from "./components/TempModal";
import {
  getCatalogItemsForProductPage,
  getPageHeroImages,
  getEnabledProductPages,
} from "./utils/pageTemplateUtils";
import {
  getSectionPath,
  normalizeSlug,
} from "./utils/templateRouteUtils";

const TemplateProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, isPending, error, routeContext } = useOutletContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);

  if (isPending) return null;
  if (error) return <div>Error loading product page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const productPages =
    Array.isArray(data?.productPages) && data.productPages.length > 0
      ? data.productPages
      : getEnabledProductPages(data?.productDropdownPages);
  const page =
    productPages.find((item) => item.slug === slug) ||
    productPages.find((item) => normalizeSlug(item?.slug || item?.name || "") === slug);

  if (!page) {
    return (
      <section className="min-h-[50vh] bg-[#efefef] py-10">
        <Container>
          <div className="text-center">
            <h1 className="text-title font-semibold">Product Page Not Found</h1>
            <p className="mt-2 text-gray-600">
              This page is not configured for this website.
            </p>
            <button
              type="button"
              onClick={() =>
                navigate(getSectionPath("products", routeContext?.prefix || ""))
              }
              className="mt-6 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Back to Products
            </button>
          </div>
        </Container>
      </section>
    );
  }

  const heroImages = getPageHeroImages(page);
  const heroImage = heroImages[0] || "";
  const isCafePage = normalizeSlug(page?.slug || page?.name || "").includes("cafe");
  const productSummary =
    page?.description || page?.heroSubHeading || page?.homeCardSubText || "";
  const productCatalog = getCatalogItemsForProductPage(data, page);

  const openProductDetails = (item) => {
    setSelectedProduct(item);
    setOpen(true);
  };

  return (
    <div className="w-full bg-[#efefef]">
      <section className="relative overflow-hidden">
        <div className="relative h-[60vh]">
          {heroImage ? (
            <img
              src={heroImage}
              alt={page?.name || "Product"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}

          <div className="absolute inset-0 bg-black/35" />

          <Container>
            <div className="absolute inset-0 flex items-end justify-center pb-10 text-center text-white">
              <div className="max-w-4xl">
                <h1 className="text-4xl font-bold md:text-5xl">
                  {page?.heroHeading || page?.name}
                </h1>
                {page?.heroSubHeading ? (
                  <p className="mt-3 text-lg md:text-xl">{page.heroSubHeading}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("product-catalog")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  className="mt-6 rounded-full border border-white px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
                >
                  View More
                </button>
              </div>
            </div>
          </Container>
        </div>
      </section>

      <section id="product-catalog" className="py-10">
        <Container>
          <div className="flex flex-col gap-6">
            <h2 className="text-center text-title font-semibold uppercase">
              {isCafePage ? data?.productTitle || "Our Menu" : data?.productTitle || "Our Products"}
            </h2>
            {productSummary && isCafePage ? (
              <p className="text-center text-gray-600">{productSummary}</p>
            ) : null}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {productCatalog.map((item, index) => (
                <ProductCard
                  key={item?.slug || item?.name || item?.title || `product-${index}`}
                  product={item}
                  onClick={() => openProductDetails(item)}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <TempModal
        width="w-[80%] lg:w-[60%]"
        bgColor="bg-white"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ProductModalContent
          product={selectedProduct}
          company={data}
          onClose={() => setOpen(false)}
          forceCafeMode={isCafePage}
        />
      </TempModal>
    </div>
  );
};

export default TemplateProductDetailPage;
