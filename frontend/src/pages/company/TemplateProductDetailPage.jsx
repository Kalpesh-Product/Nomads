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
  getMediaSrc,
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
  const [productHeroIndex, setProductHeroIndex] = useState(0);
  const selectedProductHeroImages = heroImages.length > 0 ? heroImages : [];
  const selectedProductHeroImage = selectedProductHeroImages[productHeroIndex] || heroImage;
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
      {/* Full-bleed hero — no Container, no rounded corners, no horizontal margins */}
      <section className="relative h-[62svh] min-h-[380px] overflow-hidden bg-[#1f1f1f] md:h-[84vh] md:min-h-[520px]">
        {selectedProductHeroImage ? (
          <img
            src={selectedProductHeroImage}
            alt={page?.name || "Product Hero"}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        ) : null}

        {/* Text overlay — bottom center */}
        <div className="absolute inset-0 z-10 flex items-end justify-center pb-10 md:pb-16">
          <div className="w-full text-center text-white">
            <h1 className="text-[26px] font-bold md:text-4xl">
              {page?.heroHeading || page?.name || "Product"}
            </h1>
            {page?.heroSubHeading ? (
              <p className="mt-2 text-[13px] leading-relaxed md:mt-3 md:text-lg">{page.heroSubHeading}</p>
            ) : null}
            {page?.heroButtonText ? (
              <button type="button" className="mt-4 rounded-full border border-white px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10 md:mt-6 md:px-6 md:text-sm">
                {String(page.heroButtonText).toUpperCase()}
              </button>
            ) : null}
          </div>
        </div>

        {page?.heroMode === "carousel" && selectedProductHeroImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() =>
                setProductHeroIndex((prev) =>
                  (prev - 1 + selectedProductHeroImages.length) % selectedProductHeroImages.length,
                )
              }
              className="absolute left-5 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 px-4 py-2 text-2xl text-white md:block"
            >
              {"<"}
            </button>
            <button
              type="button"
              onClick={() =>
                setProductHeroIndex((prev) => (prev + 1) % selectedProductHeroImages.length)
              }
              className="absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 px-4 py-2 text-2xl text-white md:block"
            >
              {">"}
            </button>
          </>
        ) : null}
      </section>

      {/* "Our Products" section — 32px top breathing room, standard side padding */}
      <section id="product-catalog" className="pb-10 pt-8">
        <Container padding={false} className="px-4 md:px-6">
          <div className="flex flex-col gap-6">
            <h2 className="text-center text-title font-semibold uppercase">
              {isCafePage ? data?.productTitle || "Our Menu" : data?.productTitle || "Our Products"}
            </h2>
            {productSummary && isCafePage ? (
              <p className="text-center text-gray-600">{productSummary}</p>
            ) : null}
            {isCafePage ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {productCatalog.map((item, index) => (
                  <article key={item?.name || item?.title || `menu-${index}`} className="flex flex-col items-center">
                    <h3 className="mb-3 text-base font-medium md:text-xl">{item?.category || item?.name || `Item ${index + 1}`}</h3>
                    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-200">
                      {(() => {
                        const imgSrc = getMediaSrc(item?.image) || getMediaSrc(item?.cardImage) || getMediaSrc(item?.heroImage) || getMediaSrc(item?.images);
                        return imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item?.name || `Menu Item ${index + 1}`}
                            className="h-[220px] w-full object-cover md:h-[300px]"
                          />
                        ) : (
                          <div className="h-[220px] w-full bg-slate-200 md:h-[300px]" />
                        );
                      })()}
                      <div className="absolute inset-0 bg-black/35" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-left text-white md:p-5">
                        <p className="text-[16px] font-semibold md:text-[18px]">{item?.name || `Item ${index + 1}`}</p>
                        {item?.price || item?.cost ? (
                          <p className="mt-1 text-[14px] font-semibold md:text-[16px]">{item?.price || item?.cost}</p>
                        ) : null}
                        {item?.description ? (
                          <p className="mt-2 max-w-[90%] text-[12px] leading-5 text-white/95 md:text-[15px] md:leading-6">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {productCatalog.map((item, index) => (
                  <ProductCard
                    key={item?.slug || item?.name || item?.title || `product-${index}`}
                    product={item}
                    showButton={true}
                    onClick={() => openProductDetails(item)}
                  />
                ))}
              </div>
            )}
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
