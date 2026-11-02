export default function DetailIconButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-gray-400 hover:text-gray-900 disabled:cursor-wait ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
