import React, { useEffect, useRef, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useNavigate, useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import ProductCard from "./components/ProductCard";
import LinedHeading from "./components/LinedHeading";
import { BsEnvelope } from "react-icons/bs";
import { MdOutlinePhone } from "react-icons/md";
import { CiMap } from "react-icons/ci";
import TempButton from "./components/TempButton";
import ProductModalContent from "./components/ProductModalContent";
import TempModal from "./components/TempModal";
import GallerySection from "./components/GallerySection";
import ReviewFormModal from "./components/ReviewFormModal";
import LogoCarousel from "./components/LogoCarousel";
import TestimonialCarousel from "./components/TestimonialCarousel";
import OverallRating from "./components/OverallRating";
import InclusionsSection from "./components/InclusionsSection";
import {
  getMediaSrc,
  getProductPath,
  getSectionPath,
  resolveSectionFromSlug,
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
  const pageNavItems = data?.pageNavItems || [];
  const isSectionEnabled = (slug) =>
    pageNavItems.some((item) => resolveSectionFromSlug(item.slug) === slug);

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

      {isSectionEnabled("about") ? (
        <section className="bg-black py-0" id="about">
          <Container>
            <div className="flex flex-col gap-8">
              <LinedHeading
                title={data?.aboutPageIntro || "About Our Vision"}
                className="[&>div]:border-[#f4e01a] [&>h2]:text-[#f4e01a]"
              />
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
      ) : null}

      {isSectionEnabled("products") ? (
      <section id="products" className="bg-[#efefef] py-10">
        <Container>
          <div className="flex flex-col gap-6">
            <LinedHeading title={productsSectionTitle} />
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
      ) : null}

      {/* Inclusions section: home-page amenities grid */}
      {Array.isArray(data?.inclusions) && data.inclusions.length > 0 ? (
        <InclusionsSection inclusions={data.inclusions} />
      ) : null}

      {isSectionEnabled("gallery") ? (
      <section id="gallery" className="bg-[#efefef] py-10">
        <Container>
          <div className="flex flex-col gap-6">
            <LinedHeading title={data?.galleryPageHeading || "Gallery"} />
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
      ) : null}
      <section id="testimonials" className="bg-[#efefef] py-10">
        <Container>
          <div className="flex flex-col gap-6">
            <LinedHeading title={data?.testimonialsPageHeading || "Testimonials"} />
            {data?.testimonialsPageIntro && (
              <p className="text-center text-gray-600">{data.testimonialsPageIntro}</p>
            )}

            <OverallRating testimonials={testimonials} />

            <TestimonialCarousel testimonials={testimonials} />
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

      {isSectionEnabled("contact") ? (
      <section id="contact" className="bg-[#efefef] py-10">
        <Container>
          <div className="flex flex-col gap-6">
            <LinedHeading title={data?.contactPageHeading || "Contact"} />
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
                      <div className="text-subtitle p-2 rounded-full border-2 border-accent">
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
      ) : null}

      {/* Trusted By - existing logo carousel section after contact */}
      {data?.logoCarousel?.enabled &&
      Array.isArray(data.logoCarousel.logos) &&
      data.logoCarousel.logos.length > 0 ? (
        <LogoCarousel
          logos={data.logoCarousel.logos
            .map((item) => {
              if (typeof item === "string") return item;
              return getMediaSrc(item);
            })
            .filter(Boolean)}
          title={data?.logoCarousel?.title || "Trusted By"}
        />
      ) : null}

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
        workspaceId={data?.workspaceId || ""}
      />

      {/* product modal */}
    </div>
  );
};

export default TemplateHome;
