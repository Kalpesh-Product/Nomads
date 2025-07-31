// components/Container.tsx
const Container = ({ children, className = "", padding=true }) => {
  return (
    <div
      className={`max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-0  ${
        padding ? "lg:py-16" : "lg:py-0"
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
