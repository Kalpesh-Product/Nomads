import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BROWN,
  CONTACT_ICON_CIRCLE,
  ContactMailIcon,
  ContactMapIcon,
  ContactPhoneIcon,
  CREAM,
  EYEBROW,
  FONT_IMPORT,
  FOREST,
  Inclusions,
  LinedHeading,
  LogoCarousel,
  MUTED,
  PAGE_WRAP,
  ProductGrid,
  RUST,
  SANS,
  SERIF,
  TestimonialsCarousel,
  WRAP,
} from "./templates/warmOrganic/WarmOrganicShared";
import { getMediaSrc } from "./utils/templateRouteUtils";
import ReviewFormModal from "./components/ReviewFormModal";

const getNonEmptyTextList = (...values) => values.map((v) => String(v || "").trim()).filter(Boolean);

const WarmOrganicTemplateHome = () => {
  const t = useTemplateData();
  const { data } = t;
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [heroIndex, setHeroIndex] = React.useState(0);

  if (t.isPending) return null;
  if (t.error) return <div>Error loading site: {t.error.message}</div>;
  if (!data) return <div>Site data is currently unavailable</div>;
  if (data.isActive === false) return <div>Website is currently inactive</div>;

  const heroImages = (Array.isArray(data?.heroImages) ? data.heroImages : []).map(getMediaSrc).filter(Boolean);

  // Autoplay the hero image every 3.5s, same interval HostPanel's
  // useWebsiteTemplateData hook uses — plus the manual prev/next controls
  // rendered below when there's more than one image.
  React.useEffect(() => {
    if (heroImages.length <= 1) return undefined;
    const timer = window.setInterval(() => setHeroIndex((prev) => (prev + 1) % heroImages.length), 3500);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroImages.length]);

  const resolvedHomeHeroImage = heroImages[heroIndex] || heroImages[0] || t.galleryItems[0] || "";
  const showHeroCarousel = heroImages.length > 1;
  const handleHeroPrev = () => setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const handleHeroNext = () => setHeroIndex((prev) => (prev + 1) % heroImages.length);

  const aboutIntroBlocks = getNonEmptyTextList(
    data?.aboutPageIntro,
    data?.aboutPageOverview,
    ...(Array.isArray(data?.about) ? data.about.map((block) => (typeof block === "string" ? block : block?.text)) : []),
  );

  const showWriteReview = data?.testimonialsEnableWriteReview !== false;

  return (
    <div className={`wo-template min-h-screen ${SANS}`} style={{ backgroundColor: "#F1E6D3", color: BROWN }}>
      <style>{`
        ${FONT_IMPORT}
        .wo-template button, .wo-template a[href] { cursor: pointer; }
        .wo-template button:focus-visible, .wo-template a:focus-visible, .wo-template input:focus-visible, .wo-template select:focus-visible, .wo-template textarea:focus-visible {
          outline: 2px solid ${RUST};
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .wo-template * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
      `}</style>

      {t.isHomeSectionEnabled("home_hero") ? (
        <>
          <section className="relative overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 15% 15%, rgba(184,92,56,0.14), transparent 60%), radial-gradient(ellipse 50% 45% at 90% 85%, rgba(62,86,65,0.10), transparent 55%)",
              }}
            />
            <div className={`${WRAP} relative grid gap-8 px-6 py-8 md:grid-cols-2 md:gap-10 md:px-11 md:py-12`}>
              <div className="flex flex-col justify-center gap-5">
                <span className={EYEBROW} style={{ color: RUST }}>
                  {data?.vertical ? String(data.vertical).replace(/-/g, " ") : "Welcome Back,"}
                </span>
                <h1 className={`text-[36px] md:text-[50px] font-medium leading-[1.08] ${SERIF}`}>
                  {data?.title || data?.companyName || ""}
                </h1>
                <p className="max-w-sm text-[15px] leading-relaxed" style={{ color: MUTED }}>
                  {data?.subTitle || ""}
                </p>
                <button
                  type="button"
                  className="self-start rounded-full px-7 py-3 text-[13px] font-semibold transition duration-200 hover:opacity-90"
                  style={{ backgroundColor: FOREST, color: CREAM }}
                >
                  {data?.CTAButtonText || "Book a Tour"}
                </button>
              </div>
              <div
                className="relative flex aspect-square items-end justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(150deg, #C9764E 0%, ${RUST} 55%, #8C4A2E 100%)`,
                  borderRadius: "46% 54% 61% 39% / 45% 41% 59% 55%",
                }}
              >
                {resolvedHomeHeroImage ? (
                  <img src={resolvedHomeHeroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
                ) : null}
                {showHeroCarousel ? (
                  <div className="relative z-10 mb-6 flex items-center gap-4 rounded-full px-4 py-2" style={{ backgroundColor: CREAM }}>
                    <button type="button" onClick={handleHeroPrev} className="text-[12px] font-semibold" style={{ color: BROWN }}>
                      ←
                    </button>
                    <span className="text-[11px]" style={{ color: MUTED }}>
                      {heroIndex + 1} / {heroImages.length}
                    </span>
                    <button type="button" onClick={handleHeroNext} className="text-[12px] font-semibold" style={{ color: BROWN }}>
                      →
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
          <div className="mx-6 md:mx-11" style={{ height: 1, backgroundColor: `${BROWN}26` }} />
        </>
      ) : null}

      {t.aboutPageEnabled && t.isHomeSectionEnabled("home_about") && aboutIntroBlocks.length ? (
        <section className={PAGE_WRAP}>
          <LinedHeading title={String(data?.aboutTitle || "").trim() || "About Our Vision"} className="justify-center" />
          <div className="flex flex-col gap-4 text-center mx-auto max-w-2xl">
            {aboutIntroBlocks.map((text, idx) => (
              <p key={idx} className="text-[15.5px] leading-relaxed" style={{ color: MUTED }}>
                {text}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {t.productsPageEnabled && t.isHomeSectionEnabled("home_products") && t.productPages.length ? (
        <section className={`${WRAP} px-6 pb-4 pt-2 md:px-11`}>
          <LinedHeading title={String(data?.productTitle || "").trim() || "Our Services"} className="justify-center" />
          <ProductGrid products={t.productPages} onSelect={t.handleProductCardAction} />
        </section>
      ) : null}

      {Array.isArray(data?.inclusions) && data.inclusions.length > 0 && t.isHomeSectionEnabled("home_inclusions") ? (
        <Inclusions inclusions={data.inclusions} title="Inclusions" />
      ) : null}

      {t.galleryPageEnabled && t.isHomeSectionEnabled("home_gallery") ? (
        <section className={PAGE_WRAP}>
          <LinedHeading title={data?.galleryTitle || "Gallery"} className="justify-center" />
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3">
            {t.homeGalleryItems.map((src, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => t.goToSection("gallery")}
                className="aspect-square overflow-hidden rounded-2xl"
                style={{ backgroundColor: `${BROWN}0D` }}
              >
                <img src={src} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
              </button>
            ))}
          </div>
          {t.galleryItems.length > 6 ? (
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={() => t.goToSection("gallery")}
                className="rounded-full px-6 py-2.5 text-[13px] font-semibold"
                style={{ border: `1px solid ${BROWN}33`, color: BROWN }}
              >
                Show more →
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {t.isHomeSectionEnabled("home_testimonials") && t.testimonials.length ? (
        <section className={PAGE_WRAP}>
          <LinedHeading title={data?.testimonialTitle || "Testimonials"} className="justify-center" />
          <div className="mt-8">
            <TestimonialsCarousel testimonials={t.testimonials} showWriteReview={showWriteReview} onOpenReview={() => setReviewOpen(true)} />
          </div>
        </section>
      ) : null}

      {t.contactPageEnabled && t.isHomeSectionEnabled("home_contact") ? (
        <section className={PAGE_WRAP}>
          <LinedHeading title={data?.contactTitle || "Contact"} className="justify-center" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[0.62fr_0.38fr]">
            {data?.mapUrl ? (
              <iframe title="map" src={data.mapUrl} className="h-[320px] w-full rounded-3xl border-0 md:h-[420px]" loading="lazy" />
            ) : (
              <div className="h-[320px] w-full rounded-3xl md:h-[420px]" style={{ backgroundColor: `${BROWN}0D` }} />
            )}
            <div className="flex flex-col gap-5 rounded-3xl p-7 text-[15px]" style={{ backgroundColor: CREAM, color: MUTED }}>
              {data?.companyLogoUrl ? (
                <img src={data.companyLogoUrl} alt={data.companyName || "Company"} className="mb-3 h-16 w-auto object-contain md:h-20" />
              ) : null}
              {t.contactEmail ? (
                <a href={`mailto:${t.contactEmail}`} className="flex items-center gap-4 transition hover:opacity-70" style={{ color: BROWN }}>
                  <CONTACT_ICON_CIRCLE>
                    <ContactMailIcon />
                  </CONTACT_ICON_CIRCLE>
                  <span className="min-w-0 break-words">{t.contactEmail}</span>
                </a>
              ) : null}
              {t.contactPhone ? (
                <a
                  href={`tel:${t.contactPhone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-4 transition hover:opacity-70"
                  style={{ color: BROWN }}
                >
                  <CONTACT_ICON_CIRCLE>
                    <ContactPhoneIcon />
                  </CONTACT_ICON_CIRCLE>
                  <span className="min-w-0 break-words">{t.contactPhone}</span>
                </a>
              ) : null}
              {t.contactAddress ? (
                <div className="flex items-start gap-4">
                  <CONTACT_ICON_CIRCLE>
                    <ContactMapIcon />
                  </CONTACT_ICON_CIRCLE>
                  <span className="min-w-0 break-words pt-0.5">{t.contactAddress}</span>
                </div>
              ) : null}
            </div>
          </div>
        </section>
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

export default WarmOrganicTemplateHome;
