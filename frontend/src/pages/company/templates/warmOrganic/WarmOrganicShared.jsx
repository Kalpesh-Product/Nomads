import React, { useCallback, useEffect, useState } from "react";

// "Warm Organic" — serif headings, blob-cropped hero imagery, rust/forest/
// sand palette, soft rounded cards, pill buttons, tilted "postcard"
// testimonials. Ported from HostPanel's WarmOrganicTemplate.tsx (client/src/
// pages/Dashboard/FrontendDashboard/WebsiteBuilder/templates/
// WarmOrganicTemplate.tsx) — this module holds the visual atoms shared by
// all 9 Warm Organic section pages plus the header/footer, mirroring
// HostPanel's inline sub-components 1:1 so the visuals stay byte-equivalent;
// only the data plumbing changed (Nomads field names / real navigation
// instead of HostPanel's preview-only in-memory state), same approach
// FreshStudioShared.jsx used for Fresh Studio.
export const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Karla:wght@400;500;600&display=swap');";
export const SAND = "#F1E6D3";
export const RUST = "#B85C38";
export const FOREST = "#3E5641";
export const CREAM = "#FBF3E7";
export const BROWN = "#2B211A";
export const MUTED = "#5A4A3C";
export const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";
export const SANS = "font-['Karla',ui-sans-serif,system-ui,sans-serif]";

export const WRAP = "mx-auto w-full max-w-7xl";
export const EYEBROW = `text-[13.5px] font-semibold uppercase tracking-[0.12em] ${SANS}`;
export const PAGE_WRAP = `${WRAP} px-6 py-12 md:px-11 md:py-16`;
export const INPUT = "w-full rounded-xl px-4 py-2.5 text-[14px] outline-none bg-white";
export const inputStyle = { border: `1px solid ${BROWN}33` };
export const focusStyle = { outlineColor: RUST };

export const LinedHeading = ({ title, className = "" }) => (
  <div className={`flex items-center gap-4 mb-6 ${className}`}>
    <div className="flex-1 h-px" style={{ backgroundColor: RUST }} />
    <h2
      className={`text-sm font-semibold uppercase tracking-[0.15em] sm:text-base md:text-xl lg:text-[26px] ${SANS}`}
      style={{ color: RUST }}
    >
      {title}
    </h2>
    <div className="flex-1 h-px" style={{ backgroundColor: RUST }} />
  </div>
);

export const SOCIAL_LABEL = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
};
export const SOCIAL_ICON = {
  instagram: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v1.5A6 6 0 0 1 16 8z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  ),
};

export const CONTACT_ICON_CIRCLE = ({ children }) => (
  <span
    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
    style={{ border: `2px solid ${RUST}`, color: RUST }}
  >
    {children}
  </span>
);

export const ContactMailIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

export const ContactPhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.64 2.6a2 2 0 0 1-.45 2.11L8 9.69a16 16 0 0 0 6.31 6.31l1.26-1.26a2 2 0 0 1 2.11-.45c.83.31 1.7.52 2.6.64A2 2 0 0 1 22 16.92Z" />
  </svg>
);

export const ContactMapIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" />
    <circle cx="12" cy="11" r="2.25" />
  </svg>
);

// Product cards carry the description under different keys depending on
// where they came from — a home-level productDropdownPage stores it as
// homeCardSubText, a sub-product under a page stores it as description, and
// the synthetic fallback entries use subText. Check all three so the card
// never silently drops it (same helper Fresh Studio's shared module uses).
export const getProductCardDescription = (product) =>
  String(product?.subText || product?.homeCardSubText || product?.description || "").trim();

export const CARD_TINTS = [FOREST, RUST, "#8C6A46"];

export const ProductGrid = ({ products, onSelect, tints = CARD_TINTS }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {products.map((product, idx) => {
      const description = getProductCardDescription(product);
      return (
        <article
          key={idx}
          className="flex flex-col overflow-hidden rounded-2xl transition hover:-translate-y-0.5"
          style={{ backgroundColor: CREAM, boxShadow: "0 14px 28px -18px rgba(43,33,26,0.35)" }}
        >
          <div className="w-full overflow-hidden rounded-t-2xl" style={{ backgroundColor: `${BROWN}0D` }}>
            {product?.cardImage ? (
              <img
                src={product.cardImage}
                alt={product?.heading || product?.name}
                className="h-[200px] w-full object-cover md:h-[230px]"
              />
            ) : (
              <div
                className="h-[200px] w-full md:h-[230px]"
                style={{ background: `linear-gradient(140deg, ${tints[idx % tints.length]}, ${tints[idx % tints.length]}AA)` }}
              />
            )}
          </div>
          <div className="flex flex-1 flex-col items-center gap-3 px-5 py-5 text-center">
            <h3 className={`text-[16px] font-normal ${SERIF}`}>{product?.name || product?.heading || "Service"}</h3>
            {description ? (
              <p className="line-clamp-2 text-[12.5px] leading-relaxed" style={{ color: MUTED }}>
                {description}
              </p>
            ) : null}
            <div className="mt-auto pt-1">
              <button
                type="button"
                onClick={() => onSelect(product)}
                className="rounded-full px-6 py-2 text-[11px] font-semibold uppercase tracking-widest transition hover:opacity-80"
                style={{ border: `1px solid ${RUST}`, color: RUST }}
              >
                View details
              </button>
            </div>
          </div>
        </article>
      );
    })}
  </div>
);

export const LogoCarousel = ({ logos, title }) => {
  const [offset, setOffset] = useState(0);
  const [visible, setVisible] = useState(typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 4);
  const total = logos.length;

  useEffect(() => {
    const onResize = () => setVisible(window.innerWidth < 768 ? 2 : 4);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (total <= visible) return;
    const timer = window.setInterval(() => setOffset((prev) => (prev + 1) % total), 2500);
    return () => window.clearInterval(timer);
  }, [total, visible]);

  if (!total) return null;
  const displayed = Array.from({ length: visible }, (_, i) => logos[(offset + i) % total]);

  return (
    <section className={PAGE_WRAP}>
      <LinedHeading title={title || "Trusted by"} className="justify-center" />
      <div className="mt-8 overflow-hidden">
        <div className="flex items-center justify-center gap-8 md:gap-16 transition-all duration-700">
          {displayed.map((src, idx) => (
            <div key={`logo-${offset}-${idx}`} className="flex h-[60px] w-[140px] shrink-0 items-center justify-center opacity-70 md:h-[80px] md:w-[220px]">
              <img src={src} alt={`Partner logo ${idx + 1}`} className="max-h-full max-w-full object-contain transition duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Splits a raw answer into bullet lines (ones ending in . ! ?) vs plain
// paragraph text — same heuristic Classic's FaqAccordion / Fresh Studio's
// shared module use, so an answer written as a few short sentences reads as
// a point-wise list instead of one dense paragraph.
const splitFaqAnswer = (answer) => {
  const lines = String(answer || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const blocks = [];
  let paraBuffer = [];
  const flushPara = () => {
    if (paraBuffer.length) {
      blocks.push({ type: "para", text: paraBuffer.join(" ") });
      paraBuffer = [];
    }
  };
  lines.forEach((line) => {
    if (line.endsWith(".") || line.endsWith("!") || line.endsWith("?")) {
      flushPara();
      blocks.push({ type: "bullet", text: line });
    } else {
      paraBuffer.push(line);
    }
  });
  flushPara();
  return blocks;
};

export const FaqList = ({ faqs }) => {
  const [open, setOpen] = useState(null);
  if (!faqs.length) return null;
  return (
    <section className={PAGE_WRAP}>
      <LinedHeading title="FAQs" className="justify-center" />
      <div className="mt-6 flex flex-col gap-3">
        {faqs.map((faq, idx) => {
          const isOpen = open === idx;
          const blocks = isOpen ? splitFaqAnswer(faq.answer) : [];
          const hasBullets = blocks.some((b) => b.type === "bullet");
          return (
            <div key={idx} className="overflow-hidden rounded-2xl" style={{ backgroundColor: CREAM }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                    style={{ backgroundColor: RUST }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-[14px] font-medium">{faq.question}</span>
                </span>
                <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[16px]" style={{ color: RUST }}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <div className="px-5 pb-4">
                  <div className="space-y-2">
                    {blocks.map((block, bi) =>
                      block.type === "bullet" ? (
                        <div key={bi} className="flex items-start gap-2">
                          <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: RUST }} />
                          <p className="text-[13.5px] leading-relaxed" style={{ color: MUTED }}>
                            {block.text}
                          </p>
                        </div>
                      ) : (
                        <p key={bi} className={`text-[13.5px] leading-relaxed ${hasBullets ? "pl-4" : ""}`} style={{ color: MUTED }}>
                          {block.text}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const StarIcon = ({ filled, size = 14 }) => (
  <svg
    viewBox="0 0 20 20"
    className="inline-block"
    style={{ width: size, height: size, color: filled ? "#B85C38" : "#D4C5B0", fill: "currentColor" }}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.538 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.197-1.538-1.118l1.287-3.957a1 1 0 00-.364-1.118L3.063 9.39c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
  </svg>
);

export const OverallRating = ({ testimonials }) => {
  const ratings = testimonials.map((t) => Number(t?.rating || 0)).filter((r) => r > 0);
  if (!ratings.length) return null;
  const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const rounded = Math.round(average);
  return (
    <div className="flex flex-col items-center gap-1 mb-8">
      <span className="text-5xl font-bold" style={{ color: BROWN }}>
        {average.toFixed(1)}
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < rounded} size={20} />
        ))}
      </div>
      <span className="text-sm" style={{ color: MUTED }}>
        {ratings.length} review{ratings.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
};

const TESTIMONIAL_MAX_CHARS = 200;

const WarmTestimonialCard = ({ item, idx }) => {
  const rating = Number(item?.rating || 0);
  const text = String(item?.text || item?.testimony || "").trim();
  const isLong = text.length > TESTIMONIAL_MAX_CHARS;
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="h-full rounded-sm p-6"
      style={{
        backgroundColor: CREAM,
        boxShadow: "0 16px 30px -20px rgba(43,33,26,0.4)",
        transform: `rotate(${idx % 2 === 0 ? -1.5 : 1}deg)`,
      }}
    >
      <span className="text-[13px] font-bold block mb-1" style={{ color: BROWN }}>
        {item.name}
      </span>
      {rating > 0 ? (
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} filled={i < rating} size={14} />
          ))}
        </div>
      ) : null}
      <p className={`text-[15px] italic leading-relaxed ${SERIF}`} style={{ color: MUTED }}>
        "{expanded || !isLong ? text || "Great experience." : `${text.slice(0, TESTIMONIAL_MAX_CHARS).trimEnd()}...`}"
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-[11px] font-semibold transition hover:opacity-70"
          style={{ color: RUST }}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
};

const getTestimonialsPerView = () => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 768) return 1;
  return 3;
};

export const TestimonialsCarousel = ({ testimonials, showWriteReview, onOpenReview }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [perView, setPerView] = useState(getTestimonialsPerView);
  const [isPaused, setIsPaused] = useState(false);
  const [transition, setTransition] = useState(true);
  const total = testimonials.length;
  const isCarousel = total > perView;
  const extended = [...testimonials, ...testimonials.slice(0, perView)];

  useEffect(() => {
    const handleResize = () => setPerView(getTestimonialsPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isCarousel) return;
    setSlideIndex(0);
  }, [perView, isCarousel]);

  const slide = useCallback(() => {
    setSlideIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!isCarousel || isPaused) return;
    const timer = window.setInterval(slide, 3000);
    return () => window.clearInterval(timer);
  }, [isCarousel, isPaused, slide]);

  useEffect(() => {
    if (slideIndex >= total) {
      const jump = window.setTimeout(() => {
        setTransition(false);
        setSlideIndex(0);
      }, 500);
      return () => window.clearTimeout(jump);
    }
  }, [slideIndex, total]);

  useEffect(() => {
    if (!transition) {
      const restore = requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransition(true));
      });
      return () => cancelAnimationFrame(restore);
    }
  }, [transition]);

  if (!total) return null;

  const slideWidth = 100 / perView;
  const dotIndex = slideIndex % total;

  if (!isCarousel) {
    return (
      <div>
        <OverallRating testimonials={testimonials} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((item, idx) => (
            <div key={item?.key || idx} className="h-full">
              <WarmTestimonialCard item={item} idx={idx} />
            </div>
          ))}
        </div>
        {showWriteReview && onOpenReview ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onOpenReview}
              className="rounded-full px-6 py-2 text-[12px] font-semibold uppercase tracking-wider transition hover:opacity-80"
              style={{ border: `1px solid ${FOREST}`, color: FOREST }}
            >
              Write a review
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <OverallRating testimonials={testimonials} />
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(-${slideIndex * slideWidth}%)`,
            transition: transition ? "transform 500ms ease-in-out" : "none",
          }}
        >
          {extended.map((item, idx) => (
            <div key={`${item?.key || item?.name}-${idx}`} className="shrink-0 px-3" style={{ width: `${slideWidth}%` }}>
              <WarmTestimonialCard item={item} idx={idx} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setTransition(true);
              setSlideIndex(i);
            }}
            aria-label={`Go to testimonial ${i + 1}`}
            className="h-2 w-2 rounded-full transition-all"
            style={{ width: i === dotIndex ? 20 : 8, backgroundColor: i === dotIndex ? RUST : `${BROWN}33` }}
          />
        ))}
      </div>
      {showWriteReview && onOpenReview ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onOpenReview}
            className="rounded-full px-6 py-2 text-[12px] font-semibold uppercase tracking-wider transition hover:opacity-80"
            style={{ border: `1px solid ${FOREST}`, color: FOREST }}
          >
            Write a review
          </button>
        </div>
      ) : null}
    </div>
  );
};

// Same master inclusions icon set as FreshStudioShared.jsx / Nomads' own
// InclusionsSection.jsx / HostPanel's inclusionIcons.tsx (kept in sync
// across all three repos) — duplicated here (rather than imported) so this
// stays RUST-colorable and Warm-Organic-specific without touching the
// shared light-themed component Classic already depends on.
const ALL_INCLUSIONS = [
  { key: "workspace", label: "Workspace", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="10" width="28" height="18" rx="2" /><path d="M14 28v4M26 28v4M10 32h20" /><rect x="12" y="15" width="8" height="6" rx="1" /></svg>) },
  { key: "living-space", label: "Living Space", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="18" width="28" height="14" rx="2" /><path d="M10 18v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" /><path d="M6 26h28M12 32v2M28 32v2" /></svg>) },
  { key: "air-condition", label: "Air Condition", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="10" width="28" height="12" rx="2" /><path d="M14 28c0-2 2-4 6-4s6 2 6 4M20 22v4" /><circle cx="20" cy="16" r="2" /></svg>) },
  { key: "fast-internet", label: "Fast Internet", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="10" width="28" height="18" rx="2" /><path d="M10 18h4M10 22h6M26 18h4M6 28h28" /><circle cx="20" cy="19" r="3" /><path d="M14 13h12" /></svg>) },
  { key: "cafe-dining", label: "Cafe / Dining", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12h6v8a3 3 0 0 1-6 0v-8z" /><path d="M16 16h2a2 2 0 0 1 0 4h-2" /><path d="M26 12v8M24 20a4 4 0 0 0 4 4M13 28v4M27 28v4M10 32h20" /></svg>) },
  { key: "receptionist", label: "Receptionist", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="20" cy="12" r="5" /><path d="M10 32c0-6 4-10 10-10s10 4 10 10" /><path d="M8 28h24" /></svg>) },
  { key: "meeting-rooms", label: "Meeting Rooms", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="12" width="28" height="18" rx="2" /><path d="M14 21h12M14 25h8" /><circle cx="12" cy="8" r="2" /><circle cx="20" cy="8" r="2" /><circle cx="28" cy="8" r="2" /></svg>) },
  { key: "training-rooms", label: "Training Rooms", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="10" width="28" height="20" rx="2" /><path d="M6 18h28M14 18v12M20 14h6" /></svg>) },
  { key: "it-support", label: "IT Support", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="24" height="18" rx="2" /><path d="M14 26v4M26 26v4M10 30h20" /><path d="M16 17l3 3 5-6" /></svg>) },
  { key: "tea-coffee", label: "Tea & Coffee", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14h16v12a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V14z" /><path d="M26 16h2a3 3 0 0 1 0 6h-2" /><path d="M14 10c0-2 2-2 2-4M19 10c0-2 2-2 2-4" /></svg>) },
  { key: "assist", label: "Assist", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="20" cy="12" r="5" /><path d="M10 32c0-5 4-9 10-9s10 4 10 9" /><path d="M20 21v5M17 26h6" /></svg>) },
  { key: "community", label: "Community", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="14" cy="14" r="4" /><circle cx="26" cy="14" r="4" /><path d="M6 32c0-4 3-7 8-7M26 25c5 0 8 3 8 7M16 32c0-4 2-6 4-6s4 2 4 6" /></svg>) },
  { key: "on-demand", label: "On Demand", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="20" cy="20" r="12" /><path d="M16 15l10 5-10 5V15z" /></svg>) },
  { key: "maintenance", label: "Maintenance", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M28 12a6 6 0 0 0-8.5 8.5L8 32l4 4 11.5-11.5A6 6 0 0 0 28 12z" /><path d="M26 10l4 4" /></svg>) },
  { key: "generator", label: "Generator", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="14" width="28" height="16" rx="2" /><path d="M14 14v-4M26 14v-4M20 18v8M16 22h8" /></svg>) },
  { key: "pickup-drop", label: "Pickup & Drop", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="18" width="32" height="12" rx="2" /><path d="M8 18l4-8h16l4 8" /><circle cx="11" cy="30" r="3" /><circle cx="29" cy="30" r="3" /></svg>) },
  { key: "car-bike-bus", label: "Car / Bike / Bus", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22h28M10 22l3-8h14l3 8" /><circle cx="13" cy="26" r="3" /><circle cx="27" cy="26" r="3" /><path d="M34 22v4" /></svg>) },
  { key: "housekeeping", label: "Housekeeping", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 32V20l8-10 8 10v12" /><path d="M16 32v-8h8v8" /><path d="M8 20h24" /></svg>) },
  { key: "swimming-pool", label: "Swimming Pool", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22c2 0 3-2 6-2s4 2 6 2 3-2 6-2 4 2 6 2" /><path d="M6 28c2 0 3-2 6-2s4 2 6 2 3-2 6-2 4 2 6 2" /><path d="M20 8v10M16 12l4-4 4 4" /></svg>) },
  { key: "television", label: "Television", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="10" width="28" height="18" rx="2" /><path d="M14 28v4M26 28v4M10 32h20" /><path d="M14 14h4M14 19h8" /></svg>) },
  { key: "gas", label: "Gas", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8h8v6a8 8 0 0 1-8 0V8z" /><path d="M14 14a8 8 0 0 0 12 0" /><path d="M12 32V22a8 8 0 0 1 16 0v10" /><path d="M10 32h20" /></svg>) },
  { key: "laundry", label: "Laundry", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="24" height="26" rx="2" /><circle cx="20" cy="24" r="6" /><path d="M12 14h4" /><circle cx="18" cy="14" r="1" fill="currentColor" stroke="none" /></svg>) },
  { key: "secure", label: "Secure", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6l12 5v10c0 7-5 12-12 14C13 33 8 28 8 21V11l12-5z" /><path d="M15 20l4 4 6-7" /></svg>) },
  { key: "personalised", label: "Personalised", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M28 12l-4 4-8-8-6 6 8 8-4 4 12 4-8-18z" /></svg>) },
  { key: "electricity", label: "Electricity", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 6l-8 16h8l-4 12 10-18h-8L22 6z" /></svg>) },
  { key: "ups", label: "UPS", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="14" width="24" height="16" rx="2" /><path d="M14 14v-4M26 14v-4M16 22h8M20 20v4" /></svg>) },
  { key: "events", label: "Events", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 18c4-8 20-8 24 0M12 26c3-6 13-6 16 0M16 32c1-3 7-3 8 0" /></svg>) },
  { key: "furnished-office", label: "Furnished Office", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="10" width="28" height="18" rx="2" /><path d="M14 28v4M26 28v4M10 32h20M14 19h12M14 23h8" /></svg>) },
  { key: "cafeteria", label: "Cafeteria", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="14" width="24" height="16" rx="2" /><path d="M14 14v-4M26 14v-4M8 22h24M16 22v8M24 22v8" /></svg>) },
  { key: "high-speed-internet", label: "High Speed Internet", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 20a20 20 0 0 1 28 0M10 24a14 14 0 0 1 20 0M14 28a8 8 0 0 1 12 0" /><circle cx="20" cy="32" r="2" fill="currentColor" stroke="none" /></svg>) },
  { key: "assistance", label: "Assistance", icon: (<svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="20" cy="12" r="5" /><path d="M10 32c0-5 4-9 10-9s10 4 10 9" /><path d="M16 26l4 2 4-2" /></svg>) },
];

const getInclusionMeta = (item) => {
  const key = String(item?.key || "").trim();
  const match = ALL_INCLUSIONS.find((i) => i.key === key);
  return {
    label: String(item?.label || "").trim() || match?.label || key.replace(/[-_]+/g, " "),
    icon: match?.icon || null,
  };
};

export const Inclusions = ({ inclusions, title }) => {
  const enabled = (inclusions || []).filter((item) => item?.enabled !== false);
  if (!enabled.length) return null;
  return (
    <section className={PAGE_WRAP}>
      <LinedHeading title={title} className="justify-center" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 md:gap-6">
        {enabled.map((item, index) => {
          const { label, icon } = getInclusionMeta(item);
          return (
            <div key={item?.key || index} className="flex flex-col items-center gap-2 text-center">
              <span style={{ color: RUST }}>{icon}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
