// components/Container.tsx
const Container = ({ children, className = "", padding = true }) => {
  return (
    <div
      className={`min-w-[83%] max-w-[85rem] lg:max-w-[80rem] mx-auto px-6 sm:px-6 lg:px-0  ${
        padding ? "lg:py-16 py-10" : "lg:py-0 py-0"
      } ${className}`}>
      {children}
    </div>
  );
};

export default Container;
