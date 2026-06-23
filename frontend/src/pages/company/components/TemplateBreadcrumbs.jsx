import React from "react";

const TemplateBreadcrumbs = ({ items = [], className = "" }) => {
  if (!Array.isArray(items) || items.length <= 1) return null;

  return (
    <div className={` px-4 py-2 text-[12px] text-slate-600 md:px-6 ${className}`}>
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 overflow-x-auto whitespace-nowrap py-1">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <span aria-hidden="true" className="text-slate-400">
                  &rsaquo;
                </span>
              ) : null}

              {item.onClick && !isCurrent ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-slate-600 transition hover:text-black"
                >
                  {item.label}
                </button>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={isCurrent ? "font-semibold text-black" : ""}
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateBreadcrumbs;
