import React, { useState } from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BODY_FONT,
  FONT_IMPORT,
  HEADING_FONT,
  LinedHeading,
  SECTION_BG,
  STYLE_OVERRIDES,
  TEMPLATE_ROOT_CLASS,
  TestimonialsCarousel,
} from "./templates/emeraldStudio/EmeraldStudioShared";
import ReviewFormModal from "./components/ReviewFormModal";

const EmeraldStudioTemplateTestimonialsPage = () => {
  const t = useTemplateData();
  const { data } = t;
  const [reviewOpen, setReviewOpen] = useState(false);

  if (t.isPending) return null;
  if (t.error) return <div>Error loading testimonials page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const showWriteReview = data?.testimonialsEnableWriteReview !== false;

  return (
    <div className={`${TEMPLATE_ROOT_CLASS} min-h-screen bg-[#002c22] text-stone-100 ${BODY_FONT}`}>
      <style>{`${FONT_IMPORT}${STYLE_OVERRIDES}`}</style>
      <section className={`pt-20 pb-24 px-6 ${SECTION_BG}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-4 text-center mb-14">
            <div>
              <LinedHeading title={data?.testimonialsPageHeading || data?.testimonialTitle || "Testimonials"} className="justify-center" />
              <h2 className={`text-4xl md:text-5xl font-semibold leading-tight text-stone-100 ${HEADING_FONT}`}>What our clients say</h2>
            </div>
          </div>
          <TestimonialsCarousel testimonials={t.testimonials} showWriteReview={showWriteReview} onOpenReview={() => setReviewOpen(true)} />
        </div>
      </section>

      <ReviewFormModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        companyId={data?.companyId || ""}
        companyName={data?.companyName || ""}
        workspaceId={data?.workspaceId || ""}
      />
    </div>
  );
};

export default EmeraldStudioTemplateTestimonialsPage;
