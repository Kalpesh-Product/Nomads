import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { HiChevronDown, HiChevronUp, HiOutlineArrowLeft } from "react-icons/hi";
import AiAlignBox from "../../components/AiAlignBox";
import FitText from "../../components/FitText";
import GetStartedButton from "../../components/GetStartedButton";
import FinanceImage from "../../assets/images-service/finance-final.png";
import useIsMobile from "../../hooks/useIsMobile.js";
import useHostModuleCatalog from "../../hooks/useHostModuleCatalog";
import { findModule } from "../../data/hostModulesCatalog";
import {
  ModuleDetailTile,
  planBadgeStyles,
  planLabels,
} from "../host/modules/ModuleCategoryBlock";

const PLAN_IDS = ["basic", "professional", "custom"];
const PLAN_RANK = { basic: 0, professional: 1, custom: 2 };
const PLAN_ACCESS_LABELS = {
  basic: "Basic+",
  professional: "Professional+",
  custom: "Custom only",
};
const freeBadgeStyles = "border border-emerald-200 bg-emerald-50 text-emerald-700";
const DASHBOARD_MODULE_BY_PLAN = {
  basic: "dashboard",
  professional: "professional-dashboard",
  custom: "custom-dashboard",
};
const INITIAL_CARD_COUNT = 8;
const MODULES_SCROLL_KEY = "aihost-modules-list-scroll";

const findScrollAncestor = (el) => {
  let node = el?.parentElement;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if ((style.overflowY === "auto" || style.overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};
const verticalBadgeStyles = "border border-sky-200 bg-sky-50 text-sky-700";

const planIncludesModule = (moduleOrPlan, activePlan) => {
  const modulePlan =
    typeof moduleOrPlan === "string" ? moduleOrPlan : moduleOrPlan?.plan;
  if (typeof moduleOrPlan === "object" && moduleOrPlan?.planAccessMode === "exact") {
    return modulePlan === activePlan;
  }
  return (PLAN_RANK[modulePlan] ?? 0) <= (PLAN_RANK[activePlan] ?? 0);
};

const ModuleCard = ({ module, onClick }) => {
  const Icon = module.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[8.5rem] flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary-blue hover:shadow-md sm:min-h-[9rem]"
    >
      <div className="flex items-start gap-2">
        {Icon && <Icon size={20} className="mt-0.5 shrink-0 text-primary-blue" />}
        <span className="text-base font-semibold leading-snug text-secondary-dark md:text-lg">
          {module.label}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase ${planBadgeStyles[module.plan] || ""}`}
        >
          {PLAN_ACCESS_LABELS[module.plan] || module.plan}
        </span>
        {module.plan === "basic" && (
          <span className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase ${freeBadgeStyles}`}>
            Free
          </span>
        )}
        {module.verticals?.map((vertical) => (
          <span
            key={vertical}
            className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase ${verticalBadgeStyles}`}
          >
            {vertical} vertical
          </span>
        ))}
      </div>
      {module.summary && (
        <p className="line-clamp-2 text-xs leading-relaxed text-secondary-dark sm:text-sm">
          {module.summary}
        </p>
      )}
    </button>
  );
};

export default function Modules() {
  const navigate = useNavigate();
  const { categories } = useHostModuleCatalog({ liveRefresh: true });
  const { key: locationKey } = useLocation();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [expandedCategories, setExpandedCategories] = useState({});
  const rootRef = useRef(null);

  const categoryParam = searchParams.get("category");
  const moduleParam = searchParams.get("module");
  const requestedPlan = searchParams.get("plan");
  const activePlan = PLAN_IDS.includes(requestedPlan) ? requestedPlan : "basic";
  const orderedCategories = useMemo(
    () => [
      ...categories.filter((category) => category.id === "key-apps"),
      ...categories.filter((category) => category.id !== "key-apps"),
    ],
    [categories],
  );
  const resolved = moduleParam
    ? findModule(categoryParam, moduleParam, categories)
    : null;
  const activeModule = resolved ? resolved.parent || resolved.module : null;
  const onBack = () =>
    locationKey !== "default" ? navigate(-1) : navigate("/modules");

  const categoriesForPlan = useMemo(
    () =>
      orderedCategories
        .map((category) => ({
          ...category,
          modules: category.modules.filter((module) =>
            planIncludesModule(module, activePlan),
          ),
        }))
        .filter((category) => category.modules.length > 0),
    [activePlan, orderedCategories],
  );
  const requiredPlan = activeModule?.plan || resolved?.module?.plan || "basic";
  const moduleAvailable = activeModule
    ? planIncludesModule(activeModule, activePlan)
    : true;
  const availablePlans = activeModule?.planAccessMode === "exact"
    ? [requiredPlan]
    : PLAN_IDS.filter((plan) => PLAN_RANK[plan] >= PLAN_RANK[requiredPlan]);

  useEffect(() => setExpandedCategories({}), [activePlan]);

  // Restore the modules-list scroll position when coming back from a module's
  // detail page (back button or the "Modules" breadcrumb), instead of always
  // landing back at the top of the list.
  useEffect(() => {
    if (resolved) return;
    const saved = sessionStorage.getItem(MODULES_SCROLL_KEY);
    if (saved == null) return;
    sessionStorage.removeItem(MODULES_SCROLL_KEY);
    const scroller = findScrollAncestor(rootRef.current);
    if (!scroller) return;
    requestAnimationFrame(() => {
      scroller.scrollTop = Number(saved);
    });
  }, [resolved]);

  const buildPlanHref = (plan) => {
    if (!resolved) return `/modules?plan=${plan}`;
    if (Object.values(DASHBOARD_MODULE_BY_PLAN).includes(activeModule.id)) {
      return `/modules?plan=${plan}&category=common-modules&module=${DASHBOARD_MODULE_BY_PLAN[plan]}`;
    }
    return `/modules?plan=${plan}&category=${resolved.category.id}&module=${activeModule.id}`;
  };

  const navigateToPlan = (plan) =>
    navigate(buildPlanHref(plan), { state: { preserveScroll: true } });

  const breadcrumbItems = resolved
    ? [
        { label: "Modules", href: `/modules?plan=${activePlan}` },
        { label: activeModule.label, href: null },
        { label: `${planLabels[activePlan]} Plan`, href: null },
      ]
    : [{ label: "Modules", href: null }];

  const detailTiles = activeModule?.children?.length
    ? activeModule.children.filter((child) =>
        planIncludesModule(
          {
            ...child,
            plan: child.plan || requiredPlan,
            planAccessMode: child.planAccessMode || activeModule.planAccessMode,
          },
          activePlan,
        ),
      )
    : activeModule
      ? [activeModule]
      : [];

  return (
    <div
      ref={rootRef}
      className="-mx-1 w-[calc(100%+0.5rem)] overflow-x-clip text-secondary-dark md:-mx-6 md:w-[calc(100%+3rem)] lg:-mx-10 lg:w-[calc(100%+5rem)] xl:-mx-24 xl:w-[calc(100%+12rem)]"
    >
      <div className="sticky top-0 isolate z-[100] -mt-px bg-white">
        <AiAlignBox>
          <div className="flex h-11 w-full min-w-0 items-center gap-2 bg-white py-1.5 pb-3 md:pb-4">
            <button
              type="button"
              onClick={onBack}
              className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-500 bg-white text-sky-500 transition-colors hover:bg-sky-50 md:ml-0"
              aria-label="Go back"
            >
              <HiOutlineArrowLeft size={18} />
            </button>
            <nav
              className="flex min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap text-xs text-primary-blue [scrollbar-width:none] sm:text-sm md:text-base [&::-webkit-scrollbar]:hidden"
              aria-label="Breadcrumb"
            >
              {breadcrumbItems.map((item, index) => (
                <Fragment key={`${item.label}-${index}`}>
                  {index > 0 && (
                    <span className="mx-1 shrink-0 md:mx-2" aria-hidden="true">
                      {">"}
                    </span>
                  )}
                  {item.href ? (
                    <button
                      type="button"
                      onClick={() => navigate(item.href)}
                      className="shrink-0 text-primary-blue transition-colors hover:text-primary-dark"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span
                      className={
                        index === breadcrumbItems.length - 1
                          ? "min-w-0 truncate align-bottom"
                          : "shrink-0 text-primary-blue"
                      }
                      title={item.label}
                      aria-current={index === breadcrumbItems.length - 1 ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </Fragment>
              ))}
            </nav>
          </div>
        </AiAlignBox>
      </div>

      <AiAlignBox>
        {!resolved && (
          <>
            <section className="flex w-full flex-col gap-8 px-3 pt-5 sm:px-0 sm:pt-7">
              <div className="flex flex-col gap-5 sm:gap-8">
                <h1 className="text-pretty text-left font-comic text-2xl font-semibold leading-[1.25] text-secondary-dark sm:hidden">
                  The ONLY Nomad Ecosystem SaaS Platform!
                </h1>
                <div className="hidden sm:block">
                  <FitText
                    as="h1"
                    text="The ONLY Nomad Ecosystem SaaS Platform!"
                    className="font-semibold font-comic"
                    minFontSize={18}
                    maxFontSize={56}
                  />
                </div>
                <p className="text-[0.95rem] leading-7 text-secondary-dark sm:text-lg sm:leading-8 md:text-center lg:text-[1.45rem] lg:leading-[2.75rem] 2xl:text-left">
                  No Code Website <span className="text-primary-blue">+</span> Booking Engine{" "}
                  <span className="text-primary-blue">+</span> Payment Gateway{" "}
                  <span className="text-primary-blue">+</span> Accounting{" "}
                  <span className="text-primary-blue">+</span> Reports{" "}
                  <span className="text-primary-blue">+</span> Analytics{" "}
                  <span className="text-primary-blue">+</span> HR Support{" "}
                  <span className="text-primary-blue">+</span> Customer & Client Management{" "}
                  <span className="text-primary-blue">+</span> Marketing and more.
                </p>
                <div className="flex items-center justify-center sm:justify-end">
                  <GetStartedButton
                    title="Get Started"
                    handleSubmit={() => navigate("/signup?step=1")}
                  />
                </div>
              </div>
              <hr className="border-t-4" />
            </section>

            <section className="flex flex-col gap-4 px-3 py-0 sm:px-0 lg:py-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                <div className="flex flex-col gap-2">
                  <div className="relative my-3 flex w-full flex-col text-card-title font-medium md:text-3xl">
                    Real-time operations
                    <img
                      src="/blue-line.png"
                      alt=""
                      className="h-6 w-3/4 md:w-1/4"
                    />
                  </div>
                  {isMobile && (
                    <div className="h-[30vh] overflow-hidden rounded-lg border border-gray-100 p-2 md:h-[35vh]">
                      <img
                        className="h-full w-full object-cover"
                        src={FinanceImage}
                        alt="Host operations dashboard"
                      />
                    </div>
                  )}
                  <span className="text-[17px] md:text-[19px]">
                    Manage your business in real-time across all business verticals.
                  </span>
                  <span className="text-[17px] md:text-[18px]">
                    Operate your business in real-time with the micro most details
                    of inventory, bookings, accounts, analytics, leads, sales,
                    reports, tasks, logs, menu, complaints, requests etc.
                  </span>
                </div>
                {!isMobile && (
                  <div className="h-[35vh] overflow-hidden rounded-lg border border-gray-100 p-2 lg:h-[50vh]">
                    <img
                      className="h-full w-full object-cover"
                      src={FinanceImage}
                      alt="Host operations dashboard"
                    />
                  </div>
                )}
              </div>
              <hr className="mb-2 border-t-4 lg:mt-10" />
            </section>
          </>
        )}

        <div className="sticky top-11 z-[90] border-b border-gray-100 bg-white py-2.5 sm:py-3 lg:py-4">
          <div className="flex justify-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:gap-3 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {(resolved ? availablePlans : PLAN_IDS).map((plan) => (
              <button
                key={plan}
                type="button"
                onClick={() => navigateToPlan(plan)}
                className={`min-h-9 shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors sm:px-6 sm:text-sm ${
                  activePlan === plan
                    ? "border-secondary-dark bg-secondary-dark text-white"
                    : "border-gray-200 bg-white text-secondary-dark/70 hover:border-primary-blue"
                }`}
              >
                {planLabels[plan]}
              </button>
            ))}
          </div>
        </div>

        {!resolved ? (
          <section className="flex w-full flex-col gap-8 py-4 sm:gap-10 sm:py-6 lg:py-8">
            {categoriesForPlan.map((category) => {
              const expanded = Boolean(expandedCategories[category.id]);
              const visibleModules = expanded
                ? category.modules
                : category.modules.slice(0, INITIAL_CARD_COUNT);
              const hasMoreModules = category.modules.length > INITIAL_CARD_COUNT;

              return (
                <div key={category.id} className="flex flex-col gap-3 sm:gap-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-dark/55 sm:text-sm">
                    {category.label}
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-5">
                    {visibleModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        onClick={() => {
                          const scroller = findScrollAncestor(rootRef.current);
                          if (scroller) {
                            sessionStorage.setItem(MODULES_SCROLL_KEY, String(scroller.scrollTop));
                          }
                          navigate(
                            `/modules?plan=${activePlan}&category=${category.id}&module=${module.id}`,
                          );
                        }}
                      />
                    ))}
                  </div>
                  {hasMoreModules && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCategories((current) => ({
                            ...current,
                            [category.id]: !expanded,
                          }))
                        }
                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-secondary-dark transition-colors hover:border-primary-blue hover:text-primary-blue"
                        aria-expanded={expanded}
                      >
                        {expanded
                          ? "View less"
                          : `View more (${category.modules.length - INITIAL_CARD_COUNT})`}
                        {expanded ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        ) : moduleAvailable ? (
          <section className="flex w-full flex-col gap-8 py-4 sm:py-6 lg:gap-10 lg:py-8">
            <div className="flex flex-col items-start gap-2 text-xs text-secondary-dark/60 sm:flex-row sm:flex-wrap sm:items-center sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-secondary-dark/75">Available in:</span>
                {availablePlans.map((plan) => (
                  <span
                    key={plan}
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${planBadgeStyles[plan] || ""}`}
                  >
                    {planLabels[plan]}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:ml-2">
                <span className="font-medium text-secondary-dark/75">
                  Available in verticals:
                </span>
                {activeModule.verticals?.length > 0 ? (
                  activeModule.verticals.map((vertical) => (
                    <span
                      key={vertical}
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${verticalBadgeStyles}`}
                    >
                      {vertical}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-secondary-dark/65">
                    All verticals
                  </span>
                )}
              </div>
            </div>
            {activeModule.children?.length > 0 && (
              <div className="border-b border-gray-200 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold text-secondary-dark sm:text-2xl">
                    {activeModule.label}
                  </h1>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${planBadgeStyles[requiredPlan] || ""}`}
                  >
                    {PLAN_ACCESS_LABELS[requiredPlan]}
                  </span>
                  {requiredPlan === "basic" && (
                    <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${freeBadgeStyles}`}>
                      Free
                    </span>
                  )}
                </div>
                {activeModule.summary && (
                  <p className="mt-2 max-w-4xl text-sm leading-relaxed text-secondary-dark sm:text-base">
                    {activeModule.summary}
                  </p>
                )}
              </div>
            )}
            {detailTiles.map((tile, index) => (
              <div
                key={tile.id}
                className={index > 0 ? "border-t border-gray-200 pt-8 lg:pt-10" : ""}
              >
                <ModuleDetailTile
                  tile={{
                    ...tile,
                    plan: tile.plan || requiredPlan,
                    verticals: activeModule.children?.length ? tile.verticals : undefined,
                  }}
                  planBadgeLabel={PLAN_ACCESS_LABELS[tile.plan || requiredPlan]}
                />
              </div>
            ))}
          </section>
        ) : (
          <section className="mx-auto my-8 w-full max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 px-5 py-10 text-center sm:px-8">
            <h1 className="text-xl font-semibold text-secondary-dark sm:text-2xl">
              {activeModule.label} is not included in the {planLabels[activePlan]} Plan
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-secondary-dark sm:text-base">
              Select the {planLabels[requiredPlan]} Plan or a higher plan to view this module and its included pages.
            </p>
            <button
              type="button"
              onClick={() => navigateToPlan(requiredPlan)}
              className="mt-6 rounded-full bg-secondary-dark px-6 py-2.5 text-sm font-medium text-white"
            >
              View {planLabels[requiredPlan]} Plan
            </button>
          </section>
        )}
      </AiAlignBox>
    </div>
  );
}
