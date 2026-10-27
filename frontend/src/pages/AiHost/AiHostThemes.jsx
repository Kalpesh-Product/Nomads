import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "motion/react";
import { FiArrowUpRight, FiCheck, FiMonitor, FiSmartphone } from "react-icons/fi";
import { HiOutlineArrowLeft } from "react-icons/hi";
import DeviceMockup from "../../components/DeviceMockup";
import {
  buildVerticalFilters,
  previewHref,
} from "../../constants/verticalTemplateCatalog";
import { useWebsiteThemeCatalog } from "../../hooks/useWebsiteThemeCatalog";
import { nearestColorName } from "../../utils/colorName";

const categoryLabel = (tag, filters) =>
  filters.find((filter) => filter.value === tag)?.label || tag;

// Rendered twice: full-size in its normal spot on the page, and compact once
// docked into the top bar on scroll — same filters, same click handler.
const FilterPills = ({ filters, active, onSelect, compact = false, mobileGrid = false }) => (
  <>
    {filters.map((filter) => {
      const isActive = active === filter.value;
      return (
        <button
          key={filter.value}
          type="button"
          aria-pressed={isActive}
          onClick={() => onSelect(filter.value)}
          className={`shrink-0 whitespace-nowrap rounded-full font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue ${
            compact
              ? "px-3.5 py-1.5 text-xs"
              : mobileGrid
                ? "px-1.5 py-2 text-[11px] min-[390px]:px-2 min-[390px]:text-xs sm:px-4 sm:text-sm"
                : "px-4 py-2 text-sm"
          } ${
            isActive ? "bg-black text-white" : "bg-[#f1f1f3] text-black/65 hover:bg-black/10 hover:text-black"
          }`}
        >
          {filter.label}
        </button>
      );
    })}
  </>
);

const proofPoints = [
  {
    number: "01",
    title: "Built for your business",
    description:
      "Start with booking, menus, rooms or workspaces already shaped around the way you operate.",
  },
  {
    number: "02",
    title: "Responsive by default",
    description:
      "Every theme is designed and tested across desktop and mobile before you add your content.",
  },
  {
    number: "03",
    title: "Ready to make yours",
    description:
      "Bring in your brand, images and colors without rebuilding the experience from the beginning.",
  },
];

const ThemeCard = ({ template, index, onSelect, filters }) => {
  const comingSoon = template.status === "coming-soon";

  const openTemplate = () => {
    if (!comingSoon) onSelect(template);
  };

  return (
    <Motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.38, delay: Math.min(index * 0.045, 0.2) }}
      onClick={openTemplate}
      className={`group flex w-full max-w-[380px] flex-col overflow-hidden border border-black/10 bg-white sm:w-[calc(50%-0.625rem)] xl:w-[calc(33.333%-1.167rem)] ${comingSoon ? "" : "cursor-pointer"}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#ebeae5]">
        {template.heroImage ? (
          <picture>
            {template.heroImageMobile ? <source media="(max-width: 639px)" srcSet={template.heroImageMobile} /> : null}
            <img
              src={template.heroImage}
              alt={`${template.name} website theme preview`}
              loading={index > 1 ? "lazy" : "eager"}
              className={`h-full w-full object-cover object-top transition-transform duration-700 ease-out ${comingSoon ? "grayscale-[25%]" : "group-hover:scale-[1.025]"}`}
            />
          </picture>
        ) : (
          <div className="flex h-full items-center justify-center bg-black text-center text-white">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Coming soon</p><p className="mt-3 text-3xl font-semibold">{template.name}</p></div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/50">
              {categoryLabel(template.tag, filters)}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-secondary-dark">
              {template.name}
            </h3>
          </div>
          <div className="flex shrink-0 gap-1.5 pt-1" aria-label={`${template.name} color palette`}>
            {[template.swatch.bg, template.swatch.fg, template.swatch.accent].map((color) => (
              <span
                key={color}
                title={nearestColorName(color)}
                className="h-3 w-3 rounded-full border border-black/15"
                style={{ backgroundColor: color }}
                role="img"
                aria-label={nearestColorName(color)}
              />
            ))}
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-black/65">
          {template.description}
        </p>

        {comingSoon ? (
          <p className="mt-auto pt-6 text-center text-lg font-semibold text-primary-blue">{template.disabledReason || "More details coming soon"}</p>
        ) : <div className="mt-auto flex flex-wrap items-center justify-center gap-3 pt-6">
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onSelect(template); }}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
          >
            View theme
          </button>
          <a
            href={previewHref(template)}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/20 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:border-black hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
          >
            Preview
            <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>}

        <div className="mt-6 flex items-center gap-4 border-t border-black/10 pt-4 text-xs font-medium text-black/50">
          <span className="inline-flex items-center gap-1.5">
            <FiMonitor aria-hidden="true" /> Desktop
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiSmartphone aria-hidden="true" /> Mobile
          </span>
        </div>
      </div>
    </Motion.article>
  );
};

const Themes = () => {
  const navigate = useNavigate();
  const { key: locationKey } = useLocation();
  const topBarRef = useRef(null);
  const inlineFilterRef = useRef(null);
  const gridRef = useRef(null);
  const filtersDockedRef = useRef(false);
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [filtersDocked, setFiltersDocked] = useState(false);
  // The top bar is sticky only while there's still a grid of cards under it to
  // filter — once you've scrolled past the last live card (into proof points,
  // footer, etc.) there's nothing left for the filters to act on, so it's
  // released back into normal flow instead of floating over unrelated content.
  const [filtersActive, setFiltersActive] = useState(true);
  const { themes, isPending: isCatalogPending } = useWebsiteThemeCatalog({ liveRefresh: true });
  const verticalFilters = buildVerticalFilters(themes);
  const liveThemes = themes.filter((template) => template.status !== "coming-soon");
  const featuredTemplate = liveThemes.find((template) => template.featured) || liveThemes[0] || themes[0];
  const filteredTemplates =
    verticalFilter === "all"
      ? themes
      : themes.filter((template) => template.tag === verticalFilter);
  // Coming-soon templates get their own callout below instead of sitting
  // in the grid as disabled cards mixed in among the live, clickable ones.
  const liveFilteredTemplates = filteredTemplates.filter((template) => template.status !== "coming-soon");
  const comingSoonFilteredTemplates = filteredTemplates.filter((template) => template.status === "coming-soon");

  const viewTemplate = (template) => {
    navigate("/product", { state: { template } });
  };

  // The filters live in their normal spot on the page (full size, next to the
  // grid) until scrolling would make them collide with the sticky top bar —
  // at that point they dock into the same row as "Themes" instead of stacking
  // a second bar below it. The inline copy just scrolls out of view as usual;
  // only the docked copy in the top bar needs visibility driven by scroll.
  useEffect(() => {
    const inline = inlineFilterRef.current;
    const bar = topBarRef.current;
    if (!inline || !bar) return;

    let node = inline.parentElement;
    while (node && node !== document.body) {
      const style = getComputedStyle(node);
      if ((style.overflowY === "auto" || style.overflowY === "scroll") && node.scrollHeight > node.clientHeight) break;
      node = node.parentElement;
    }
    const scrollTarget = node && node !== document.body ? node : window;

    // Deliberately no manual rAF/"ticking" throttle here: that pattern sets a
    // flag before the animation frame fires and only clears it inside the
    // frame callback. If a single frame is ever dropped — the tab losing
    // visibility mid-scroll is enough — the flag never clears and every
    // future scroll event is silently ignored for the rest of the page's
    // life. getBoundingClientRect() x2 + a setState is cheap enough to just
    // run directly on every scroll event.
    const checkDocked = () => {
      const barHeight = bar.getBoundingClientRect().height;
      const inlineTop = inline.getBoundingClientRect().top;
      // Keep a small release buffer after docking. Without it, a sub-pixel
      // layout change at the exact crossover can repeatedly dock/undock the
      // pills while the user is making one continuous scroll gesture.
      const shouldDock = filtersDockedRef.current
        ? inlineTop <= barHeight + 12
        : inlineTop <= barHeight;
      if (shouldDock !== filtersDockedRef.current) {
        filtersDockedRef.current = shouldDock;
        setFiltersDocked(shouldDock);
      }

      const grid = gridRef.current;
      if (grid) {
        // Once the grid's bottom edge has scrolled above where the sticky bar
        // sits, no cards are left below it to filter — release the stickiness.
        setFiltersActive(grid.getBoundingClientRect().bottom > barHeight);
      }
    };
    checkDocked();
    scrollTarget.addEventListener("scroll", checkDocked, { passive: true });
    return () => scrollTarget.removeEventListener("scroll", checkDocked);
  }, []);

  // The filter bar is sticky so it's always clickable, but if you're scrolled
  // past the grid (proof points, footer), picking a new vertical silently
  // changes content off-screen. Nudge the scroll so the grid sits just below
  // the filter bar once it's safe to measure.
  //
  // Three gotchas, each found the hard way:
  // 1. This layout scrolls inside AiHostLayout's content wrapper
  //    (overflow-auto), not the browser window — window.scrollY is always 0
  //    here and window.scrollTo() is a silent no-op. Have to walk up to the
  //    actual scrolling ancestor and adjust its scrollTop instead.
  // 2. Can't correct on a timer: the grid shrinks progressively as Framer
  //    Motion's exit animation plays, and scrolling WHILE that's running
  //    fights the animation back — moving the grid in and out of view seems
  //    to stall/starve its exit transitions, leaving removed cards stuck
  //    mid-exit instead of actually leaving the DOM. AnimatePresence's
  //    onExitComplete fires exactly once, right when every exiting card has
  //    actually finished, which is the only reliable "safe to measure now".
  // 3. Target the grid's position, not the sticky filter bar's: once you're
  //    scrolled near/past the end of a short filtered result (few cards, so
  //    little trailing content below it), the sticky bar's own rect can
  //    report itself as already "stuck" at the right offset while the grid
  //    sitting right below it in normal flow is still hundreds of pixels
  //    above the viewport — sticky's bookkeeping doesn't track its siblings.
  //    The grid is normal flow, so its rect is always trustworthy.
  const correctFilterScroll = () => {
    // onExitComplete is a Framer Motion callback, not a React commit — fires
    // once the exit animation is logically done, but not guaranteed to be
    // after the browser has actually painted that final state. Wait a couple
    // of frames so getBoundingClientRect() below reflects settled layout.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const grid = gridRef.current;
      const bar = topBarRef.current;
      if (!grid || !bar) return;
      const BREATHING_ROOM = 85; // a little gap below the bar so card buttons aren't flush against it
      const targetTop = bar.getBoundingClientRect().height + BREATHING_ROOM;
      const delta = grid.getBoundingClientRect().top - targetTop;
      if (Math.abs(delta) <= 1) return;
      let node = grid.parentElement;
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        if ((style.overflowY === "auto" || style.overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
          node.scrollTop += delta;
          return;
        }
        node = node.parentElement;
      }
      window.scrollTo({ top: window.scrollY + delta, behavior: "auto" });
    }));
  };

  return (
    <div className="text-secondary-dark">
      <div
        ref={topBarRef}
        className={`isolate z-[100] -mx-1 -mt-px w-[calc(100%+0.5rem)] bg-white pt-px md:-mx-6 md:w-[calc(100%+3rem)] lg:-mx-10 lg:w-[calc(100%+5rem)] xl:-mx-24 xl:w-[calc(100%+12rem)] ${filtersActive ? "sticky top-0" : ""}`}
      >
        <div className="px-3 md:px-8 lg:px-10 xl:px-12 2xl:px-14">
          <div className="flex h-11 w-full min-w-0 items-center gap-2 bg-white pb-4 shadow-none md:px-10">
            <button
              type="button"
              onClick={() => (locationKey !== "default" ? navigate(-1) : navigate("/"))}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-500 bg-white text-sky-500 transition-colors hover:bg-sky-50"
              aria-label="Go back"
            >
              <HiOutlineArrowLeft size={18} />
            </button>
            <span className={`shrink-0 text-lg font-medium text-primary-blue ${filtersDocked ? "hidden sm:inline" : ""}`}>Themes</span>
            {filtersDocked ? (
              <>
                <span className="hidden h-5 w-px shrink-0 bg-black/10 sm:block" aria-hidden="true" />
                {/* justify-start, not -center: centering an overflowing flex row
                    makes the browser clip equally from both ends at scrollLeft 0,
                    so the FIRST pills ("All", "Cafe") were invisible by default
                    and you'd land mid-list instead of at the start. */}
                <div className="relative min-w-0 flex-1 overflow-hidden bg-white">
                  <div className="flex items-center justify-start gap-2 overflow-x-auto pr-6 custom-scrollbar-hide sm:justify-center sm:pr-0">
                    <FilterPills filters={verticalFilters} active={verticalFilter} onSelect={setVerticalFilter} compact />
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" aria-hidden="true" />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[80rem]">
        <div className="grid items-center gap-8 px-6 py-10 sm:py-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:gap-8 lg:py-10 xl:py-12">
          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-2xl"
          >
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-primary-blue">
              Website themes by WoNo
            </p>
            <h1 className="text-[clamp(2.5rem,4.2vw,4.65rem)] font-medium leading-[0.94] tracking-[-0.055em] text-secondary-dark">
              Start with a site that already feels right.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-black/65 sm:text-lg">
              Explore real, working website experiences shaped for cafés, stays, workspaces and meeting rooms.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/signup?step=1")}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-blue"
              >
                Start building
              </button>
              <a
                href="#theme-library"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/20 px-6 py-3 text-sm font-semibold text-black transition-colors hover:border-black hover:bg-black hover:text-white"
              >
                Explore themes
              </a>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-black/55">
              <FiCheck className="text-primary-blue" aria-hidden="true" />
              {liveThemes.length} responsive themes with live previews
            </p>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 36, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[620px]"
          >
            {isCatalogPending ? (
              <div aria-label="Loading featured theme" aria-busy="true">
                <div className="mb-4 flex items-center justify-between">
                  <span className="h-3 w-20 animate-pulse rounded-full bg-black/10" />
                  <span className="h-3 w-24 animate-pulse rounded-full bg-black/10" />
                </div>
                <div className="relative pr-[13%] sm:pr-[12%]">
                  <div className="aspect-[16/10] animate-pulse rounded-t-2xl border-[8px] border-b-0 border-gray-200 bg-[#ebeae5] sm:border-[14px]" />
                  <div className="absolute bottom-[5%] right-0 aspect-[9/19.5] w-[24%] animate-pulse rounded-[1.1rem] border-4 border-gray-200 bg-[#ebeae5] sm:bottom-[8%] sm:w-[23%] sm:rounded-[1.4rem] sm:border-[6px]" />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between text-xs font-medium uppercase tracking-[0.15em] text-black/50">
                  <span>{featuredTemplate.name}</span>
                  <span>{categoryLabel(featuredTemplate.tag, verticalFilters)}</span>
                </div>
                <DeviceMockup
                  laptopSrc={featuredTemplate.heroImage}
                  mobileSrc={featuredTemplate.heroImageMobile}
                  alt={`${featuredTemplate.name} theme`}
                />
              </>
            )}
          </Motion.div>
        </div>
      </section>

      <section id="theme-library" className="scroll-mt-24 py-10 sm:py-10 lg:py-12">
        {/* overflow-anchor: none — without it, the browser's scroll anchoring
            "helpfully" compensates for this box resizing as Framer Motion
            animates cards in/out (which keeps happening for ~0.4s after our
            own scroll correction runs), scrolling you right back to roughly
            where you started and undoing the correction. */}
        <div className="mx-auto max-w-[80rem] px-6 [overflow-anchor:none]">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-blue">Theme library</p>
              <h2 className="mt-3 max-w-3xl text-[clamp(1.75rem,8vw,4.75rem)] font-medium leading-[1] tracking-[-0.045em] text-secondary-dark sm:text-[clamp(2.25rem,4.5vw,4.75rem)]">
                <span className="block">Pick the experience</span>
                <span className="block">that fits your business.</span>
              </h2>
            </div>
            <p className="shrink-0 text-sm text-black/55" aria-live="polite">
              Showing {liveFilteredTemplates.length} {liveFilteredTemplates.length === 1 ? "theme" : "themes"}
            </p>
          </div>

          <div ref={inlineFilterRef} className="mt-9 border-y border-black/10 py-3">
            <div className="grid grid-cols-3 items-center gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3 lg:gap-4">
              <FilterPills filters={verticalFilters} active={verticalFilter} onSelect={setVerticalFilter} mobileGrid />
            </div>
          </div>

          <Motion.div layout ref={gridRef} className="mt-8 flex flex-wrap justify-center gap-5 xl:gap-7">
            <AnimatePresence mode="popLayout" onExitComplete={correctFilterScroll}>
              {liveFilteredTemplates.map((template, index) => (
                <ThemeCard
                  key={template.id}
                  template={template}
                  index={index}
                  onSelect={viewTemplate}
                  filters={verticalFilters}
                />
              ))}
            </AnimatePresence>
          </Motion.div>

          {comingSoonFilteredTemplates.length > 0 ? (
            <div className="mt-14 border-t border-black/10 pt-10">
              <div className="text-center">
                <p className="text-base font-semibold uppercase tracking-[0.2em] text-primary-blue">More coming soon</p>
                {/* <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-secondary-dark sm:text-3xl">
                  {comingSoonFilteredTemplates.length === 1
                    ? `${comingSoonFilteredTemplates[0].name} is on the way.`
                    : "More themes for this category are on the way."}
                </h3> */}
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-5 xl:gap-7">
                {comingSoonFilteredTemplates.map((template, index) => (
                  <ThemeCard
                    key={template.id}
                    template={template}
                    index={index}
                    onSelect={viewTemplate}
                    filters={verticalFilters}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-y border-black/10 py-14 sm:py-16">
        <div className="mx-auto grid max-w-[80rem] gap-10 px-6 md:grid-cols-3 md:gap-0">
          {proofPoints.map((item, index) => (
            <div
              key={item.number}
              className={`md:px-8 ${index === 0 ? "md:pl-0" : "md:border-l md:border-black/10"}`}
            >
              <span className="text-xs font-semibold tracking-[0.18em] text-primary-blue">{item.number}</span>
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.025em] text-secondary-dark">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-black/60">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-10 lg:py-10">
        <div className="mx-auto flex max-w-[80rem] flex-col items-start justify-between gap-8 bg-white p-7 sm:p-10 lg:flex-row lg:items-end lg:p-14">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-blue">Your website, your way</p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.5vw,4.5rem)] font-medium leading-[1] tracking-[-0.045em] text-secondary-dark">
              Choose a strong starting point. Make every detail yours.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/signup?step=1")}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2"
          >
            Start building
            <FiArrowUpRight aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Themes;
