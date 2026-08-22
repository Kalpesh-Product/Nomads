import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BODY_FONT,
  CONTACT_ICON_CIRCLE,
  ContactMailIcon,
  ContactMapIcon,
  ContactPhoneIcon,
  FONT_IMPORT,
  HEADING_FONT,
  Inclusions,
  LinedHeading,
  LogoCarousel,
  ProductGrid,
  SECTION_BG,
  STYLE_OVERRIDES,
  TEMPLATE_ROOT_CLASS,
  TestimonialsCarousel,
} from "./templates/emeraldStudio/EmeraldStudioShared";
import { getMediaSrc } from "./utils/templateRouteUtils";
import ReviewFormModal from "./components/ReviewFormModal";

const getNonEmptyTextList = (...values) => values.map((v) => String(v || "").trim()).filter(Boolean);

const EmeraldStudioTemplateHome = () => {
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
    <div className={`${TEMPLATE_ROOT_CLASS} min-h-screen bg-[#002c22] text-stone-100 ${BODY_FONT}`}>
      <style>{`${FONT_IMPORT}${STYLE_OVERRIDES}`}</style>

      {t.isHomeSectionEnabled("home_hero") ? (
        <section className="relative py-16 md:py-24 px-6 overflow-hidden bg-[#002c22]">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(#ffb900 1px, transparent 1px), linear-gradient(90deg, #ffb900 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#007a55]/20 blur-[60px] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className={`text-4xl md:text-6xl font-semibold leading-[1.08] tracking-tight mb-6 text-stone-100 ${HEADING_FONT}`}>
                {data?.title || data?.companyName || "Your Company"}
              </h1>
              <p className="text-lg text-stone-400 leading-relaxed mb-10">{data?.subTitle || ""}</p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => t.goToSection("products")}
                  className={`inline-flex items-center gap-2 bg-amber-400 text-emerald-950 font-semibold px-7 py-3.5 rounded hover:bg-amber-300 transition-colors text-sm ${BODY_FONT}`}
                >
                  Explore Services →
                </button>
                <button
                  type="button"
                  onClick={() => t.goToSection("contact")}
                  className="inline-flex items-center gap-2 border border-emerald-700 text-stone-300 font-medium px-7 py-3.5 rounded hover:border-amber-400 hover:text-amber-400 transition-colors text-sm"
                >
                  Contact Us
                </button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="relative rounded-2xl overflow-hidden h-[420px] bg-[#004f3b]">
                {resolvedHomeHeroImage ? (
                  <img src={resolvedHomeHeroImage} alt="" className="w-full h-full object-cover opacity-80" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#002c22]/50 to-transparent rounded-2xl" />
                {showHeroCarousel ? (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-emerald-950/80 px-4 py-2 rounded-b-2xl backdrop-blur-sm">
                    <button type="button" onClick={handleHeroPrev} className="text-xs font-medium text-stone-400 hover:text-amber-400 transition-colors">
                      ← Prev
                    </button>
                    <span className="text-xs text-stone-500">
                      {heroIndex + 1} / {heroImages.length}
                    </span>
                    <button type="button" onClick={handleHeroNext} className="text-xs font-medium text-stone-400 hover:text-amber-400 transition-colors">
                      Next →
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {Array.isArray(data?.stats) && data.stats.length > 0 ? (
        <div className="bg-amber-400 py-14 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            {data.stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className={`text-4xl font-bold text-emerald-950 mb-1 ${HEADING_FONT}`}>{s.value || s.label || ""}</p>
                <p className="text-emerald-800 text-xs font-semibold uppercase tracking-widest">{s.label || ""}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {t.aboutPageEnabled && t.isHomeSectionEnabled("home_about") && aboutIntroBlocks.length ? (
        <section className={`py-20 px-6 ${SECTION_BG}`}>
          <div className="max-w-7xl mx-auto">
            <LinedHeading title={String(data?.aboutTitle || "").trim() || "About Our Vision"} className="justify-center" />
            <div className="mt-8 max-w-2xl mx-auto space-y-4 text-center">
              {aboutIntroBlocks.map((paragraph, index) => (
                <p key={index} className="text-stone-400 text-base leading-8">
                  {paragraph}
                </p>
              ))}
              <button
                type="button"
                onClick={() => t.goToSection("about")}
                className="text-sm font-semibold text-amber-400 underline underline-offset-4"
              >
                Learn more about us →
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {t.productsPageEnabled && t.isHomeSectionEnabled("home_products") && t.productPages.length ? (
        <section className={`py-24 px-6 ${SECTION_BG}`}>
          <div className="max-w-7xl mx-auto">
            <LinedHeading title={String(data?.productTitle || "").trim() || "Our Services"} className="justify-center" />
            <div className="mt-10">
              <ProductGrid products={t.productPages.slice(0, 6)} onSelect={t.handleProductCardAction} />
            </div>
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => t.goToSection("products")}
                className="text-sm font-medium text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
              >
                View all products →
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {Array.isArray(data?.inclusions) && data.inclusions.length > 0 && t.isHomeSectionEnabled("home_inclusions") ? (
        <Inclusions inclusions={data.inclusions} title="Inclusions" />
      ) : null}

      {t.galleryPageEnabled && t.isHomeSectionEnabled("home_gallery") ? (
        <section className={`py-24 px-6 ${SECTION_BG}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <LinedHeading title={data?.galleryTitle || "Gallery"} className="justify-center" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {t.homeGalleryItems.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => t.goToSection("gallery")}
                  className="group relative rounded-xl overflow-hidden bg-emerald-900 aspect-[4/3]"
                >
                  <img
                    src={src}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                </button>
              ))}
            </div>
            {t.galleryItems.length > 6 ? (
              <div className="mt-9 flex justify-center">
                <button
                  type="button"
                  onClick={() => t.goToSection("gallery")}
                  className="rounded-full border border-emerald-700 px-6 py-2.5 text-[13px] font-semibold text-stone-200 hover:border-amber-400 hover:text-amber-400 transition-colors"
                >
                  Show more →
                </button>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {t.isHomeSectionEnabled("home_testimonials") && t.testimonials.length ? (
        <section className={`py-24 px-6 ${SECTION_BG}`}>
          <div className="max-w-7xl mx-auto">
            <LinedHeading title={data?.testimonialTitle || "Testimonials"} className="justify-center" />
            <div className="mt-10">
              <TestimonialsCarousel testimonials={t.testimonials} showWriteReview={showWriteReview} onOpenReview={() => setReviewOpen(true)} />
            </div>
          </div>
        </section>
      ) : null}

      {t.contactPageEnabled && t.isHomeSectionEnabled("home_contact") ? (
        <section className={`py-20 px-6 ${SECTION_BG}`}>
          <div className="max-w-7xl mx-auto">
            <LinedHeading title={data?.contactTitle || "Contact"} className="justify-center" />
            <div className="mt-10 grid md:grid-cols-[0.6fr_0.4fr] gap-8 items-stretch">
              {data?.mapUrl ? (
                <iframe title="Map" src={data.mapUrl} loading="lazy" className="h-[380px] w-full rounded-2xl border-0" />
              ) : (
                <div className="min-h-[300px] rounded-2xl bg-emerald-900/40 border border-emerald-800/50" />
              )}
              <div className="rounded-2xl border border-emerald-800/50 bg-emerald-900/40 p-8 flex flex-col">
                {data?.companyLogoUrl ? (
                  <img src={data.companyLogoUrl} alt={data.companyName || "Company"} className="mb-12 h-12 w-auto self-center object-contain" />
                ) : (
                  <span className={`mb-5 flex h-12 w-12 items-center justify-center self-start rounded-lg bg-amber-400 text-lg font-bold text-emerald-950 ${HEADING_FONT}`}>
                    {(data?.companyName || "Y").charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="space-y-4 text-lg text-stone-300">
                  {t.contactEmail ? (
                    <a className="flex items-center gap-4 hover:text-amber-400" href={`mailto:${t.contactEmail}`}>
                      <CONTACT_ICON_CIRCLE>
                        <ContactMailIcon />
                      </CONTACT_ICON_CIRCLE>
                      <span>{t.contactEmail}</span>
                    </a>
                  ) : null}
                  {t.contactPhone ? (
                    <a className="flex items-center gap-4 hover:text-amber-400" href={`tel:${t.contactPhone.replace(/[^\d+]/g, "")}`}>
                      <CONTACT_ICON_CIRCLE>
                        <ContactPhoneIcon />
                      </CONTACT_ICON_CIRCLE>
                      <span>{t.contactPhone}</span>
                    </a>
                  ) : null}
                  {t.contactAddress ? (
                    <div className="flex items-start gap-4">
                      <CONTACT_ICON_CIRCLE>
                        <ContactMapIcon />
                      </CONTACT_ICON_CIRCLE>
                      <span className="whitespace-pre-line">{t.contactAddress}</span>
                    </div>
                  ) : null}
                </div>
              </div>
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

export default EmeraldStudioTemplateHome;
