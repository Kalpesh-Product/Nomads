import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  ACCENT,
  ACCENT_GRADIENT,
  CARD,
  EYEBROW,
  FONT_IMPORT,
  HEADING,
  HEADING_FONT,
  Inclusions,
  LinedHeading,
  LogoCarousel,
  MUTED,
  MailIcon,
  PAGE_BG,
  PAGE_WRAP,
  PhoneIcon,
  PinIcon,
  ProductGrid,
  TEXT,
  TestimonialsCarousel,
  WHITE,
  WRAP,
  focusStyle,
} from "./templates/freshStudio/FreshStudioShared";
import { getMediaSrc } from "./utils/templateRouteUtils";
import ReviewFormModal from "./components/ReviewFormModal";

const getNonEmptyTextList = (...values) => values.map((v) => String(v || "").trim()).filter(Boolean);

const FreshStudioTemplateHome = () => {
  const t = useTemplateData();
  const { data } = t;
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [heroIndex, setHeroIndex] = React.useState(0);

  if (t.isPending) return null;
  if (t.error) return <div>Error loading site: {t.error.message}</div>;
  if (!data) return <div>Site data is currently unavailable</div>;
  if (data.isActive === false) return <div>Website is currently inactive</div>;

  const heroImages = (Array.isArray(data?.heroImages) ? data.heroImages : []).map(getMediaSrc).filter(Boolean);
  const mainHeroImage = getMediaSrc(data?.mainHeroImage) || heroImages[0] || "";

  React.useEffect(() => {
    if (heroImages.length <= 1) return undefined;
    const timer = window.setInterval(() => setHeroIndex((prev) => (prev + 1) % heroImages.length), 3500);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroImages.length]);

  const aboutIntroBlocks = getNonEmptyTextList(
    data?.aboutPageIntro,
    data?.aboutPageOverview,
    ...(Array.isArray(data?.about) ? data.about.map((block) => (typeof block === "string" ? block : block?.text)) : []),
  );

  const showWriteReview = data?.testimonialsEnableWriteReview !== false;

  return (
    <div className="min-h-screen font-['Work_Sans',ui-sans-serif,system-ui,sans-serif]" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
      <style>{FONT_IMPORT}</style>

      {t.isHomeSectionEnabled("home_hero") ? (
        <section className="relative overflow-hidden" style={{ backgroundColor: PAGE_BG }}>
          {heroImages.length ? (
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
              <div
                className="flex h-full w-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${(heroIndex % heroImages.length) * 100}%)` }}
              >
                {heroImages.map((src, idx) => (
                  <div key={`hero-bg-${idx}`} className="h-full min-w-full">
                    <img src={src} alt="" className="h-full w-full object-cover blur-sm" style={{ opacity: 0.85 }} />
                  </div>
                ))}
              </div>
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(10,10,18,0.35) 0%, rgba(10,10,18,0.55) 55%, rgba(10,10,18,0.82) 100%)" }}
              />
            </div>
          ) : null}
          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 md:gap-6 md:py-24 md:pl-10 md:pr-0">
            <div className="flex flex-col gap-5">
              <h1 className={`text-[38px] font-black leading-[1.05] tracking-[-0.02em] md:text-[56px] ${HEADING_FONT}`} style={{ color: WHITE }}>
                {data?.title || data?.companyName || ""}
              </h1>
              <p className="max-w-md text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>
                {data?.subTitle || ""}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="rounded-full px-7 py-3 text-[14px] font-semibold text-white transition duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ background: ACCENT_GRADIENT, outlineColor: ACCENT }}
                >
                  {data?.CTAButtonText || "Get in touch"}
                </button>
                <button
                  type="button"
                  onClick={() => t.goToSection("contact")}
                  className="rounded-full bg-white px-7 py-3 text-[14px] font-semibold transition duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ color: "#0A0A12", outlineColor: WHITE }}
                >
                  Contact us
                </button>
              </div>
            </div>

            <div className="relative md:justify-self-end">
              <div
                className="pointer-events-none absolute -inset-6 rounded-[40px] opacity-50 blur-3xl md:-inset-10"
                style={{ background: "radial-gradient(circle, #D94B4B, transparent 65%)" }}
              />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] md:aspect-square md:w-[420px] md:rounded-[32px]" style={{ backgroundColor: "#16161f" }}>
                {mainHeroImage ? (
                  <img src={mainHeroImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "radial-gradient(circle at 30% 25%, rgba(217,75,75,1), transparent 55%)" }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {t.aboutPageEnabled && t.isHomeSectionEnabled("home_about") && aboutIntroBlocks.length ? (
        <section className={PAGE_WRAP}>
          <LinedHeading title="About" style={{ color: ACCENT }} />
          <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-4 text-center">
            {aboutIntroBlocks.map((text, idx) => (
              <p key={idx} className="text-[15px] leading-relaxed">
                {text}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {t.productsPageEnabled && t.isHomeSectionEnabled("home_products") && t.productPages.length ? (
        <section className={PAGE_WRAP}>
          <LinedHeading title="What we offer" style={{ color: ACCENT }} />
          <div className="mt-6">
            <ProductGrid products={t.productPages} onSelect={t.handleProductCardAction} />
          </div>
        </section>
      ) : null}

      {Array.isArray(data?.inclusions) && data.inclusions.length > 0 && t.isHomeSectionEnabled("home_inclusions") ? (
        <Inclusions inclusions={data.inclusions} title="Inclusions" />
      ) : null}

      {t.galleryPageEnabled && t.isHomeSectionEnabled("home_gallery") ? (
        <section className={PAGE_WRAP}>
          <LinedHeading title="Gallery" style={{ color: ACCENT }} />
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {t.homeGalleryItems.map((src, idx) => (
              <div key={idx} className="aspect-square overflow-hidden rounded-[4px]" style={{ backgroundColor: "#15151f" }}>
                <img src={src} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
              </div>
            ))}
          </div>
          {t.galleryItems.length > 6 ? (
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={() => t.goToSection("gallery")}
                className="rounded-full px-6 py-2.5 text-[13px] font-semibold focus-visible:outline focus-visible:outline-2"
                style={{ border: "1px solid rgba(255,255,255,0.22)", color: HEADING, ...focusStyle }}
              >
                Show more →
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {t.isHomeSectionEnabled("home_testimonials") && t.testimonials.length ? (
        <section className={PAGE_WRAP}>
          <LinedHeading title="What people say" style={{ color: ACCENT }} />
          <div className="mt-7">
            <TestimonialsCarousel testimonials={t.testimonials} />
          </div>
          {showWriteReview ? (
            <div className="mt-7 text-center">
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="rounded-full px-6 py-2.5 text-[13px] font-semibold focus-visible:outline focus-visible:outline-2"
                style={{ border: "1px solid rgba(255,255,255,0.22)", color: HEADING, ...focusStyle }}
              >
                Write a review
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {t.contactPageEnabled && t.isHomeSectionEnabled("home_contact") ? (
        <>
          <section className="relative overflow-hidden" style={{ background: ACCENT_GRADIENT }}>
            <div className={`${WRAP} relative z-10 flex flex-col items-center gap-2 py-12 text-center md:py-14`}>
              <span className={EYEBROW} style={{ color: "rgba(255,255,255,0.85)" }}>
                Contact
              </span>
              <h2 className={`text-[26px] font-extrabold md:text-[32px] ${HEADING_FONT}`} style={{ color: WHITE }}>
                {data?.companyName ? `Let's talk, ${data.companyName}` : "Get in touch"}
              </h2>
            </div>
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(circle at 85% 30%, rgba(255,255,255,0.10), transparent 45%)" }}
            />
          </section>
          <section className={PAGE_WRAP}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[0.62fr_0.38fr]">
              {data?.mapUrl ? (
                <iframe title="map" src={data.mapUrl} className="h-[320px] w-full rounded-[4px] border-0 md:h-[420px]" loading="lazy" />
              ) : (
                <div className="h-[320px] w-full rounded-[4px] md:h-[420px]" style={{ backgroundColor: "#15151f" }} />
              )}
              <div className={`${CARD} border flex flex-col justify-center gap-4 p-7`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                {data?.companyLogoUrl ? (
                  <img src={data.companyLogoUrl} alt={data.companyName || "Company"} className="mb-2 h-12 w-auto object-contain" />
                ) : null}
                {t.contactEmail ? (
                  <a href={`mailto:${t.contactEmail}`} className="flex items-center gap-3 text-[14.5px] hover:opacity-80 focus-visible:outline focus-visible:outline-2" style={focusStyle}>
                    <MailIcon />
                    {t.contactEmail}
                  </a>
                ) : null}
                {t.contactPhone ? (
                  <a
                    href={`tel:${t.contactPhone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-3 text-[14.5px] hover:opacity-80 focus-visible:outline focus-visible:outline-2"
                    style={focusStyle}
                  >
                    <PhoneIcon />
                    {t.contactPhone}
                  </a>
                ) : null}
                {t.contactAddress ? (
                  <div className="flex items-start gap-3 text-[14.5px]">
                    <span className="pt-0.5">
                      <PinIcon />
                    </span>
                    <span>{t.contactAddress}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {data?.logoCarousel?.enabled && Array.isArray(data.logoCarousel.logos) && data.logoCarousel.logos.length > 0 ? (
        <LogoCarousel
          logos={data.logoCarousel.logos.map((item) => (typeof item === "string" ? item : item?.url || item?.preview || "")).filter(Boolean)}
          title={data?.logoCarousel?.title || undefined}
        />
      ) : null}

      <ReviewFormModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        companyId={data?.companyId || ""}
        companyName={data?.companyName || ""}
        workspaceId={data?.workspaceId || ""}
      />
    </div>
  );
};

export default FreshStudioTemplateHome;
