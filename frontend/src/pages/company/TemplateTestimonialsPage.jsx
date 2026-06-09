import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import TestimonialCard from "./components/TestimonialCard";
import ReviewFormModal from "./components/ReviewFormModal";
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
          <h1 className="text-center text-title font-semibold uppercase">
            {data?.testimonialsPageHeading || "Testimonials"}
          </h1>
          {data?.testimonialsPageIntro ? (
            <p className="text-center text-gray-600">
              {data.testimonialsPageIntro}
            </p>
          ) : null}
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <TestimonialCard
                key={item?._id || item?.key || `testimonial-${index}`}
                item={item}
              />
            ))}
          </div>
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
      />
    </section>
  );
};

export default TemplateTestimonialsPage;
