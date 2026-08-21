import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import { BROWN, FONT_IMPORT, LinedHeading, PAGE_WRAP, ProductGrid, SANS } from "./templates/warmOrganic/WarmOrganicShared";

const WarmOrganicTemplateServicesPage = () => {
  const t = useTemplateData();
  const { data } = t;

  if (t.isPending) return null;
  if (t.error) return <div>Error loading products page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  return (
    <div className={`wo-template min-h-screen ${SANS}`} style={{ backgroundColor: "#F1E6D3", color: BROWN }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <LinedHeading title={String(data?.productTitle || "").trim() || "Our Services"} className="justify-center" />
        <div className="mt-4">
          <ProductGrid products={t.productPages} onSelect={t.handleProductCardAction} />
        </div>
      </section>
    </div>
  );
};

export default WarmOrganicTemplateServicesPage;
