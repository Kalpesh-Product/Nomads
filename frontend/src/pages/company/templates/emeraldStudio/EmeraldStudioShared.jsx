import React, { useEffect, useState } from "react";

// "Emerald Studio" — dark emerald canvas (#002c22), amber-gold accent
// (#ffb900), Fraunces serif headings over Outfit body text. Ported from
// HostPanel's EmeraldStudioTemplate.tsx (client/src/pages/Dashboard/
// FrontendDashboard/WebsiteBuilder/templates/EmeraldStudioTemplate.tsx) —
// this module holds the visual atoms shared by all 9 Emerald Studio section
// pages plus the header/footer, mirroring HostPanel's inline sub-components
// (LinedHeading, FigmaProductGrid, FigmaInclusions, FigmaFaqList,
// FigmaLogoCarousel, TestimonialsCarousel, contact icons) 1:1 so the visuals
// stay byte-equivalent; only the data plumbing changed (Nomads field names /
// real navigation instead of HostPanel's preview-only in-memory state), same
// approach WarmOrganicShared.jsx / FreshStudioShared.jsx used for their
// templates.
export const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Outfit:wght@300;400;500;600;700&display=swap');";

export const BG = "#002c22";
export const AMBER = "#ffb900";
export const HEADING_FONT = "font-['Fraunces',Georgia,serif]";
export const BODY_FONT = "font-['Outfit',system-ui,sans-serif]";

export const WRAP = "max-w-7xl mx-auto px-6";
export const PAGE_WRAP = "max-w-7xl mx-auto px-6 pt-20 pb-16";
export const SECTION_BG = "bg-[#004f3b]/20";

// HostPanel's EmeraldStudioTemplate.tsx scopes a small set of Tailwind
// utility overrides under a `.fm-template` class because its default
// `amber-400`/`emerald-950` shades don't quite match the exact hex tokens
// this template wants (#ffb900 amber, #002c22 deep emerald). Every Emerald
// Studio page here uses the same `bg-amber-400`/`text-amber-400`/
// `text-emerald-950` utility classes throughout (ported verbatim from that
// source), so each page root wraps in this same class name and re-declares
// the identical override block to keep the exact color values, the same
// approach every other Emerald Studio visual constant in this file mirrors.
export const TEMPLATE_ROOT_CLASS = "es-template";
export const STYLE_OVERRIDES = `
  .es-template { background-color: ${BG}; }
  .es-template .bg-amber-400 { background-color: ${AMBER}; }
  .es-template .text-amber-400 { color: ${AMBER}; }
  .es-template .text-emerald-950 { color: ${BG}; }
  .es-template button, .es-template a[href] { cursor: pointer; }
  .es-template button:focus-visible, .es-template a:focus-visible, .es-template input:focus-visible, .es-template select:focus-visible, .es-template textarea:focus-visible {
    outline: 2px solid ${AMBER};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    .es-template * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
`;

export const INPUT =
  "w-full bg-emerald-950/60 border border-emerald-800 rounded-lg px-4 py-3 text-stone-100 text-sm placeholder:text-stone-600 focus:outline-none focus:border-amber-400 transition-colors";

export const LinedHeading = ({ title, className = "" }) => (
  <div className={`flex items-center gap-4 mb-6 ${className}`}>
    <div className="flex-1 h-px bg-amber-400" />
    <h2
      className={`text-sm font-semibold uppercase tracking-[0.15em] sm:text-base md:text-xl lg:text-[18px] text-amber-400 ${HEADING_FONT}`}
    >
      {title}
    </h2>
    <div className="flex-1 h-px bg-amber-400" />
  </div>
);

export const CONTACT_ICON_CIRCLE = ({ children }) => (
  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/50 text-amber-400">
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

export const SOCIAL_LABEL = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
};

// Product cards carry the description under different keys depending on
// where they came from — a home-level productDropdownPage stores it as
// homeCardSubText, a sub-product under a page stores it as description, and
// the synthetic fallback entries (no dropdown pages configured yet) use
// subText. Check all three so the card never silently drops it.
export const getProductCardDescription = (product) =>
  String(product?.subText || product?.homeCardSubText || product?.description || "").trim();

export const ProductGrid = ({ products, onSelect }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {products.map((product, idx) => {
      const description = getProductCardDescription(product);
      const image =
        product?.cardImage ||
        (typeof product?.images?.[0] === "string" ? product.images[0] : product?.images?.[0]?.url);
      return (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(product)}
          className="group flex h-full flex-col items-center rounded-xl border border-emerald-800/50 bg-emerald-900/40 p-7 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-emerald-900/60 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          <div className="mb-4 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-lg bg-emerald-950/60 md:h-[230px]">
            {image ? (
              <img
                src={image}
                alt={product?.name || product?.title || ""}
                className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-100"
              />
            ) : (
              <span className="text-2xl text-amber-400 transition-transform duration-300 group-hover:scale-110">◈</span>
            )}
          </div>
          <h3 className={`mb-2 text-lg font-semibold text-stone-100 ${HEADING_FONT}`}>
            {product?.name || product?.title || product?.heading || "Service"}
          </h3>
          {description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-stone-400">{description}</p>
          ) : null}
          <span className="mt-auto pt-3 text-xs font-semibold uppercase tracking-wider text-amber-400 group-hover:underline">
            Learn more →
          </span>
        </button>
      );
    })}
  </div>
);

export const LogoCarousel = ({ logos, title }) => (
  <section className="border-y border-emerald-800/40 bg-[#004f3b]/20 px-6 py-12">
    <div className="max-w-7xl mx-auto">
      {title ? (
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-stone-500">{title}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-7">
        {logos.map((logo, index) => (
          <img
            key={`${logo}-${index}`}
            src={logo}
            alt={`Partner ${index + 1}`}
            className="h-9 max-w-[140px] object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition"
          />
        ))}
      </div>
    </div>
  </section>
);

// Splits a raw answer into bullet lines (ones ending in . ! ?) vs plain
// paragraph text, same heuristic Classic's FaqAccordion / Warm Organic's and
// Fresh Studio's shared modules use, so an answer written as a few short
// sentences reads as a point-wise list instead of one dense paragraph.
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
  const [openIndex, setOpenIndex] = useState(0);
  const visible = faqs.filter((item) => item?.question && item?.answer);
  if (!visible.length) return null;
  return (
    <section className={`py-20 px-6 ${SECTION_BG}`}>
      <div className="max-w-7xl mx-auto">
        <LinedHeading title="FAQ" />
        <div className="flex flex-col gap-3">
          {visible.map((item, index) => {
            const isOpen = openIndex === index;
            const blocks = isOpen ? splitFaqAnswer(item.answer) : [];
            const hasBullets = blocks.some((b) => b.type === "bullet");
            return (
              <div key={`${item.question}-${index}`} className="overflow-hidden rounded-xl border border-emerald-800/50 bg-emerald-900/40">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[12px] font-bold text-emerald-950">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-stone-100">{item.question}</span>
                  </span>
                  <span className="text-amber-400 text-xl">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen ? (
                  <div className="px-5 pb-5">
                    <div className="space-y-2">
                      {blocks.map((block, bi) =>
                        block.type === "bullet" ? (
                          <div key={bi} className="flex items-start gap-2">
                            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                            <p className="text-sm leading-relaxed text-stone-400">{block.text}</p>
                          </div>
                        ) : (
                          <p key={bi} className={`text-sm leading-relaxed text-stone-400 ${hasBullets ? "pl-4" : ""}`}>
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
      </div>
    </section>
  );
};

export const StarIcon = ({ filled, size = 14 }) => (
  <svg
    viewBox="0 0 20 20"
    className="inline-block"
    style={{ width: size, height: size, color: filled ? "#ffb900" : "#3f5d52", fill: "currentColor" }}
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
    <div className="mb-8 flex flex-col items-center gap-1">
      <span className={`text-5xl font-semibold text-stone-100 ${HEADING_FONT}`}>{average.toFixed(1)}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < rounded} size={20} />
        ))}
      </div>
      <span className="text-sm text-stone-400">
        {ratings.length} review{ratings.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
};

const TESTIMONIAL_MAX_CHARS = 200;

const EmeraldTestimonialCard = ({ item }) => {
  const rating = Number(item?.rating || 0);
  const text = String(item?.text || "").trim();
  const isLong = text.length > TESTIMONIAL_MAX_CHARS;
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="h-full min-h-[254px] bg-[#004f3b]/40 border border-[#006045]/50 rounded-xl p-8 flex flex-col gap-6">
      <p className="text-stone-300 text-base leading-relaxed flex-1">
        &ldquo;{expanded || !isLong ? text : `${text.slice(0, TESTIMONIAL_MAX_CHARS).trimEnd()}...`}&rdquo;
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="-mt-4 self-start text-xs font-semibold text-amber-400 hover:underline"
        >
          {expanded ? "Show less" : "View more"}
        </button>
      ) : null}
      <div className="flex items-center gap-3 border-t border-emerald-800/50 pt-5">
        <div className="w-10 h-10 rounded-full bg-amber-400 text-emerald-950 font-bold text-sm flex items-center justify-center shrink-0">
          {item?.name
            ?.split(" ")
            .map((w) => w.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?"}
        </div>
        <div>
          <p className="font-semibold text-sm text-stone-100">{item?.name}</p>
          {rating ? (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < rating} size={12} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const getTestimonialsPerView = () => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
};

// Sliding testimonials carousel, mirroring Classic/Fresh Studio/Warm Organic:
// auto-advances every 3s, pauses on hover, and loops seamlessly by appending
// the first `perView` items to the end of the track and snapping back once
// they scroll past. Falls back to a plain static grid when there aren't
// enough testimonials to fill more than one page.
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

  useEffect(() => {
    if (!isCarousel || isPaused) return;
    const timer = window.setInterval(() => setSlideIndex((prev) => prev + 1), 3000);
    return () => window.clearInterval(timer);
  }, [isCarousel, isPaused]);

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

  if (!isCarousel) {
    return (
      <div>
        <OverallRating testimonials={testimonials} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((item, idx) => (
            <EmeraldTestimonialCard key={item?.key || idx} item={item} />
          ))}
        </div>
        {showWriteReview && onOpenReview ? (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={onOpenReview}
              className="text-sm font-medium text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
            >
              Write a review →
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  const slideWidth = 100 / perView;
  const dotIndex = slideIndex % total;

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
              <EmeraldTestimonialCard item={item} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setTransition(true);
              setSlideIndex(i);
            }}
            aria-label={`Go to testimonial ${i + 1}`}
            className="h-1.5 rounded-full transition-all"
            style={{ width: i === dotIndex ? 24 : 6, backgroundColor: i === dotIndex ? "#fbbf24" : "rgba(255,255,255,0.18)" }}
          />
        ))}
      </div>
      {showWriteReview && onOpenReview ? (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={onOpenReview}
            className="text-sm font-medium text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
          >
            Write a review →
          </button>
        </div>
      ) : null}
    </div>
  );
};

// Same master inclusions icon set as WarmOrganicShared.jsx / FreshStudioShared.jsx
// / Nomads' own InclusionsSection.jsx / HostPanel's inclusionIcons.tsx (kept in
// sync across all three repos) — duplicated here (rather than imported) so
// this stays amber-colorable and Emerald-Studio-specific without touching the
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

export const Inclusions = ({ inclusions, title = "Inclusions" }) => {
  const enabled = (inclusions || []).filter((item) => item?.enabled !== false);
  if (!enabled.length) return null;
  return (
    <section className={`py-20 px-6 ${SECTION_BG}`}>
      <div className="max-w-7xl mx-auto">
        <LinedHeading title={title} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {enabled.map((item, index) => {
            const { label, icon } = getInclusionMeta(item);
            return (
              <div key={item?.key || index} className="flex flex-col items-center gap-2 text-center">
                <span className="text-amber-400">{icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
