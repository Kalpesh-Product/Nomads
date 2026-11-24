export const planBadgeStyles = {
  basic: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  professional: "bg-blue-50 text-blue-700 border border-blue-200",
  custom: "bg-purple-50 text-purple-700 border border-purple-200",
};
const verticalBadgeStyles = "border border-sky-200 bg-sky-50 text-sky-700";
export const planLabels = { basic: "Basic", professional: "Professional", custom: "Custom" };
const freeBadgeStyles = "bg-emerald-50 text-emerald-700 border border-emerald-200";
const planOrder = { basic: 0, professional: 1, custom: 2 };

// Flattens a category's modules (including nested sub-pages like Website
// Builder > Website Leads) into one ordered list, each tile inheriting its
// parent's plan tier unless it sets its own, then sorts Basic → Professional
// → Custom so "what's included in Basic, what's an upsell" reads top to
// bottom. Every tile keeps its own id so the real site sidebar can deep-link
// straight to it.
const flattenModules = (modules, sortByPlan) => {
  const flat = modules.flatMap((module) =>
    module.children?.length
      ? module.children.map((child) => ({
          ...child,
          parentLabel: module.label,
          parentIcon: module.icon,
          plan: child.plan || module.plan,
        }))
      : [module],
  );
  return sortByPlan
    ? flat.sort((a, b) => (planOrder[a.plan] ?? 99) - (planOrder[b.plan] ?? 99))
    : flat;
};

// One module's full write-up — icon/label/plan badge, summary, bullets,
// screenshot. Shared between this category-scroll block and
// AiHostModules.jsx's single-module detail page so both stay visually
// identical without duplicating the markup.
export const ModuleDetailTile = ({ tile, planBadgeLabel }) => {
  const Icon = tile.icon;
  return (
    <div className="flex w-full flex-col items-start gap-5 sm:gap-6 lg:flex-row lg:gap-8 2xl:gap-12">
      <div className="flex w-full flex-1 flex-col gap-3 lg:basis-5/12">
        <div className="flex items-center gap-2 flex-wrap">
          {Icon && <Icon size={22} className="text-primary-blue shrink-0" />}
          <h3 className="text-lg md:text-xl font-semibold text-secondary-dark">{tile.label}</h3>
          {tile.plan && (
            <span
              className={`text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${planBadgeStyles[tile.plan] || ""}`}
            >
              {planBadgeLabel || planLabels[tile.plan] || tile.plan}
            </span>
          )}
          {tile.plan === "basic" && (
            <span className={`text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${freeBadgeStyles}`}>
              Free
            </span>
          )}
          {tile.verticals?.map((vertical) => (
            <span
              key={vertical}
              className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${verticalBadgeStyles}`}
            >
              {vertical} vertical
            </span>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-secondary-dark sm:text-base">{tile.summary}</p>
        {tile.bullets?.length > 0 && (
          <ul className="flex flex-col gap-1.5 mt-1">
            {tile.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed sm:text-base lg:text-sm 2xl:text-base">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue" />
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </div>

      {tile.image && (
        <div className="w-full flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 lg:basis-7/12">
          <img src={tile.image} alt={tile.label} className="h-auto max-h-[18rem] min-h-[13rem] w-full object-contain sm:max-h-[24rem] sm:min-h-[18rem] lg:h-[22rem] lg:max-h-none 2xl:h-[26rem]" />
        </div>
      )}
    </div>
  );
};

// One full-width page section per sidebar category (Common Modules, Extra
// Common Modules, Key Apps, Core Modules, Custom / Enterprise). Every module
// gets its own stacked block — text + plan badge on the left, screenshot on
// the right — instead of a shared tile grid. No separate in-page sidebar;
// navigation into a specific module happens from the real site sidebar,
// which scrolls straight to that module's block by id. Content comes from
// hostModulesCatalog.js.
const ModuleCategoryBlock = ({ category, sortByPlan = true }) => {
  const tiles = flattenModules(category.modules, sortByPlan);

  if (!tiles.length) return null;

  let lastGroupLabel = null;

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col relative text-card-title md:text-3xl font-medium w-full">
        {category.label}
        <img src="/blue-line.png" alt="underline" className="w-3/4 md:w-1/4 h-6" />
      </div>

      {tiles.map((tile, index) => {
        const ParentIcon = tile.parentIcon;
        const isNewGroup = Boolean(tile.parentLabel) && tile.parentLabel !== lastGroupLabel;
        lastGroupLabel = tile.parentLabel || null;

        return (
          <div key={tile.id} className="flex flex-col gap-6">
            {index > 0 && <hr className="border-gray-200" />}
            {isNewGroup && (
              <div className="flex items-center gap-2">
                {ParentIcon && (
                  <ParentIcon size={20} className="text-secondary-dark/70 shrink-0" />
                )}
                <h2 className="text-sm md:text-base font-bold uppercase tracking-wide text-secondary-dark/80">
                  {tile.parentLabel}
                </h2>
                {tile.plan && (
                  <span
                    className={`text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${planBadgeStyles[tile.plan] || ""}`}
                  >
                    {planLabels[tile.plan] || tile.plan}
                  </span>
                )}
                {tile.plan === "basic" && (
                  <span className={`text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${freeBadgeStyles}`}>
                    Free
                  </span>
                )}
              </div>
            )}
            <div id={tile.id} className="scroll-mt-24">
              <ModuleDetailTile tile={tile} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModuleCategoryBlock;
