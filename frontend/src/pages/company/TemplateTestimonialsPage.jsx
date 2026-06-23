import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import TestimonialCard from "./components/TestimonialCard";
import ReviewFormModal from "./components/ReviewFormModal";
import { getApprovedTestimonials } from "./utils/pageTemplateUtils";

const TemplateTestimonialsPage = () => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data, isPending, error, approvedReviews = [] } =
    useOutletContext();
  if (isPending) return null;
  if (error) return <div>Error loading testimonials page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const testimonials = [
    ...getApprovedTestimonials(data?.testimonials),
    ...approvedReviews,
  ];

  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(currentIndex * perPage, (currentIndex + 1) * perPage);

  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPages);
    }, 4000);
    return () => clearInterval(timer);
  }, [totalPages]);

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
          
          <div className="relative">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((item, index) => (
                <TestimonialCard
                  key={item?._id || item?.key || `testimonial-${index}`}
                  item={item}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 w-2 rounded-full transition ${
                      i === currentIndex ? "bg-slate-700" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            ) : null}
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
