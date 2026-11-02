import { createElement, useId } from "react";

const CharacterLimitedField = ({ as: Component = "input", ...props }) => {
  const countId = useId();
  const characterCount = String(props.value ?? "").length;
  const remaining = props.maxLength - characterCount;
  const nearLimit = remaining <= Math.ceil(props.maxLength * 0.1);
  const describedBy = [props["aria-describedby"], characterCount > 0 && countId]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="min-w-0">
      {createElement(Component, { ...props, "aria-describedby": describedBy })}
      {characterCount > 0 && <p
        id={countId}
        className={`mt-1.5 text-right text-xs tabular-nums ${
          nearLimit ? "font-medium text-amber-700" : "text-slate-500"
        }`}
      >
        {characterCount}/{props.maxLength}
      </p>}
    </div>
  );
};

export default CharacterLimitedField;
