import React, { useState } from "react";
import { useTemplateData } from "./templates/useTemplateData";
import { BROWN, FONT_IMPORT, LinedHeading, MUTED, PAGE_WRAP, SANS, TestimonialsCarousel } from "./templates/warmOrganic/WarmOrganicShared";
import ReviewFormModal from "./components/ReviewFormModal";

const WarmOrganicTemplateTestimonialsPage = () => {
  const t = useTemplateData();
  const { data } = t;
  const [reviewOpen, setReviewOpen] = useState(false);

  if (t.isPending) return null;
  if (t.error) return <div>Error loading testimonials page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const showWriteReview = data?.testimonialsEnableWriteReview !== false;

  return (
    <div className={`wo-template min-h-screen ${SANS}`} style={{ backgroundColor: "#F1E6D3", color: BROWN }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <div className="flex flex-col items-center gap-4">
          <LinedHeading title={data?.testimonialsPageHeading || data?.testimonialTitle || "Testimonials"} className="justify-center w-full" />
          {data?.testimonialsPageIntro ? (
            <p className="text-center text-[14px]" style={{ color: MUTED }}>
              {data.testimonialsPageIntro}
            </p>
          ) : null}
        </div>
        <div className="mt-8">
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

export default WarmOrganicTemplateTestimonialsPage;
