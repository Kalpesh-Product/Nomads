import { createElement, useId } from "react";

const CharacterLimitedField = ({ as: Component = "input", ...props }) => {
  const countId = useId();
  const remaining = props.maxLength - String(props.value ?? "").length;
  const nearLimit = remaining <= Math.ceil(props.maxLength * 0.1);
  const describedBy = [props["aria-describedby"], countId].filter(Boolean).join(" ");

  return (
    <div className="min-w-0">
      {createElement(Component, { ...props, "aria-describedby": describedBy })}
      <p
        id={countId}
        className={`mt-1.5 flex flex-wrap justify-between gap-x-3 text-xs tabular-nums ${
          nearLimit ? "font-medium text-amber-700" : "text-slate-500"
        }`}
      >
        <span>
          {remaining < 0
            ? `${Math.abs(remaining).toLocaleString()} characters over limit`
            : `${remaining.toLocaleString()} characters remaining`}
        </span>
        <span>{props.maxLength.toLocaleString()} max</span>
      </p>
    </div>
  );
};

export default CharacterLimitedField;
