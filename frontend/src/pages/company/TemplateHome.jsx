import React, { useEffect, useRef, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useNavigate, useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import ProductCard from "./components/ProductCard";
import TestimonialCard from "./components/TestimonialCard";
import { BsEnvelope } from "react-icons/bs";
import { MdOutlinePhone } from "react-icons/md";
import { CiMap } from "react-icons/ci";
import TempButton from "./components/TempButton";
import ProductModalContent from "./components/ProductModalContent";
import TempModal from "./components/TempModal";
import GallerySection from "./components/GallerySection";
import ReviewFormModal from "./components/ReviewFormModal";
import {
  getMediaSrc,
  getProductPath,
  getSectionPath,
} from "./utils/templateRouteUtils";
// import { getSectionTitleByVertical, normalizeVertical } from "./utils/vertical";
import {
  getEnabledProductPages,
  getPreviewTestimonials,
} from "./utils/pageTemplateUtils";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import TransparentModal from "../../components/TransparentModal";

function getTenantFromHost() {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  return parts[0] === "www" ? null : parts[0];
}

const TemplateHome = () => {
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const testimonialPerPage = 3;

  const { data, isPending, error, routeContext, approvedReviews = [] } =
    useOutletContext();
  const [sliderRef, slider] = useKeenSlider({
    loop: data?.heroImages?.length > 1,
    mode: "snap",
    slides: { perView: 1 },
  });

  useEffect(() => {
    if (!slider) return;
    intervalRef.current = setInterval(() => {
      slider.current?.next();
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [slider]);

  useEffect(() => {
    const t = isPending ? [] : getPreviewTestimonials(data, approvedReviews);
    const total = Math.ceil(t.length / testimonialPerPage);
    if (total <= 1) return;
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [data, approvedReviews, isPending]);

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }

    // Close the drawer slightly later
    setTimeout(() => setOpen(false), 650);
  };

  // Legacy static slides kept for future fallback/testing.
  // const slides = [
  //   { id: 1, img: "https://picsum.photos/id/1015/1600/900" },
  //   { id: 2, img: "https://picsum.photos/id/1016/1600/900" },
  //   { id: 3, img: "https://picsum.photos/id/1018/1600/900" },
  // ];

  const tenant = getTenantFromHost();

  if (!tenant) return <div>No tenant specified</div>;
  if (isPending) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-primary-blue rounded-full"></div>
      </div>
    );
  }

  // if (!data.isActive) return <div>Website is currently inactive</div>;
  if (error) {
    console.log("error", error);
    return <div>Error loading site: {error.message}</div>;
  }

  if (!data) {
    return <div>Site data is currently unavailable</div>;
  }
  if (data.isActive === false) return <div>Website is currently inactive</div>;

  const heroImages = isPending ? [] : data?.heroImages;

  const about = isPending ? [] : data?.about;
  const galleryImages = isPending ? [] : data?.gallery;
  const products = isPending ? [] : data?.products;
  const productPages = isPending
    ? []
    : Array.isArray(data?.productPages) && data.productPages.length > 0
      ? data.productPages
      : getEnabledProductPages(data?.productDropdownPages);
  const testimonials = isPending
    ? []
    : getPreviewTestimonials(data, approvedReviews);
  const totalTestPages = Math.ceil(testimonials.length / testimonialPerPage);
  const visibleTestimonials = testimonials.slice(testimonialIndex * testimonialPerPage, (testimonialIndex + 1) * testimonialPerPage);
  // Legacy vertical-based rendering retained as backup only:
  // const vertical = normalizeVertical(data?.vertical);
  // const isCafe = vertical === "cafe";
  const safeProductTitle =
    typeof data?.productTitle === "string" ? data.productTitle.trim() : "";
  const productsSectionTitle = safeProductTitle || "Our Products";
  const heroButtonText =
    typeof data?.CTAButtonText === "string" && data.CTAButtonText.trim()
      ? data.CTAButtonText.trim()
      : "Explore";
  const galleryPath = getSectionPath(
    "gallery",
    routeContext?.prefix || window.location.pathname,
  );

  return (
    <div className="min-h-screen w-full bg-[#efefef]">
      <div className="relative h-screen overflow-hidden" id="hero">
        {/* Slider (only images) */}
        <div ref={sliderRef} className="keen-slider w-full h-full">
          {heroImages.map((slide, index) => (
            <div
              key={slide?._id || slide?.id || `hero-${index}`}
              className="keen-slider__slide w-full h-full relative"
            >
              <img
                src={getMediaSrc(slide)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Static Overlay (independent of slides) */}
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-6 bg-black/40 p-6 py-24 text-center text-white pointer-events-none">
          <h1 className="text-4xl font-bold drop-shadow-lg md:text-6xl">
            {data?.title || "Unknown"}
          </h1>
          <p className="text-lg drop-shadow-md md:text-2xl">{data?.subTitle}</p>

          <TempButton
            handleClick={() => handleScroll("contact")}
            buttonText={heroButtonText}
          />
        </div>

        {/* Prev / Next Buttons */}
        {data?.heroImages?.length > 1 && (
          <button
            onClick={() => slider.current?.prev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition"
          >
            <FaChevronLeft size={20} />
          </button>
        )}

        {data?.heroImages?.length > 1 && (
          <button
            onClick={() => slider.current?.next()}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition"
          >
            <FaChevronRight size={20} />
          </button>
        )}
      </div>

      <section className="bg-black py-0" id="about">
        <Container>
          <div className="flex flex-col gap-8">
            <h1 className="text-center text-title font-semibold text-[#f4e01a]">
              {data?.aboutPageIntro || "About Our Vision"}
            </h1>
            <div className="mx-auto max-w-7xl space-y-4 text-center text-subtitle">
              {about?.length > 0
                ? about?.map((para, index) => (
                    <React.Fragment key={`${String(para).slice(0, 24)}-${index}`}>
                      <p className="text-white">{para}</p>
                      <br />
                    </React.Fragment>
                  ))
                : "About section here"}
            </div>
          </div>
        </Container>
      </section>

      <section id="products" className="bg-[#efefef] py-10">
        <Container>
          <div className="flex flex-col gap-6">
            <h1 className="uppercase text-center text-title font-semibold">
              {productsSectionTitle}
            </h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productPages.length > 0
                ? productPages.map((item) => (
                    <div key={item?.slug || item?.name}>
                      <ProductCard
                        product={item}
                        buttonText="EXPLORE"
                        onClick={() => {
                          if (item?.slug) {
                            navigate(
                              getProductPath(
                                item.slug,
                                routeContext?.prefix || window.location.pathname,
                              ),
                            );
                            return;
                          }
                          setSelectedProduct(item);
                          setOpen(true);
                        }}
                      />
                    </div>
                  ))
                : products?.map((item, index) => (
                <div key={item?._id || item?.id || `product-${index}`}>
                  <ProductCard
                    product={item}
                    buttonText="EXPLORE"
                    onClick={() => {
                      if (item?.slug) {
                        navigate(
                          getProductPath(
                            item.slug,
                            routeContext?.prefix || window.location.pathname,
                          ),
                        );
                        return;
                      }
                      setSelectedProduct(item);
                      setOpen(true);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <section id="gallery" className="bg-[#efefef] py-10">
        <Container>
          <div className="flex flex-col gap-6">
            <h1 className="uppercase text-center text-title font-semibold">
              {data?.galleryPageHeading || "Gallery"}
            </h1>
            <div>
              <GallerySection
                gallery={galleryImages}
                mode="preview"
                onViewAll={() => navigate(galleryPath)}
              />
            </div>
          </div>
        </Container>
      </section>
      <section id="testimonials" className="bg-[#efefef] py-10">
        <Container>
          <div className="flex flex-col gap-6">
            <h1 className="uppercase text-center text-title font-semibold">
              {data?.testimonialsPageHeading || "Testimonials"}
            </h1>
            {data?.testimonialsPageIntro && (
              <p className="text-center text-gray-600">{data.testimonialsPageIntro}</p>
            )}

            <div className="relative">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleTestimonials.map((t) => (
                  <TestimonialCard key={t._id || t.key} item={t} />
                ))}
              </div>

              {totalTestPages > 1 ? (
                <div className="mt-4 flex justify-center gap-2">
                  {Array.from({ length: totalTestPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTestimonialIndex(i)}
                      className={`h-2 w-2 rounded-full transition ${
                        i === testimonialIndex ? "bg-slate-700" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex justify-center pt-4">
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
      </section>

      <section id="contact" className="bg-[#efefef] py-10">
        <Container>
          <div className="flex flex-col gap-6">
            <h1 className="uppercase text-center text-title font-semibold">
              {data?.contactPageHeading || "Contact"}
            </h1>
            <div className="flex flex-wrap items-stretch gap-4 md:flex-nowrap">
              <iframe
                title="India Office"
                className="w-full h-[25rem]"
                loading="lazy"
                src={data?.mapUrl}
              ></iframe>
              <div className="w-full p-4 shadow-md lg:w-[40%]">
                <div className="flex h-full flex-col gap-4">
                  <div className="h-16 w-full overflow-hidden">
                    <img
                      src={getMediaSrc(data?.companyLogo)}
                      alt="company-logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex h-full flex-col items-center justify-center gap-4">
                    <div className="flex w-full items-center gap-4">
                      <div className="text-subtitle p-2 rounded-full border-2 border-accent">
                        <BsEnvelope />
                      </div>
                      <div className="text-small pl-2">
                        <span>{data.websiteEmail || data.email}</span>
                      </div>
                    </div>
                    <div className="flex w-full items-center gap-4">
                      <div className="text-subtitle p-2 rounded-full border-2 border-accent">
                        <MdOutlinePhone />
                      </div>
                      <div className="text-small pl-2">
                        <span>{data.phone}</span>
                      </div>
                    </div>
                    <div className="flex w-full items-center gap-4">
                      <div className="text-subtitle p-2 rounded-full ">
                        <CiMap />
                      </div>
                      <div className="text-small pl-2">
                        <span>{data.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* product modal */}
      <TempModal
        width="w-[80%] lg:w-[60%]"
        bgColor="bg-white"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ProductModalContent
          product={selectedProduct}
          company={isPending ? [] : data}
          onClose={() => setOpen(false)}
        />
      </TempModal>

      <ReviewFormModal
        open={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        companyId={data?.companyId || ""}
        companyName={data?.companyName || ""}
      />

      {/* product modal */}
    </div>
  );
};

export default TemplateHome;
