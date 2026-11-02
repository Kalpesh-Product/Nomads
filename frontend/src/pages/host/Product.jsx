import React, { useEffect, useRef, useState } from "react";
import {
  FaRegCircleCheck,
  FaGaugeSimpleHigh,
  FaRegClock,
  FaImages,
  FaWindowMaximize,
  FaRegIdCard,
} from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import GetStartedButton from "../../components/GetStartedButton";
import { ReactFitty } from "react-fitty";
import Container from "../../components/Container";
import { VERTICAL_TEMPLATE_CATALOG, VERTICAL_FILTERS, templateDemoUrl } from "../../constants/verticalTemplateCatalog";
import DeviceMockup from "../../components/DeviceMockup";

const features = [
  "No Code Website",
  "Booking Engine",
  "Payment Gateway",
  "Leads Management",
  "AI SEO",
  "Notifications",
];

const perks = [
  {
    icon: <FaRegCircleCheck />,
    title: "Works with latest wono changes",
    description:
      "Themes on the Wono Theme Store are guaranteed to stay up to date and work with Wono's ever-growing feature set.",
  },
  {
    icon: <FaGaugeSimpleHigh />,
    title: "Speed tested and approved",
    description:
      "Every theme in the Theme Store meets Wono's performance standards, ensuring a faster shopping experience for your buyers.",
  },
  {
    icon: <FaRegClock />,
    title: "Unlimited free trial",
    description:
      "Try the theme for free with your own products, brand colors, and customizations. One-time payment of $300 if you publish the theme to your store.",
  },
  {
    icon: <FaImages />,
    title: "Free high resolution photos",
    description:
      "Demo stores aren't included, but you can get free stock photos from Wono Burst.",
  },
  {
    icon: <FaWindowMaximize />,
    title: "Free theme updates",
    description:
      "Get the latest theme features and fixes from the Theme Store. You can redownload your purchase at any time.",
  },
  {
    icon: <FaRegIdCard />,
    title: "Non-expiring license for one store",
    description:
      "Your payment entitles you to use the theme on a single store, and keep it as long as you like.",
  },
];

const HostProduct = () => {
  const { state } = useLocation();
  const initialTemplate = state?.template || VERTICAL_TEMPLATE_CATALOG[0];

  const topRef = useRef(null);

  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);

  useEffect(() => {
    if (state?.template) {
      setSelectedTemplate(state.template);
    }
  }, [state]);

  return (
    <div
      key={selectedTemplate.id || "default"}
      className="flex flex-col"
    >
      <div className="flex flex-col">
        <section
          ref={topRef}
          className="w-full bg-black flex flex-col justify-center gap-6 "
        >
          <Container className="!w-full !pt-4 lg:!pt-6">
            <nav className="flex min-w-0 items-center overflow-x-auto whitespace-nowrap pb-2 text-sm custom-scrollbar-hide sm:overflow-visible md:text-base" aria-label="Breadcrumb">
              <button type="button" className="shrink-0 text-sky-400 transition-colors hover:text-sky-300" onClick={() => navigate("/hostold/themes")}>
                Themes
              </button>
              <span className="mx-1 shrink-0 text-white/50 md:mx-2">{">"}</span>
              <span className="shrink-0 text-white">
                {VERTICAL_FILTERS.find((filter) => filter.value === selectedTemplate.tag)?.label || selectedTemplate.tag}
              </span>
              <span className="mx-1 shrink-0 text-white/50 md:mx-2">{">"}</span>
              <span className="shrink-0 text-white">{selectedTemplate.name}</span>
            </nav>
            <div className="flex flex-wrap gap-10 lg:flex-nowrap lg:gap-60 w-full">
              <div className="flex flex-col gap-6 justify-center w-full text-white">
                <h1 className="text-hero font-semibold">INCLUSIONS</h1>
                <ul className="flex flex-col gap-2 ">
                  {features.map((feat) => (
                    <li className="flex gap-2 text-content lg:text-subtitle " key={feat}>
                      <span className="text-[#0AA9EF] font-bold">
                        ✔&nbsp;&nbsp;
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-4">
                  <GetStartedButton
                    handleSubmit={() => navigate("/signup")}
                    externalStyles="!bg-white !text-black"
                  />
                  <a
                    href={templateDemoUrl(selectedTemplate)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-10 py-3 text-base font-semibold border border-white text-white hover:bg-white hover:text-black transition-colors duration-300"
                  >
                    Preview
                  </a>
                </div>
              </div>
              <div data-aos="fade-up" className="flex w-full flex-col items-center mt-8 lg:mt-0">
                <DeviceMockup
                  laptopSrc={selectedTemplate.heroImage}
                  mobileSrc={selectedTemplate.heroImageMobile}
                  alt={selectedTemplate.name}
                />
              </div>
            </div>
          </Container>
        </section>
        <section>
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="text-hero col-span-1">
                <h1>
                  Built with confidence — <br />
                  The theme store promise
                </h1>
              </div>
              <div className="col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {perks.map((perk) => (
                    <div className="flex gap-2 items-start" key={perk.title}>
                      <div className="text-content mt-1">{perk.icon}</div>
                      <div className="flex flex-col gap-2">
                        <h2 className="font-bold">{perk.title}</h2>
                        <span className="text-content">{perk.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
        <section className="bg-[#E9F9FF]">
          <Container>
            <div className="w-full  flex flex-col justify-center items-center gap-8">
              <ReactFitty className="w-full self-stretch text-center">Few more suggestions for you</ReactFitty>

              <div className="grid grid-cols-1 lg:grid-cols-2 justify-between gap-8">
                {VERTICAL_TEMPLATE_CATALOG.filter(
                  (template) => template.tag === selectedTemplate.tag && template.id !== selectedTemplate.id,
                ).map((template) => (
                  <div
                    className="w-full h-full overflow-hidden rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.5)] cursor-pointer"
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template); // update hero image

                      // Scroll the hero section into view
                      if (topRef.current) {
                        topRef.current.scrollIntoView({
                          behavior: "auto", // or "auto" if you want instant jump
                          block: "start",
                        });
                      }
                    }}
                  >
                    <img
                      src={template.heroImage}
                      alt={template.name}
                      className="w-full h-full object-cover hover:scale-[1.2] transition-transform duration-500 ease"
                    />
                  </div>
                ))}
              </div>
              <GetStartedButton handleSubmit={() => navigate("/signup")} />
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
};

export default HostProduct;
