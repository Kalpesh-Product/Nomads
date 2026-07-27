const CategoryShortcutSkeletons = ({
  count = 11,
  itemClassName,
  iconBoxClassName,
  labelClassName,
}) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`category-shortcut-skeleton-${index}`}
        className={itemClassName}
        aria-hidden="true"
      >
        <div className="flex min-h-[3.5rem] w-full flex-col items-center justify-start gap-1">
          <div
            className={`${iconBoxClassName} animate-pulse rounded-md bg-gray-200/80`}
          />
          <div
            className={`${labelClassName} h-2.5 animate-pulse rounded-full bg-gray-200/80`}
          />
        </div>
      </div>
    ))}
  </>
);

export default CategoryShortcutSkeletons;
