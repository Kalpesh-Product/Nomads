import React, { useState } from "react";
import { useTemplateData } from "./templates/useTemplateData";
import { ACCENT, FONT_IMPORT, LinedHeading, PAGE_BG, PAGE_WRAP, TEXT, TestimonialsCarousel, focusStyle } from "./templates/freshStudio/FreshStudioShared";
import ReviewFormModal from "./components/ReviewFormModal";

const FreshStudioTemplateTestimonialsPage = () => {
  const t = useTemplateData();
  const { data } = t;
  const [reviewOpen, setReviewOpen] = useState(false);

  if (t.isPending) return null;
  if (t.error) return <div>Error loading testimonials page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const showWriteReview = data?.testimonialsEnableWriteReview !== false;

  return (
    <div className="min-h-screen font-['Work_Sans',ui-sans-serif,system-ui,sans-serif]" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <div className="flex flex-col items-center gap-4 text-center">
          <LinedHeading title={data?.testimonialsPageHeading || "Testimonials"} style={{ color: ACCENT }} />
          {data?.testimonialsPageIntro ? (
            <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              {data.testimonialsPageIntro}
            </p>
          ) : null}
          {showWriteReview ? (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="text-[13px] font-semibold focus-visible:outline focus-visible:outline-2"
              style={{ color: ACCENT, ...focusStyle }}
            >
              Write a review
            </button>
          ) : null}
        </div>
        <div className="mt-7">
          <TestimonialsCarousel testimonials={t.testimonials} />
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

export default FreshStudioTemplateTestimonialsPage;
