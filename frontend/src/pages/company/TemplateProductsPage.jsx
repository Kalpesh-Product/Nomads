import React from "react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import ProductCard from "./components/ProductCard";
import ProductModalContent from "./components/ProductModalContent";
import TempModal from "./components/TempModal";
import LinedHeading from "./components/LinedHeading";
import {
  getEnabledProductPages,
} from "./utils/pageTemplateUtils";
import { getProductPath } from "./utils/templateRouteUtils";

const TemplateProductsPage = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const { data, isPending, error, routeContext } = useOutletContext();

  if (isPending) return null;
  if (error) return <div>Error loading products page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const productPages =
    Array.isArray(data?.productPages) && data.productPages.length > 0
      ? data.productPages
      : getEnabledProductPages(data?.productDropdownPages);
  const products = Array.isArray(data?.products) ? data.products : [];
  const safeProductTitle =
    typeof data?.productTitle === "string" ? data.productTitle.trim() : "";
  const productsSectionTitle = safeProductTitle || "Our Products";
  const pathname = routeContext?.prefix
    ? `${routeContext.prefix}/products`
    : "/products";
  const catalogItems = productPages.length > 0 ? productPages : products;

  return (
    <section className="min-h-[60vh] bg-[#efefef] py-0">
      <Container>
        <div className="flex flex-col gap-6">
          <LinedHeading title={productsSectionTitle} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {catalogItems.map((item, index) => (
              <ProductCard
                key={item?.slug || item?.name || item?._id || `product-${index}`}
                product={item}
                onClick={() => {
                  if (item?.slug) {
                    navigate(getProductPath(item.slug, pathname));
                    return;
                  }

                  setSelectedProduct(item);
                  setOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </Container>

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
        />
      </TempModal>
    </section>
  );
};

export default TemplateProductsPage;
