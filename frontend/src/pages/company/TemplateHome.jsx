// src/pages/TemplateHome.jsx
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import Container from "../../components/Container";
import ProductCard from "./components/ProductCard";
import TestimonialCard from "./components/TestimonialCard";
import { BsEnvelope } from "react-icons/bs";
import { MdOutlinePhone } from "react-icons/md";
import { CiMap } from "react-icons/ci";
import TempButton from "./components/TempButton";
import TransparentModal from "../../components/TransparentModal";
import ProductModalContent from "./components/ProductModalContent";
import TempModal from "./components/TempModal";
import { useOutletContext } from "react-router-dom";
import GallerySection from "./components/GallerySection";

function getTenantFromHost() {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  return parts[0] === "www" ? null : parts[0];
}

const TemplateHome = () => {
  const intervalRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const { data, isPending, error } = useOutletContext();
  const sliderCount =
    data?.testimonials?.length > 3 ? 3 : data?.testimonials?.length;
  const [sliderRef, slider] = useKeenSlider({
    loop: data?.heroImages?.length > 1,
    mode: "snap",
    slides: { perView: 1 },
  });

  const [testimonialRef, testimonialSlider] = useKeenSlider({
    loop: true,
    mode: "snap",
    spacing: 16,
    slides: {
      perView: 1, // default (mobile)
      spacing: 16,
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: sliderCount - 1, spacing: 24 },
      },
      "(min-width: 1024px)": {
        slides: { perView: sliderCount, spacing: 32 },
      },
    },
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

  const slides = [
    {
      id: 1,
      img: "https://picsum.photos/id/1015/1600/900",
    },
    {
      id: 2,
      img: "https://picsum.photos/id/1016/1600/900",
    },
    {
      id: 3,
      img: "https://picsum.photos/id/1018/1600/900",
    },
  ];

  const tenant = getTenantFromHost();

  if (!tenant) return <div>No tenant specified</div>;
  if (isPending) return <div>Loading site...</div>;
  if (!data.isActive) return <div>Website is currently inactive</div>;
  if (error) {
    console.log("error", error);
    return <div>Error loading site: {error.message}</div>;
  }

  const heroImages = isPending ? [] : data?.heroImages;

  const about = isPending ? [] : data?.about;
  const galleryImages = isPending ? [] : data?.gallery;
  const products = isPending ? [] : data?.products;
  const testimonials = isPending ? [] : data?.testimonials;

  return (
    <div className="w-screen ">
      <div className="relative h-screen  overflow-hidden" id="hero">
        {/* Slider (only images) */}
        <div ref={sliderRef} className="keen-slider w-full h-full">
          {heroImages.map((slide) => (
            <div
              key={slide._id}
              className="keen-slider__slide w-full h-full relative"
            >
              <img
                src={slide.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Static Overlay (independent of slides) */}
        <div className="absolute inset-0 bg-black/40 flex flex-col gap-6 justify-end items-center text-center text-white p-6 py-24 pointer-events-none">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
            {data?.title || "Unknown"}
          </h1>
          <p className="text-lg md:text-2xl drop-shadow-md">{data?.subTitle}</p>

          <TempButton
            handleClick={() => handleScroll("contact")}
            buttonText={data?.CTAButtonText}
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

      <section className="bg-black py-8" id="about">
        <Container>
          <div className="flex flex-col gap-6">
            <h1 className="text-accent text-center text-title font-semibold">
              About Our Vision
            </h1>
            <div className="text-center text-subtitle">
              {about?.length > 0
                ? about?.map((para) => (
                    <>
                      <p className="text-white">{para}</p>
                      <br />
                    </>
                  ))
                : "About section here"}
            </div>
          </div>
        </Container>
      </section>

      <section id="products" className="py-8">
        <Container>
          <div className="flex flex-col gap-6">
            <h1 className="uppercase text-center text-title font-semibold">
              Our products
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedProduct(item);
                    setOpen(true);
                  }}
                >
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <section id="gallery" className="py-8">
        <Container>
          <div className="flex flex-col gap-6">
            <h1 className="uppercase text-center text-title font-semibold">
              Gallery
            </h1>
            <div>
              <GallerySection gallery={galleryImages} />
            </div>
          </div>
        </Container>
      </section>
      <section id="testimonials" className="py-8">
        <Container>
          <div className="flex flex-col gap-6">
            <h1 className="uppercase text-center text-title font-semibold">
              Testimonials
            </h1>

            <div className="relative">
              {/* Prev */}
              <button
                type="button"
                onClick={() => testimonialSlider.current?.prev()}
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10
                     bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition"
                aria-label="Previous testimonials"
              >
                <FaChevronLeft size={18} />
              </button>

              {/* Slider */}
              <div ref={testimonialRef} className="keen-slider">
                {testimonials.map((t) => (
                  <div key={t._id} className="keen-slider__slide px-10">
                    <TestimonialCard item={t} />
                  </div>
                ))}
              </div>

              {/* Next */}
              <button
                type="button"
                onClick={() => testimonialSlider.current?.next()}
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10
                     bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition"
                aria-label="Next testimonials"
              >
                <FaChevronRight size={18} />
              </button>
            </div>
          </div>
        </Container>
      </section>

      <section id="contact" className="py-8">
        <Container>
          <div className="flex flex-col gap-6">
            <h1 className="uppercase text-center text-title font-semibold">
              Contact
            </h1>
            <div className="flex md:flex-nowrap flex-wrap items-stretch gap-4">
              <iframe
                title="India Office"
                className="w-full h-[25rem]"
                loading="lazy"
                src={data?.mapUrl}
              ></iframe>
              <div className="shadow-md w-full lg:w-[40%] p-4">
                <div className="flex flex-col gap-4 h-full">
                  <div className="h-16 w-full overflow-hidden">
                    <img
                      src={data?.companyLogo?.url}
                      alt="company-logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col gap-4 h-full justify-center items-center">
                    <div className="flex gap-4 w-full items-center">
                      <div className="text-subtitle p-2 rounded-full border-2 border-accent">
                        <BsEnvelope />
                      </div>
                      <div className="text-small pl-2">
                        <span>{data.email}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 w-full items-center">
                      <div className="text-subtitle p-2 rounded-full border-2 border-accent">
                        <MdOutlinePhone />
                      </div>
                      <div className="text-small pl-2">
                        <span>{data.phone}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 w-full items-center">
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

      {/* product modal */}
    </div>
  );
};

export default TemplateHome;
