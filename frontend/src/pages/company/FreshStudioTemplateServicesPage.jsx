import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import { ACCENT, FONT_IMPORT, LinedHeading, PAGE_BG, PAGE_WRAP, ProductGrid, TEXT } from "./templates/freshStudio/FreshStudioShared";

const FreshStudioTemplateServicesPage = () => {
  const t = useTemplateData();
  const { data } = t;

  if (t.isPending) return null;
  if (t.error) return <div>Error loading products page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  return (
    <div className="min-h-screen font-['Work_Sans',ui-sans-serif,system-ui,sans-serif]" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <LinedHeading title={String(data?.productTitle || "").trim() || "Our Services"} className="mb-6" style={{ color: ACCENT }} />
        <ProductGrid products={t.productPages} onSelect={t.handleProductCardAction} />
      </section>
    </div>
  );
};

export default FreshStudioTemplateServicesPage;
