import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BODY_FONT,
  FONT_IMPORT,
  LinedHeading,
  ProductGrid,
  SECTION_BG,
  STYLE_OVERRIDES,
  TEMPLATE_ROOT_CLASS,
} from "./templates/emeraldStudio/EmeraldStudioShared";

const EmeraldStudioTemplateServicesPage = () => {
  const t = useTemplateData();
  const { data } = t;

  if (t.isPending) return null;
  if (t.error) return <div>Error loading products page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  return (
    <div className={`${TEMPLATE_ROOT_CLASS} min-h-screen bg-[#002c22] text-stone-100 ${BODY_FONT}`}>
      <style>{`${FONT_IMPORT}${STYLE_OVERRIDES}`}</style>
      <section className={`pt-20 pb-16 px-6 ${SECTION_BG}`}>
        <div className="max-w-7xl mx-auto text-center">
          <LinedHeading title={String(data?.productTitle || "").trim() || "Our Services"} className="justify-center" />
        </div>
        <div className="py-10 px-6 max-w-7xl mx-auto">
          <ProductGrid products={t.productPages} onSelect={t.handleProductCardAction} />
        </div>
      </section>
    </div>
  );
};

export default EmeraldStudioTemplateServicesPage;
