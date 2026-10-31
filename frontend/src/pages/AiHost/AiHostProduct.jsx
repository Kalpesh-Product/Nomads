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
import AiAlignBox from "../../components/AiAlignBox";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { buildVerticalFilters, previewHref } from "../../constants/verticalTemplateCatalog";
import DeviceMockup from "../../components/DeviceMockup";
import { useWebsiteThemeCatalog } from "../../hooks/useWebsiteThemeCatalog";

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
  const { state, key: locationKey } = useLocation();
  const { themes } = useWebsiteThemeCatalog();
  const liveThemes = themes.filter((template) => template.status !== "coming-soon");
  const verticalFilters = buildVerticalFilters(themes);
  const initialTemplate = state?.template || liveThemes[0] || themes[0];

  const topRef = useRef(null);

  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const suggestedTemplates = liveThemes.filter(
    (template) => template.tag === selectedTemplate?.tag && template.id !== selectedTemplate?.id,
  );

  // A real "go back" — to wherever the visitor actually came from — not always
  // the themes grid. `location.key === "default"` means there's nothing before
  // this entry in the app's own history (direct link/refresh), so fall back to
  // the themes list instead of navigating(-1) out of the site.
  const onBack = () => {
    if (locationKey !== "default") {
      navigate(-1);
    } else {
      navigate("/themes");
    }
  };

  // Only re-sync from the navigation payload when it actually changes (a fresh
  // navigate("/product", { state }) call) — not on every selectedTemplate update,
  // otherwise picking a "few more suggestions" card gets immediately overwritten
  // back to the originally-opened template on the next render.
  useEffect(() => {
    if (state?.template) {
      setSelectedTemplate(state.template);
    }
  }, [state]);

  useEffect(() => {
    if (!selectedTemplate && initialTemplate) {
      setSelectedTemplate(initialTemplate);
    }
  }, [initialTemplate, selectedTemplate]);

  if (!selectedTemplate) return null;

  return (
    // Full-bleed: cancels AiHostLayout's px-1/md:px-6/lg:px-10/xl:px-24 so
    // this page spans the same width as the header row above it, letting
    // AiAlignBox reproduce the header's exact left/right alignment.
    <div className="-mx-1 mt-px flex flex-col md:-mx-6 lg:-mx-10 xl:-mx-24 w-[calc(100%+0.5rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+5rem)] xl:w-[calc(100%+12rem)]">
      <div className="sticky top-0 isolate z-30 bg-white">
        <AiAlignBox>
          <div className="flex min-h-11 w-full min-w-0 items-center gap-2 bg-white py-1.5 pb-3 md:h-11 md:pb-4">
            <button
              type="button"
              onClick={onBack}
              className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-500 bg-white text-sky-500 md:ml-0"
              aria-label="Back to themes"
            >
              <HiOutlineArrowLeft size={18} />
            </button>
            <nav className="flex min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap text-xs text-primary-blue sm:text-sm md:text-base" aria-label="Breadcrumb">
              <button type="button" className="shrink-0 text-primary-blue transition-colors hover:text-primary-dark" onClick={() => navigate("/themes")}>
                Themes
              </button>
              <span className="mx-1 shrink-0 md:mx-2">{">"}</span>
              <span className="shrink-0 text-primary-blue">
                {verticalFilters.find((filter) => filter.value === selectedTemplate.tag)?.label || selectedTemplate.tag}
              </span>
              <span className="mx-1 shrink-0 md:mx-2">{">"}</span>
              <span className="min-w-0 truncate align-bottom" title={selectedTemplate.name}>{selectedTemplate.name}</span>
            </nav>
          </div>
        </AiAlignBox>
      </div>
      <div
        key={selectedTemplate.id || "default"}
        className="flex flex-col"
      >
        <div className="flex flex-col">
          <AiAlignBox>
            <div
              ref={topRef}
              className="grid w-full grid-cols-1 items-center gap-0 py-6 lg:grid-cols-2 lg:py-10"
            >
              <div className="flex flex-col gap-6 justify-center w-full text-black">
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
                  <div className="flex w-full flex-wrap justify-center gap-4 lg:justify-start">
                    <GetStartedButton
                      handleSubmit={() => navigate("/signup?step=1")}
                    />
                    <a
                      href={previewHref(selectedTemplate)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full px-10 py-3 text-base font-semibold border border-black text-black hover:bg-black hover:text-white transition-colors duration-300"
                    >
                      Preview
                    </a>
                  </div>
                </div>
                <div data-aos="fade-up" className="flex w-full flex-col items-center mt-8 lg:mt-0 lg:items-end">
                  <div className="w-full max-w-[640px]">
                    <DeviceMockup
                      laptopSrc={selectedTemplate.heroImage}
                      mobileSrc={selectedTemplate.heroImageMobile}
                      alt={selectedTemplate.name}
                    />
                  </div>
                </div>
              </div>
          </AiAlignBox>
          <section>
            <AiAlignBox>
              <div className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-3 lg:gap-12 lg:py-16">
                <div className="col-span-1 text-[clamp(1.3rem,6.5vw,2rem)] leading-[1.15] sm:text-hero">
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
                          <span className="text-content">
                            {perk.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AiAlignBox>
          </section>
          <section>
            <AiAlignBox>
              <div className="w-full flex flex-col justify-center items-center gap-8 pb-12 lg:pb-16">
                {suggestedTemplates.length > 0 ? (
                  <>
                    <ReactFitty className="w-full self-stretch text-center text-3xl font-semibold tracking-[-0.03em] text-secondary-dark sm:text-4xl">
                      Few more suggestions for you
                    </ReactFitty>

                    {/* Mobile: strict 1-col grid (cards fill edge-to-edge, no
                        centering). sm+: centered flex-wrap so any under-filled
                        row centers. */}
                    <div className="grid grid-cols-1 gap-8 sm:flex sm:flex-wrap sm:justify-center">
                      {suggestedTemplates.map((template) => (
                        <button
                          type="button"
                          className="group flex w-full flex-col overflow-hidden border border-black/10 bg-white text-left sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)] min-[2000px]:w-[calc(25%-1.5rem)]"
                          key={template.id}
                          onClick={() => {
                            // A real navigation (not just local state) so switching to a
                            // suggested theme is its own history entry — otherwise "back"
                            // has nothing to step through and jumps straight to Themes.
                            navigate("/product", { state: { template } });

                            if (topRef.current) {
                              topRef.current.scrollIntoView({
                                behavior: "auto",
                                block: "start",
                              });
                            }
                          }}
                        >
                          <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                            <img
                              src={template.heroImage}
                              alt={template.name}
                              className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-4 p-5">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                {verticalFilters.find((filter) => filter.value === template.tag)?.label || template.tag}
                              </p>
                              <h3 className="mt-1 text-2xl font-semibold text-black">{template.name}</h3>
                            </div>
                            <span className="text-sm font-semibold text-primary-blue">View theme →</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="mx-auto max-w-2xl border-y border-black/10 py-12 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-blue">
                      More coming soon
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-black sm:text-4xl">
                      More {verticalFilters.find((filter) => filter.value === selectedTemplate.tag)?.label || selectedTemplate.tag} themes are on the way.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-black/55">
                      We are working on more options for this business type.
                    </p>
                  </div>
                )}
                <GetStartedButton
                  handleSubmit={() => navigate("/signup?step=1")}
                />
              </div>
            </AiAlignBox>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HostProduct;
