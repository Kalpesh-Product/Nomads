import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import TestimonialCarousel from "./components/TestimonialCarousel";
import OverallRating from "./components/OverallRating";
import ReviewFormModal from "./components/ReviewFormModal";
import LinedHeading from "./components/LinedHeading";
import { getApprovedTestimonials } from "./utils/pageTemplateUtils";

const TemplateTestimonialsPage = () => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { data, isPending, error, approvedReviews = [] } =
    useOutletContext();
  if (isPending) return null;
  if (error) return <div>Error loading testimonials page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const testimonials = [
    ...getApprovedTestimonials(data?.testimonials),
    ...approvedReviews,
  ];

  return (
    <section className="min-h-[60vh] bg-[#efefef] py-10">
      <Container>
        <div className="flex flex-col gap-6">
          <LinedHeading title={data?.testimonialsPageHeading || "Testimonials"} />
          {data?.testimonialsPageIntro ? (
            <p className="text-center text-gray-600">
              {data.testimonialsPageIntro}
            </p>
          ) : null}

          <OverallRating testimonials={testimonials} />

          <TestimonialCarousel testimonials={testimonials} />

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsReviewOpen(true)}
              className="rounded-full border border-[#7d7d7d] px-7 py-3 text-sm font-semibold uppercase text-[#2f3b58] transition hover:bg-white"
            >
              Write a Review
            </button>
          </div>
        </div>
      </Container>
      <ReviewFormModal
        open={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        companyId={data?.companyId || ""}
        companyName={data?.companyName || ""}
        workspaceId={data?.workspaceId || ""}
      />
    </section>
  );
};

export default TemplateTestimonialsPage;
