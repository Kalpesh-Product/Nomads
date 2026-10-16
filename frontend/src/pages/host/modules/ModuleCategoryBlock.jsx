const planBadgeStyles = {
  basic: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  professional: "bg-blue-50 text-blue-700 border border-blue-200",
  custom: "bg-purple-50 text-purple-700 border border-purple-200",
};
const planLabels = { basic: "Basic", professional: "Professional", custom: "Custom" };
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
        const Icon = tile.icon;
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
              </div>
            )}
            <div id={tile.id} className="flex flex-col lg:flex-row gap-8 items-start w-full scroll-mt-24">
              <div className="flex-1 flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  {Icon && <Icon size={22} className="text-primary-blue shrink-0" />}
                  <h3 className="text-lg md:text-xl font-semibold text-secondary-dark">
                    {tile.label}
                  </h3>
                  {!tile.parentLabel && tile.plan && (
                    <span
                      className={`text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${planBadgeStyles[tile.plan] || ""}`}
                    >
                      {planLabels[tile.plan] || tile.plan}
                    </span>
                  )}
                </div>
                <p className="text-sm md:text-base text-secondary-dark/90">{tile.summary}</p>
                {tile.bullets && (
                  <ul className="flex flex-col gap-1.5 mt-1">
                    {tile.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img
                  src={tile.image}
                  alt={tile.label}
                  className="h-[16rem] md:h-[20rem] w-full object-contain"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModuleCategoryBlock;
