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
  console.log("selectedProdict ", selectedProduct);
  const { data, isPending, error } = useOutletContext();
  const sliderCount =
    data?.testimonials?.length > 3 ? 3 : data?.testimonials?.length;
  const [sliderRef, slider] = useKeenSlider({
    loop: data?.heroImages?.length > 1,
    mode: "snap",
    slides: { perView: 1 },
  });
  console.log("data from layout ", data?.testimonials?.length);

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

  // const { data, isPending, error } = useQuery({
  //   queryKey: ["company", tenant],
  //   queryFn: async () => {
  //     const res = await axios.get(
  //       `https://wonotestbe.vercel.app/api/editor/get-template/${tenant}`
  //     );
  //     return res.data;
  //   },
  //   enabled: !!tenant,
  // });

  // const products = [
  //   { id: 1, productName: "co-working", img: "" },
  //   { id: 2, productName: "co-working", img: "" },
  //   { id: 3, productName: "co-working", img: "" },
  //   { id: 4, productName: "co-working", img: "" },
  //   { id: 5, productName: "co-working", img: "" },
  //   { id: 6, productName: "co-working", img: "" },
  // ];

  // const testimonials = [
  //   {
  //     id: 1,
  //     image: "https://randomuser.me/api/portraits/women/44.jpg",
  //     name: "Sarah K.",
  //     role: "UX Designer",
  //     company: "Brello",
  //     text: "I was looking for a way to streamline my design process and the Anima's Landing Page UI Kit was a lifesaver! The intuitive design and ease of customisation have saved me hours of time and effort. Highly recommend!",
  //     rating: 4,
  //   },
  //   {
  //     id: 2,
  //     image: "https://randomuser.me/api/portraits/men/32.jpg",
  //     name: "David P.",
  //     role: "Product Manager",
  //     company: "NextGen",
  //     text: "Using this kit has improved our workflow dramatically. The team can focus more on innovation rather than setup. Super smooth experience!",
  //     rating: 5,
  //   },
  //   {
  //     id: 3,
  //     image: "https://randomuser.me/api/portraits/women/68.jpg",
  //     name: "Maya R.",
  //     role: "Frontend Developer",
  //     company: "TechFlow",
  //     text: "Simple, elegant and effective. It took my project to the next level with minimal effort. Highly recommended.",
  //     rating: 5,
  //   },
  //   {
  //     id: 4,
  //     image: "https://randomuser.me/api/portraits/men/77.jpg",
  //     name: "Liam C.",
  //     role: "Software Engineer",
  //     company: "CloudCore",
  //     text: "This toolkit streamlined my work. I could focus more on solving real problems instead of repetitive setup. Amazing resource!",
  //     rating: 4,
  //   },
  //   {
  //     id: 5,
  //     image: "https://randomuser.me/api/portraits/women/21.jpg",
  //     name: "Anna T.",
  //     role: "Designer",
  //     company: "PixelPro",
  //     text: "Very intuitive and well thought out. My clients love the polished results I can now deliver faster than ever.",
  //     rating: 5,
  //   },
  //   {
  //     id: 6,
  //     image: "https://randomuser.me/api/portraits/men/15.jpg",
  //     name: "Mark R.",
  //     role: "CTO",
  //     company: "InnoWave",
  //     text: "Highly flexible and easy to integrate. This is my go-to for building solid and scalable UI foundations.",
  //     rating: 5,
  //   },
  // ];

  if (!tenant) return <div>No tenant specified</div>;
  if (isPending) return <div>Loading site...</div>;
  if (error) {
    console.log("error", error);
    return <div>Error loading site: {error.message}</div>;
  }

  console.log("data", data);

  const heroImages = isPending ? [] : data?.heroImages;

  const galleryImages = isPending ? [] : data?.gallery;
  const products = isPending ? [] : data?.products;
  console.log("products : ", products);
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

          <TempButton buttonText={data?.CTAButtonText} />
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
            <p className="text-white">{data?.about || "About section here"}</p>
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
