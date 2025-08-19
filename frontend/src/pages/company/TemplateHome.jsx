// src/pages/TemplateHome.jsx
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import Container from "../../components/Container";

function getTenantFromHost() {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  return parts[0] === "www" ? null : parts[0];
}

const TemplateHome = () => {
  const intervalRef = useRef(null);
  const [sliderRef, slider] = useKeenSlider({
    loop: true,
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

  const { data, isPending, error } = useQuery({
    queryKey: ["company", tenant],
    queryFn: async () => {
      const res = await axios.get(
        `https://wonotestbe.vercel.app/api/editor/get-template/${tenant}`
      );
      return res.data;
    },
    enabled: !!tenant,
  });

  if (!tenant) return <div>No tenant specified</div>;
  if (isPending) return <div>Loading site...</div>;
  if (error) return <div>Error loading site: {error.message}</div>;

  return (
    <div className="w-screen">
      <div className="relative  overflow-hidden">
        {/* Slider (only images) */}
        <div ref={sliderRef} className="keen-slider w-full h-full">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="keen-slider__slide w-full h-full relative"
            >
              <img
                src={slide.img}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Static Overlay (independent of slides) */}
        <div className="absolute inset-0 bg-black/40 flex flex-col gap-6 justify-end items-center text-center text-white p-6 py-24 pointer-events-none">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
            {data.title || "Unknown"}
          </h1>
          <p className="text-lg md:text-2xl drop-shadow-md">{data.subTitle}</p>
          <button className="border-white border-2 px-8 py-2 rounded-full pointer-events-auto">
            {data.CTAButtonText || "Click here"}
          </button>
        </div>

        {/* Prev / Next Buttons */}
        <button
          onClick={() => slider.current?.prev()}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition"
        >
          <FaChevronLeft size={20} />
        </button>
        <button
          onClick={() => slider.current?.next()}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition"
        >
          <FaChevronRight size={20} />
        </button>
      </div>

      <section className="bg-black">
        <Container>
          <div className="flex flex-col gap-6">
            <h1 className="text-accent">About Us</h1>
            <p className="text-white">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi
              quae iure unde consequuntur, molestias porro odio? A fuga et amet
              ut sed cum beatae provident animi asperiores atque qui
              consequuntur ratione harum, veniam ex suscipit incidunt natus aut
              quam, rem eaque. Laborum assumenda labore, in temporibus dolore
              neque sunt quas illo, quidem voluptatibus quam modi dicta esse
              aspernatur! Quisquam est, laborum molestias eos similique corrupti
              nesciunt possimus magnam fuga obcaecati? Quam, accusamus obcaecati
              numquam eligendi reiciendis qui iste consequatur ducimus neque
              dicta doloribus delectus cum deleniti sequi possimus illo ad
              impedit eos excepturi minima. Eos cupiditate dignissimos
              doloremque quia tenetur!
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default TemplateHome;
